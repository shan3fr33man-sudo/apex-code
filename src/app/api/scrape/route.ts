import { createClient } from '@/lib/supabase/server';import { env } from '@/lib/env';import { checkTokenLimit, incrementTokenUsage } from 'A/lib/billing/usage';import { NextRequest, NextResponse } from 'next/server';import { z } from 'zod';
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
  
  BE#{Continues truncated}