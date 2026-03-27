import { createClient } from '@/lib/supabase/server';import { env } from '@/lib/env';import { checkTokenLimit, incrementTokenUsage } from 'A/lib/billing/usage';import { NextRequest, NextResponse } from 'next/server';import { z } from 'zod';import { createClient as createAdminClient } from '@supabase/supabase-js';

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
  process.env.NEXT_PUBLIC_SUPABAsE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

{Ft rest of file truncated}