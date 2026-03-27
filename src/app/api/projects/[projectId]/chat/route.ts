import { streamText } from 'ai';
import { getKimiModel, kimiConfig } from '@/lib/ai/kimi';
import { createClient } from '@/lib/supabase/server';
import { checkTokenLimit, incrementTokenUsage } from '@/lib/billing/usage';
import { buildProjectContext, formatProjectContextForAI } from '@/lib/ai/project-context';
import { withRetry } from '@/lib/ai/retry';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = 'project-files';
export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { allowed } = await checkTokenLimit(user.id);
  if (!allowed) return NextResponse.json({ error: 'Token limit reached' }, { status: 429 });

  const body = await req.json();
  const { messages, mode = 'instant', taskType } = body as {
    messages: Array<{ role: string; content: string }>;
    mode?: 'instant' | 'thinking';
    taskType?: string;
  };

  // Gather project files for context
  let projectContextStr = '';
  let filesUsed: string[] = [];
  try {
    const { data: fileList } = await supabaseAdmin.storage
      .from(BUCKET)
      .list(projectId, { limit: 100 });

    if (fileList && fileList.length > 0) {
      const fileContents: Array<{ path: string; content: string }> = [];

      for (const f of fileList) {
        if (f.name === '.keep' || !f.metadata) continue;
        const { data } = await supabaseAdmin.storage
          .from(BUCKET)
          .download(`${projectId}/${f.name}`);
        if (data) {
          const text = await data.text();
          fileContents.push({ path: f.name, content: text });
        }
      }

      // Get the latest user message for relevance scoring
      const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user');
      const query = lastUserMsg?.content ?? '';

      const ctx = buildProjectContext(fileContents, query);
      projectContextStr = formatProjectContextForAI(ctx.context, ctx.filesUsed);
      filesUsed = ctx.filesUsed;
    }
  } catch (err) {
    console.error('[project-chat] Failed to load project files:', err);
  }

  // Build system prompt
  const basePrompt = `You are APEX-CODE, a world-class AI coding assistant powered by Kimi K2.5.
You have deep expertise in all programming languages, frameworks, and system design.
Always provide working, production-ready code. Explain your reasoning clearly.`;

  const systemPrompt = basePrompt + projectContextStr;

  try {
    const result = await withRetry(async () => {
      return streamText({
        model: getKimiModel(mode),
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        })),
        system: systemPrompt,
        ...kimiConfig[mode],
        maxOutputTokens: 8192,
        onFinish: async ({ usage }) => {
          await incrementTokenUsage(user.id, undefined, {
            promptTokens: usage.inputTokens ?? 0,
            completionTokens: usage.outputTokens ?? 0,
            totalTokens: (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
          });
        },
      });
    });

    // Return with metadata about context used
    const response = result.toUIMessageStreamResponse();
    // Add context info as a custom header
    response.headers.set('X-Context-Files', JSON.stringify(filesUsed));
    response.headers.set('X-Context-File-Count', String(filesUsed.length));
    return response;
  } catch (error: unknown) {
    console.error('[project-chat] AI error:', error);
    const message = error instanceof Error ? error.message : 'AI service unavailable';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
