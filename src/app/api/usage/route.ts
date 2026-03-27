import { createClient } from '@/lib/supabase/server';
import { checkTokenLimit } from '@/lib/billing/usage';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get usage from billing module
  const usage = await checkTokenLimit(user.id);

  // Get recent conversation stats
  const { data: membership } = await supabase
    .from('memberships')
    .select('org_id')
    .eq('user_id', user.id)
    .single();

  let plan = 'free';
  let planStatus = 'active';
  let resetDate: string | null = null;
  let conversationCount = 0;
  let recentConversations: Array<{
    id: string;
    title: string;
    total_input_tokens: number;
    total_output_tokens: number;
    created_at: string;
  }> = [];

  if (membership) {
    const { data: org } = await supabase
      .from('organizations')
      .select('plan, plan_status, token_reset_date')
      .eq('id', membership.org_id)
      .single();

    if (org) {
      plan = org.plan;
      planStatus = org.plan_status;
      resetDate = org.token_reset_date;
    }

    const { count } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', membership.org_id);

    conversationCount = count ?? 0;

    const { data: recent } = await supabase
      .from('conversations')
      .select('id, title, total_input_tokens, total_output_tokens, created_at')
      .eq('org_id', membership.org_id)
      .order('created_at', { ascending: false })
      .limit(10);

    recentConversations = recent ?? [];
  }

  return NextResponse.json({
    ...usage,
    plan,
    planStatus,
    resetDate,
    conversationCount,
    recentConversations,
  });
}
