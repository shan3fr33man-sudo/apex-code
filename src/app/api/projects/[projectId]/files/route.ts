import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = 'project-files';

// Ensure bucket exists
async function ensureBucket() {
  const { data } = await supabaseAdmin.storage.getBucket(BUCKET);
  if (!data) {
    await supabaseAdmin.storage.createBucket(BUCKET, { public: false });
  }
}

// GET /api/projects/[projectId]/files — list all files in project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureBucket();

  const prefix = `${projectId}/`;
  const { data: files, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .list(prefix, { limit: 500, sortBy: { column: 'name', order: 'asc' } });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Build file tree from flat list
  const fileTree = (files ?? []).map(f => ({
    id: f.id ?? f.name,
    name: f.name,
    path: `${prefix}${f.name}`,
    type: (f.metadata && Object.keys(f.metadata).length === 0) ? 'folder' as const : 'file' as const,
    size: f.metadata?.size ?? 0,
    created_at: f.created_at,
    updated_at: f.updated_at,
  }));

  return NextResponse.json(fileTree);
}

// POST /api/projects/[projectId]/files — create a new file or folder
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { path: filePath, type, content = '' } = body;

  if (!filePath) {
    return NextResponse.json({ error: 'Path is required' }, { status: 400 });
  }

  await ensureBucket();

  const fullPath = `${projectId}/${filePath}`;

  if (type === 'folder') {
    // Create a placeholder file to represent the folder
    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(`${fullPath}/.keep`, new Blob(['']), { upsert: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const blob = new Blob([content], { type: 'text/plain' });
    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(fullPath, blob, { upsert: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: fullPath,
    name: filePath.split('/').pop(),
    path: fullPath,
    type,
    content: type === 'file' ? content : undefined,
  });
}
