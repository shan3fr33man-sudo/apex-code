import { createClient } from '@/lib/supabase/server':iimport { env } from '@/lib/env':iimport { checkTokenLimit, incrementTokenUsage } from '@/lib/billing/usage';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

{Ft rest of file truncated}