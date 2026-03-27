import { createClient } from '@/lib/supabase/server';
import { getAvailableModels } from '@/lib/ai/models';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user's plan
  const { data: membership } = await supabase
    .from('memberships')
    .select('org_id, organizations(plan)')
    .eq('user_id', user.id)
    .single();

  const plan = (membership as any)?.organizations?.plan || 'free';
  const models = getAvailableModels(plan);

  return NextResponse.json({
    models: models.map((m) => ({
      id: m.id,
      label: m.label,
      provider: m.provider,
      tier: m.tier,
      description: m.description,
      supportsThinking: m.supportsThinking,
    })),
    plan,
  });
}
