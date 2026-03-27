import { createClient } from '@/lib/supabase/server';
import { executeCode, type ExecutionResult } from '@/lib/execution/piston';
import { NextRequest, NextResponse } from 'next/server';
import { ExecuteCodeSchema } from '@/lib/api/types';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = ExecuteCodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { language, code, stdin, conversationId } = parsed.data;

  try {
    const result: ExecutionResult = await executeCode(language, code, stdin);

    // Save execution to database
    const { data: membership } = await supabaseAdmin
      .from('memberships')
      .select('org_id')
      .eq('user_id', user.id)
      .single();

    if (membership) {
      await supabaseAdmin.from('executions').insert({
        org_id: membership.org_id,
        user_id: user.id,
        conversation_id: conversationId ?? null,
        language: result.language,
        code,
        stdin: stdin ?? '',
        stdout: result.stdout,
        stderr: result.stderr,
        exit_code: result.exitCode,
        runtime_ms: result.runtimeMs,
      });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('[execute] error:', error);
    const message = error instanceof Error ? error.message : 'Execution failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET — list execution history
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: membership } = await supabase
    .from('memberships')
    .select('org_id')
    .eq('user_id', user.id)
    .single();

  if (!membership) return NextResponse.json([]);

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') ?? '20', 10);

  const { data: executions } = await supabase
    .from('executions')
    .select('*')
    .eq('org_id', membership.org_id)
    .order('created_at', { ascending: false })
    .limit(limit);

  return NextResponse.json(executions ?? []);
}
