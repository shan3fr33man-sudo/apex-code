import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = 'project-files';

type RouteParams = { params: Promise<{ projectId: string; filePath: string }> };

// GET — read file content
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { projectId, filePath } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const decodedPath = decodeURIComponent(filePath);
  const fullPath = `${projectId}/${decodedPath}`;

  const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(fullPath);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  const content = await data.text();
  return NextResponse.json({ content, path: fullPath });
}

// PUT — update file content
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { projectId, filePath } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { content } = body;

  const decodedPath = decodeURIComponent(filePath);
  const fullPath = `${projectId}/${decodedPath}`;
  const blob = new Blob([content ?? ''], { type: 'text/plain' });

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(fullPath, blob, { upsert: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, path: fullPath });
}

// DELETE — delete a file
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { projectId, filePath } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const decodedPath = decodeURIComponent(filePath);
  const fullPath = `${projectId}/${decodedPath}`;

  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([fullPath]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
