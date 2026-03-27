import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/orgs/invite/accept — accept an invitation
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { inviteId } = body;

  if (!inviteId) {
    return NextResponse.json(
      { error: 'inviteId is required' },
      { status: 400 }
    );
  }

  // Get the pending membership record
  const { data: memberData, error: fetchError } = await supabase
    .from('org_members')
    .select('id, email, org_id, role, status')
    .eq('id', inviteId)
    .eq('status', 'pending')
    .single();

  if (fetchError || !memberData) {
    return NextResponse.json(
      { error: 'Invite not found or already accepted' },
      { status: 404 }
    );
  }

  // Verify the email matches the current user's email
  if (memberData.email !== user.email) {
    return NextResponse.json(
      { error: 'This invite is not for your email address' },
      { status: 403 }
    );
  }

  // Update membership status to 'active' and link to user_id
  const { data, error } = await supabaseAdmin
    .from('org_members')
    .update({
      status: 'active',
      user_id: user.id,
      invited_at: null,
    })
    .eq('id', inviteId)
    .select('id, org_id, role, status')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    orgId: data.org_id,
    role: data.role,
    status: data.status,
    message: 'Invitation accepted successfully',
  });
}
