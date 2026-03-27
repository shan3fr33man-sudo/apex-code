import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate a secure invite token
function generateInviteToken(): string {
  return randomBytes(32).toString('hex');
}

// POST /api/orgs/invite — create an invitation
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { email, role, orgId } = body;

  if (!email || !role || !orgId) {
    return NextResponse.json(
      { error: 'Email, role, and orgId are required' },
      { status: 400 }
    );
  }

  // Verify user is org owner/admin
  const { data: memberData } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single();

  if (!memberData || (memberData.role !== 'owner' && memberData.role !== 'admin')) {
    return NextResponse.json(
      { error: 'You do not have permission to invite members' },
      { status: 403 }
    );
  }

  const inviteToken = generateInviteToken();

  // Create membership record with status='pending'
  const { data, error } = await supabaseAdmin
    .from('org_members')
    .insert({
      org_id: orgId,
      email: email,
      user_id: null,
      role: role,
      status: 'pending',
      invite_token: inviteToken,
      invited_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    inviteToken,
    email,
    role,
    orgId,
  });
}

// GET /api/orgs/invite — list pending invites for an org
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId');

  if (!orgId) {
    return NextResponse.json(
      { error: 'orgId query parameter is required' },
      { status: 400 }
    );
  }

  // Verify user is org member
  const { data: memberData } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single();

  if (!memberData) {
    return NextResponse.json(
      { error: 'You are not a member of this organization' },
      { status: 403 }
    );
  }

  // Get pending invites
  const { data, error } = await supabase
    .from('org_members')
    .select('id, email, role, invited_at')
    .eq('org_id', orgId)
    .eq('status', 'pending')
    .order('invited_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
