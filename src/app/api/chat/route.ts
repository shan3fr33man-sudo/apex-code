import { streamText } from 'ai';
import { getKimiModel, kimiConfig } from '@/lib/ai/kimi';
import { createClient } from '@/lib/supabase/server';
import { ChatRequestSchema } from '@/lib/api/types';
import { checkTokenLimit, incrementTokenUsage } from '@/lib/billing/usage';
import { withRetry } from '@/lib/ai/retry';
import { getAutoScrapeUrl } from '@/lib/ai/router';
import { env } from '@/lib/env';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // 1. Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Validate input
  const body = await req.json();
  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { messages, conversationId, mode = 'instant', taskType } = parsed.data;

  // 3. Check token limit
  const { allowed } = await checkTokenLimit(user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Monthly token limit reached. Upgrade your plan.' },
      { status: 429 }
    );
  }

  // 4. Auto-scrape URL if detected in last user message
  let scrapedContext = '';
  const lastUserMsg = messages.filter((m: { role: string }) => m.role === 'user').pop();
  if (lastUserMsg && env.FIRECRAWL_API_KEY) {
    const scrapeUrl = getAutoScrapeUrl(lastUserMsg.content);
    if (scrapeUrl) {
      try {
        const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: scrapeUrl,
            formats: ['markdown'],
            onlyMainContent: true,
          }),
        });
        if (scrapeRes.ok) {
          const scrapeData = await scrapeRes.json();
          const content = scrapeData.data?.markdown || '';
          if (content) {
            scrapedContext = `\n\n[Auto-scraped content from ${scrapeUrl}]:\n${content.slice(0, 8000)}`;
            // Track token cost
            await incrementTokenUsage(user.id, conversationId ?? '', {
              promptTokens: 0, completionTokens: 0,
              totalTokens: Math.ceil(content.length / 4),
            });
          }
        }
      } catch (e) {
        console.warn('[chat] Auto-scrape failed for', scrapeUrl, e);
      }
    }
  }

  // 5. Build system prompt based on task type
  const systemPrompt = buildSystemPrompt(taskType) + scrapedContext;

  // 5. Stream from Kimi K2.5
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
          await incrementTokenUsage(user.id, conversationId ?? '', {
            promptTokens: usage.inputTokens ?? 0,
            completionTokens: usage.outputTokens ?? 0,
            totalTokens: (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
          });
        },
      });
    });

    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    console.error('[chat/route] Kimi API error:', error);
    const message = error instanceof Error ? error.message : 'AI service unavailable';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

function buildSystemPrompt(taskType?: string): string {
  const base = `You are APEX-CODE, a world-class AI coding assistant powered by Kimi K2.5.
You have deep expertise in all programming languages, frameworks, and system design.
Always provide working, production-ready code. Explain your reasoning clearly.`;

  const taskPrompts: Record<string, string> = {
    'code-generation': `${base}\nFocus on writing complete, tested, production-grade code.`,
    'debugging': `${base}\nDiagnose the root cause first, then provide the exact fix with explanation.`,
    'refactoring': `${base}\nImprove code quality while preserving behavior. Show diffs clearly.`,
    'explanation': `${base}\nExplain clearly for the developer's level. Use analogies when helpful.`,
    'architecture': `${base}\nThink about scalability, maintainability, and team ergonomics.`,
  };

  return taskPrompts[taskType ?? ''] ?? base;
}
