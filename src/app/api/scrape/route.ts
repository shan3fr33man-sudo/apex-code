import { createClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';
import { checkTokenLimit, incrementTokenUsage } from '@/lib/billing/usage';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const maxDuration = 30;

const ScrapeRequestSchema = z.object({
  url: z.string().url('Invalid URL'),
});

export async function POST(req: NextRequest) {
  // 1. Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Plan check — Pro+ only
  const { data: membership } = await supabase
    .from('memberships')
    .select('org_id, organizations(plan, plan_status)')
    .eq('user_id', user.id)
    .single();

  const org = (membership as any)?.organizations;
  if (!org || !['pro', 'team', 'enterprise'].includes(org.plan)) {
    return NextResponse.json(
      { error: 'Web scraping requires a Pro or Team plan. Please upgrade.' },
      { status: 403 }
    );
  }

  if (!['active', 'trialing'].includes(org.plan_status)) {
    return NextResponse.json(
      { error: 'Your subscription is not active.' },
      { status: 403 }
    );
  }

  // 3. Token limit check
  const { allowed } = await checkTokenLimit(user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Monthly token limit reached. Upgrade your plan.' },
      { status: 429 }
    );
  }

  // 4. Validate input
  const body = await req.json();
  const parsed = ScrapeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { url } = parsed.data;

  // 5. Check Firecrawl key
  if (!env.FIRECRAWL_API_KEY) {
    return NextResponse.json(
      { error: 'Web scraping is not configured. Contact support.' },
      { status: 503 }
    );
  }

  // 6. Call Firecrawl scrape API
  try {
    const firecrawlRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    if (!firecrawlRes.ok) {
      const errData = await firecrawlRes.json().catch(() => ({}));
      console.error('[scrape] Firecrawl error:', firecrawlRes.status, errData);
      return NextResponse.json(
        { error: `Scrape failed: ${errData.error || firecrawlRes.statusText}` },
        { status: 502 }
      );
    }

    const data = await firecrawlRes.json();
    const content = data.data?.markdown || data.data?.content || '';
    const title = data.data?.metadata?.title || url;

    // 7. Estimate token cost (roughly 1 token per 4 chars)
    const estimatedTokens = Math.ceil(content.length / 4);

    // 8. Track token usage
    await incrementTokenUsage(user.id, undefined, {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: estimatedTokens,
    });

    return NextResponse.json({
      content,
      title,
      url,
      tokens: estimatedTokens,
    });
  } catch (error) {
    console.error('[scrape] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Scrape failed' },
      { status: 500 }
    );
  }
}
