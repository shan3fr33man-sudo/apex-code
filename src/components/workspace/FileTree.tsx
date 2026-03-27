'use client';

import { useState, useMemo } from 'react';
import {
  File, Folder, FolderOpen, ChevronRight, ChevronDown,
  Plus, FilePlus, FolderPlus, Trash2, Edit3, MoreHorizontal,
} from 'lucide-react';
import type { ProjectFile } from '@/lib/api/project-files';

// File type icon mapping
function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const iconColors: Record<string, string> = {
    ts: 'text-blue-400',
    tsx: 'text-blue-400',
    js: 'text-yellow-400',
    jsx: 'text-yellow-400',
    py: 'text-green-400',
    go: 'text-cyan-400',
    rs: 'text-orange-400',
    java: 'text-red-400',
    json: 'text-yellow-300',
    md: 'text-gray-400',
    css: 'text-purple-400',
    html: 'text-orange-300',
    sql: 'text-blue-300',
  };
  return iconColors[ext] || 'text-gray-400';
}

interface FileTreeProps {
  files: ProjectFile[];
  activeFilePath?: string;
  onFileSelect: (file: ProjectFile) => void;
  onCreateFile: (path: string, type: 'file' | 'folder') => void;
  onRenameFile: (oldPath: string, newName: string) => void;
  onDeleteFile: (path: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children: TreeNode[];
  file?: ProjectFile;
}

function buildTree(files: ProjectFile[]): TreeNode[] {
  const root: TreeNode[] = [];
  const map = new Map<string, TreeNode>();

  // Sort files so folders come first
  const sorted = [...files].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  for (const f of sorted) {
    const parts = f.path.split('/').filter(Boolean);
    // Skip the projectId prefix (first part)
    const displayParts = parts.slice(1);
    if (displayParts.length === 0) continue;

    // Skip .keep files (folder placeholders)
    if (f.name === '.keep') continue;

    const node: TreeNode = {
      name: f.name,
      path: displayParts.join('/'),
      type: f.type,
      children: [],
      file: f,
    };

    if (displayParts.length === 1) {
      root.push(node);
    } else {
      const parentPath = displayParts.slice(0, -1).join('/');
      const parent = map.get(parentPath);
      if (parent) {
        parent.children.push(node);
      } else {
        root.push(node);
      }
    }

    map.set(node.path, node);
  }

  return root;
}

function FileTreeNode({
  node,
  depth,
  activeFilePath,
  onFileSelect,
  onRenameFile,
  onDeleteFile,
}: {
  node: TreeNode;
  depth: number;
  activeFilePath?: string;
  onFileSelect: (file: ProjectFile) => void;
  onRenameFile: (oldPath: string, newName: string) => void;
  onDeleteFile: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth === 0);
  const [showMenu, setShowMenu] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);

  const isActive = activeFilePath === node.path;
  const isFolder = node.type === 'folder';

  const handleClick = () => {
    if (isFolder) {
      setExpanded(!expanded);
    } else if (node.file) {
      onFileSelect(node.file);
    }
  };

  const handleRename = () => {
    if (newName && newName !== node.name) {
      onRenameFile(node.path, newName);
    }
    setRenaming(false);
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer text-sm group hover:bg-gray-800/50 ${
          isActive ? 'bg-blue-900/30 text-blue-300' : 'text-gray-300'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
      >
        {/* Chevron for folders */}
        {isFolder ? (
          expanded ? <ChevronDown size={14} className="shrink-0 text-gray-500" /> : <ChevronRight size={14} className="shrink-0 text-gray-500" />
        ) : (
          <span className="w-[14px] shrink-0" />
        )}

        {/* Icon */}
        {isFolder ? (
          expanded ? <FolderOpen size={16} className="shrink-0 text-yellow-400" /> : <Folder size={16} className="shrink-0 text-yellow-400" />
        ) : (
          <File size={16} className={`shrink-0 ${getFileIcon(node.name)}`} />
        )}

        {/* Name */}
        {renaming ? (
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') { setRenaming(false); setNewName(node.name); }
            }}
            className="flex-1 bg-gray-800 border border-blue-500 rounded px-1 py-0 text-xs text-white outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate text-xs">{node.name}</span>
        )}

        {/* Context menu */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setRenaming(true); }}
            className="p-0.5 hover:bg-gray-700 rounded"
            title="Rename"
          >
            <Edit3 size={12} className="text-gray-400" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteFile(node.path); }}
            className="p-0.5 hover:bg-red-900/50 rounded"
            title="Delete"
          >
            <Trash2 size={12} className="text-red-400" />
          </button>
        </div>
      </div>

      {/* Children */}
      {isFolder && expanded && node.children.map((child) => (
        <FileTreeNode
          key={child.path}
          node={child}
          depth={depth + 1}
          activeFilePath={activeFilePath}
          onFileSelect={onFileSelect}
          onRenameFile={onRenameFile}
          onDeleteFile={onDeleteFile}
        />
      ))}
    </div>
  );
}

export default function FileTree({
  files,
  activeFilePath,
  onFileSelect,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
}: FileTreeProps) {
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [createType, setCreateType] = useState<'file' | 'folder'>('file');

  const tree = useMemo(() => buildTree(files), [files]);

  const handleCreate = () => {
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim(), createType);
      setNewFileName('');
      setShowCreateMenu(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 border-r border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Files</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setCreateType('file'); setShowCreateMenu(true); }}
            className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
            title="New File"
          >
            <FilePlus size={14} />
          </button>
          <button
            onClick={() => { setCreateType('folder'); setShowCreateMenu(true); }}
            className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
            title="New Folder"
          >
            <FolderPlus size={14} />
          </button>
        </div>
      </div>

      {/* Create input */}
      {showCreateMenu && (
        <div className="px-3 py-2 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center gap-2">
            {createType === 'folder' ? <Folder size={14} className="text-yellow-400" /> : <File size={14} className="text-gray-400" />}
            <input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') setShowCreateMenu(false);
              }}
              placeholder={createType === 'folder' ? 'folder-name' : 'filename.ext'}
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* File tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {tree.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-xs">
            No files yet. Create your first file above.
          </div>
        ) : (
          tree.map((node) => (
            <FileTreeNode
              key={node.path}
              node={node}
              depth={0}
              activeFilePath={activeFilePath}
              onFileSelect={onFileSelect}
              onRenameFile={onRenameFile}
              onDeleteFile={onDeleteFile}
            />
          ))
        )}
      </div>
    </div>
  );
}
