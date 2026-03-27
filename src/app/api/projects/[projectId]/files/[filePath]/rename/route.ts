import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = 'project-files';

// PATCH — rename file
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; filePath: string }> }
) {
  const { projectId, filePath } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { newPath } = body;

  if (!newPath) {
    return NextResponse.json({ error: 'newPath is required' }, { status: 400 });
  }

  const decodedOldPath = decodeURIComponent(filePath);
  const oldFullPath = `${projectId}/${decodedOldPath}`;
  const newFullPath = `${projectId}/${newPath}`;

  // Download old file
  const { data, error: downloadError } = await supabaseAdmin.storage.from(BUCKET).download(oldFullPath);
  if (downloadError) {
    return NextResponse.json({ error: downloadError.message }, { status: 404 });
  }

  // Upload to new path
  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(newFullPath, data, { upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Delete old file
  await supabaseAdmin.storage.from(BUCKET).remove([oldFullPath]);

  return NextResponse.json({ success: true, oldPath: oldFullPath, newPath: newFullPath });
}
