import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAN_LIMITS: Record<string, number> = {
  free: 100_000,
  pro: 2_000_000,
  team: 10_000_000,
  enterprise: 50_000_000,
};

export async function checkTokenLimit(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
}> {
  // Get user's org
  const { data: membership } = await supabaseAdmin
    .from('memberships')
    .select('org_id')
    .eq('user_id', userId)
    .single();

  if (!membership) {
    return { allowed: false, remaining: 0, limit: 0, used: 0 };
  }

  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('plan, plan_status, monthly_token_limit, tokens_used_this_month, token_reset_date')
    .eq('id', membership.org_id)
    .single();

  if (!org) {
    return { allowed: false, remaining: 0, limit: 0, used: 0 };
  }

  // Check plan status
  if (!['active', 'trialing'].includes(org.plan_status)) {
    return { allowed: false, remaining: 0, limit: org.monthly_token_limit, used: org.tokens_used_this_month };
  }

  // Check if reset date has passed
  if (new Date(org.token_reset_date) <= new Date()) {
    await supabaseAdmin
      .from('organizations')
      .update({
        tokens_used_this_month: 0,
        token_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', membership.org_id);

    return {
      allowed: true,
      remaining: org.monthly_token_limit,
      limit: org.monthly_token_limit,
      used: 0,
    };
  }

  const limit = org.monthly_token_limit || PLAN_LIMITS[org.plan] || PLAN_LIMITS.free;
  const used = org.tokens_used_this_month || 0;
  const remaining = Math.max(0, limit - used);

  return { allowed: remaining > 0, remaining, limit, used };
}

export async function incrementTokenUsage(
  userId: string,
  conversationId: string | undefined,
  usage: { promptTokens: number; completionTokens: number; totalTokens: number }
): Promise<void> {
  const { data: membership } = await supabaseAdmin
    .from('memberships')
    .select('org_id')
    .eq('user_id', userId)
    .single();

  if (!membership) return;

  // Increment org tokens
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('tokens_used_this_month')
    .eq('id', membership.org_id)
    .single();

  if (org) {
    await supabaseAdmin
      .from('organizations')
      .update({
        tokens_used_this_month: (org.tokens_used_this_month || 0) + usage.totalTokens,
      })
      .eq('id', membership.org_id);
  }

  // Update conversation token counts
  if (conversationId) {
    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('total_input_tokens, total_output_tokens')
      .eq('id', conversationId)
      .single();

    if (conv) {
      await supabaseAdmin
        .from('conversations')
        .update({
          total_input_tokens: (conv.total_input_tokens || 0) + usage.promptTokens,
          total_output_tokens: (conv.total_output_tokens || 0) + usage.completionTokens,
        })
        .eq('id', conversationId);
    }
  }
}