import { createClient } from '@/lib/supabase/client';

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  size?: number;
  children?: ProjectFile[];
  created_at?: string;
  updated_at?: string;
}

// API calls for project file operations
export async function listProjectFiles(projectId: string): Promise<ProjectFile[]> {
  const res = await fetch(`/api/projects/${projectId}/files`);
  if (!res.ok) throw new Error('Failed to list files');
  return res.json();
}

export async function getFileContent(projectId: string, filePath: string): Promise<string> {
  const res = await fetch(`/api/projects/${projectId}/files/${encodeURIComponent(filePath)}`);
  if (!res.ok) throw new Error('Failed to get file content');
  const data = await res.json();
  return data.content;
}

export async function saveFileContent(
  projectId: string,
  filePath: string,
  content: string
): Promise<void> {
  const res = await fetch(`/api/projects/${projectId}/files/${encodeURIComponent(filePath)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to save file');
}

export async function createFile(
  projectId: string,
  filePath: string,
  type: 'file' | 'folder',
  content?: string
): Promise<ProjectFile> {
  const res = await fetch(`/api/projects/${projectId}/files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: filePath, type, content: content ?? '' }),
  });
  if (!res.ok) throw new Error('Failed to create file');
  return res.json();
}

export async function renameFile(
  projectId: string,
  oldPath: string,
  newPath: string
): Promise<void> {
  const res = await fetch(`/api/projects/${projectId}/files/${encodeURIComponent(oldPath)}/rename`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPath }),
  });
  if (!res.ok) throw new Error('Failed to rename file');
}

export async function deleteFile(projectId: string, filePath: string): Promise<void> {
  const res = await fetch(`/api/projects/${projectId}/files/${encodeURIComponent(filePath)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete file');
}
