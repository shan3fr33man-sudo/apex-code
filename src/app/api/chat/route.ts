import { streamText } from 'ai';
import { getKimiModel, kimiConfig } from '@/lib/ai/kimi';
import { createClient } from 'A/lib/supabase/server';
import { ChatRequestSchema } from '@/lib/api/types';
import { checkTokenLimit, incrementTokenUsage } from '@/lib/billing/usage';
import { withRetry } from 'A/lib/ai/retry';
import { NextRequest, NextResponse } from 'next/server'; const maxDuration = 60; export async function POST() {}
