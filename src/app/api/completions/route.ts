import { generateText } from 'ai';
import { getKimiModel } from '@/lib/ai/kimi';
import { createClient } from '@/lib/supabase/server';
import { checkTokenLimit, incrementTokenUsage } from '@/lib/billing/usage';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 15;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { allowed } = await checkTokenLimit(user.id);
  if (!allowed) return NextResponse.json({ error: 'Token limit reached' }, { status: 429 });

  const body = await req.json();
  const { prefix, suffix, language, filename } = body;

  if (!prefix) {
    return NextResponse.json({ error: 'prefix is required' }, { status: 400 });
  }

  try {
    const result = await generateText({
      model: getKimiModel('instant'),
      system: `You are an AI code completion engine. Complete the code at the cursor position.
Rules:
- Return ONLY the completion text, no explanation.
- Match the existing code style and indentation.
- Complete 1-5 lines max.
- Language: ${language || 'unknown'}
- File: ${filename || 'untitled'}`,
      prompt: `Complete this code:\n\n${prefix}<CURSOR>${suffix ? `\n${suffix}` : ''}`,
      temperature: 0.3,
      maxOutputTokens: 256,
    });

    await incrementTokenUsage(user.id, undefined, {
      promptTokens: result.usage?.inputTokens ?? 0,
      completionTokens: result.usage?.outputTokens ?? 0,
      totalTokens: (result.usage?.inputTokens ?? 0) + (result.usage?.outputTokens ?? 0),
    });

    return NextResponse.json({ completion: result.text.trim() });
  } catch (error: unknown) {
    console.error('[completions] error:', error);
    return NextResponse.json({ completion: '' });
  }
}
