import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type Feature =
  | 'thinking_mode'
  | 'collaboration'
  | 'code_execution'
  | 'inline_completions';

const FEATURE_ACCESS: Record<string, Feature[]> = {
  free: ['code_execution', 'inline_completions'],
  pro: ['code_execution', 'inline_completions', 'thinking_mode'],
  team: [
    'code_execution',
    'inline_completions',
    'thinking_mode',
    'collaboration',
  ],
  enterprise: [
    'code_execution',
    'inline_completions',
    'thinking_mode',
    'collaboration',
  ],
};

export async function checkPlanAccess(
  orgId: string,
  feature: Feature
): Promise<boolean> {
  try {
    // Get org plan
    const { data: org, error } = await supabaseAdmin
      .from('organizations')
      .select('plan, plan_status')
      .eq('id', orgId)
      .single();

    if (error || !org) {
      console.error('Error fetching org:', error);
      return false;
    }

    // Check if plan is active
    if (org.plan_status !== 'active' && org.plan_status !== 'trialing') {
      return false;
    }

    // Check feature access
    const allowedFeatures = FEATURE_ACCESS[org.plan] || [];
    return allowedFeatures.includes(feature);
  } catch (error) {
    console.error('Error checking plan access:', error);
    return false;
  }
}

export function getFeatureAccess(plan: string): Feature[] {
  return FEATURE_ACCESS[plan] || FEATURE_ACCESS.free;
}

export function canUseFeature(
  plan: string,
  planStatus: string,
  feature: Feature
): boolean {
  if (planStatus !== 'active' && planStatus !== 'trialing') {
    return false;
  }
  const allowedFeatures = FEATURE_ACCESS[plan] || [];
  return allowedFeatures.includes(feature);
}