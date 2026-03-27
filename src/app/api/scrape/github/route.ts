import { createClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';
import { checkTokenLimit, incrementTokenUsage } from '@/lib/billing/usage';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const maxDuration = 60;

const GithubCrawlSchema = z.object({
  url: z.string().url().refine(
    (u) => u.includes('github.com'),
    'URL must be a GitHub repository URL'
  ),
  projectId: z.string().uuid(),
  limit: z.number().min(1).max(100).default(50),
});

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
      { error: 'GitHub import requires a Pro or Team plan.' },
      { status: 403 }
    );
  }

  // 3. Token limit
  const { allowed } = await checkTokenLimit(user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Monthly token limit reached.' },
      { status: 429 }
    );
  }

  // 4. Validate input
  const body = await req.json();
  const parsed = GithubCrawlSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { url, projectId, limit } = parsed.data;

  if (!env.FIRECRAWL_API_KEY) {
    return NextResponse.json(
      { error: 'Web scraping is not configured.' },
      { status: 503 }
    );
  }

  try {
    // 5. Start Firecrawl crawl
    const crawlRes = await fetch('https://api.firecrawl.dev/v1/crawl', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        limit,
        scrapeOptions: {
          formats: ['markdown'],
        },
      }),
    });

    if (!crawlRes.ok) {
      const errData = await crawlRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: `Crawl failed to start: ${errData.error || crawlRes.statusText}` },
        { status: 502 }
      );
    }

    const crawlData = await crawlRes.json();
    const crawlId = crawlData.id;

    if (!crawlId) {
      return NextResponse.json(
        { error: 'Failed to get crawl ID from Firecrawl' },
        { status: 502 }
      );
    }

    // 6. Poll for completion (max 50 seconds to stay within function timeout)
    let result = null;
    const maxAttempts = 25;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const statusRes = await fetch(
        `https://api.firecrawl.dev/v1/crawl/${crawlId}`,
        {
          headers: {
            'Authorization': `Bearer ${env.FIRECRAWL_API_KEY}`,
          },
        }
      );

      if (!statusRes.ok) continue;

      const statusData = await statusRes.json();

      if (statusData.status === 'completed') {
        result = statusData;
        break;
      }

      if (statusData.status === 'failed') {
        return NextResponse.json(
          { error: 'Crawl failed: ' + (statusData.error || 'Unknown error') },
          { status: 502 }
        );
      }
    }

    if (!result) {
      // Return crawl ID so frontend can poll
      return NextResponse.json({
        status: 'processing',
        crawlId,
        message: 'Crawl is still processing. Use the crawl ID to check status.',
      });
    }

    // 7. Process results into file tree
    const pages = result.data || [];
    const files: Array<{ path: string; content: string; url: string }> = [];
    let totalChars = 0;

    for (const page of pages) {
      const pageUrl = page.metadata?.sourceURL || page.url || '';
      const content = page.markdown || page.content || '';
      // Derive a file path from URL
      const urlPath = pageUrl.replace(url, '').replace(/^\//, '') || 'README.md';
      const safePath = urlPath.replace(/[^a-zA-Z0-9/._-]/g, '_').slice(0, 200);

      files.push({
        path: safePath.endsWith('.md') ? safePath : `${safePath}.md`,
        content,
        url: pageUrl,
      });
      totalChars += content.length;
    }

    // 8. Save to Supabase Storage
    const bucket = 'project-files';
    for (const file of files) {
      const storagePath = `projects/${projectId}/scraped/${file.path}`;
      await supabaseAdmin.storage
        .from(bucket)
        .upload(storagePath, file.content, {
          contentType: 'text/markdown',
          upsert: true,
        });
    }

    // 9. Track token usage
    const estimatedTokens = Math.ceil(totalChars / 4);
    await incrementTokenUsage(user.id, undefined, {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: estimatedTokens,
    });

    return NextResponse.json({
      status: 'completed',
      fileCount: files.length,
      files: files.map((f) => ({ path: f.path, url: f.url, size: f.content.length })),
      tokens: estimatedTokens,
    });
  } catch (error) {
    console.error('[scrape/github] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'GitHub crawl failed' },
      { status: 500 }
    );
  }
}
