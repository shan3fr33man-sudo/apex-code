'use client';

import { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import FileTree from './FileTree';
import type { ProjectFile } from '@/lib/api/project-files';
import {
  listProjectFiles,
  getFileContent,
  saveFileContent,
  createFile,
  renameFile,
  deleteFile,
} from '@/lib/api/project-files';
import { useEffect } from 'react';
import { PanelLeft, PanelRight, Save, MessageSquare, Code2 } from 'lucide-react';
import type { editor } from 'monaco-editor';

// Dynamic import for Monaco (it's heavy, SSR incompatible)
const CodeEditor = dynamic(() => import('@/components/editor/CodeEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-950 text-gray-500 text-sm">
      Loading editor...
    </div>
  ),
});

interface WorkspaceLayoutProps {
  projectId: string;
  onSendToChat?: (code: string, action: string) => void;
}

interface OpenTab {
  path: string;
  name: string;
  content: string;
  isDirty: boolean;
  language?: string;
}

export default function WorkspaceLayout({ projectId, onSendToChat }: WorkspaceLayoutProps) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTabPath, setActiveTabPath] = useState<string | null>(null);
  const [showFileTree, setShowFileTree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedCode, setSelectedCode] = useState<{ text: string; startLine: number; endLine: number } | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Load file list
  const loadFiles = useCallback(async () => {
    try {
      const result = await listProjectFiles(projectId);
      setFiles(result);
    } catch (err) {
      console.error('Failed to load files:', err);
    }
  }, [projectId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Open a file in editor
  const handleFileSelect = useCallback(async (file: ProjectFile) => {
    if (file.type === 'folder') return;

    // Check if already open
    const existing = openTabs.find(t => t.path === file.path);
    if (existing) {
      setActiveTabPath(file.path);
      return;
    }

    setLoading(true);
    try {
      const content = await getFileContent(projectId, file.name);
      const newTab: OpenTab = {
        path: file.path,
        name: file.name,
        content,
        isDirty: false,
      };
      setOpenTabs(prev => [...prev, newTab]);
      setActiveTabPath(file.path);
    } catch (err) {
      console.error('Failed to open file:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, openTabs]);

  // Update tab content
  const handleContentChange = useCallback((value: string) => {
    setOpenTabs(prev =>
      prev.map(t =>
        t.path === activeTabPath ? { ...t, content: value, isDirty: true } : t
      )
    );
  }, [activeTabPath]);

  // Save file
  const handleSave = useCallback(async () => {
    const tab = openTabs.find(t => t.path === activeTabPath);
    if (!tab) return;

    setSaving(true);
    try {
      await saveFileContent(projectId, tab.name, tab.content);
      setOpenTabs(prev =>
        prev.map(t =>
          t.path === activeTabPath ? { ...t, isDirty: false } : t
        )
      );
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  }, [projectId, activeTabPath, openTabs]);

  // Close tab
  const handleCloseTab = useCallback((path: string) => {
    setOpenTabs(prev => prev.filter(t => t.path !== path));
    if (activeTabPath === path) {
      setActiveTabPath(openTabs.length > 1 ? openTabs[openTabs.length - 2]?.path ?? null : null);
    }
  }, [activeTabPath, openTabs]);

  // Create file
  const handleCreateFile = useCallback(async (path: string, type: 'file' | 'folder') => {
    try {
      await createFile(projectId, path, type, type === 'file' ? '' : undefined);
      await loadFiles();
    } catch (err) {
      console.error('Failed to create file:', err);
    }
  }, [projectId, loadFiles]);

  // Rename file
  const handleRenameFile = useCallback(async (oldPath: string, newName: string) => {
    try {
      const dir = oldPath.includes('/') ? oldPath.substring(0, oldPath.lastIndexOf('/') + 1) : '';
      await renameFile(projectId, oldPath, `${dir}${newName}`);
      await loadFiles();
    } catch (err) {
      console.error('Failed to rename:', err);
    }
  }, [projectId, loadFiles]);

  // Delete file
  const handleDeleteFile = useCallback(async (path: string) => {
    try {
      await deleteFile(projectId, path);
      handleCloseTab(path);
      await loadFiles();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  }, [projectId, loadFiles, handleCloseTab]);

  // Send selected code to AI chat
  const handleSendToAI = useCallback((action: string) => {
    if (selectedCode && onSendToChat) {
      onSendToChat(selectedCode.text, action);
    }
  }, [selectedCode, onSendToChat]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  const activeTab = openTabs.find(t => t.path === activeTabPath);

  return (
    <div className="flex h-full bg-gray-950">
      {/* File Tree Panel */}
      {showFileTree && (
        <div className="w-56 shrink-0">
          <FileTree
            files={files}
            activeFilePath={activeTabPath ?? undefined}
            onFileSelect={handleFileSelect}
            onCreateFile={handleCreateFile}
            onRenameFile={handleRenameFile}
            onDeleteFile={handleDeleteFile}
          />
        </div>
      )}

      {/* Editor Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-800 bg-gray-900">
          <button
            onClick={() => setShowFileTree(!showFileTree)}
            className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
            title="Toggle file tree"
          >
            <PanelLeft size={16} />
          </button>

          {activeTab && (
            <>
              <button
                onClick={handleSave}
                disabled={!activeTab.isDirty || saving}
                className={`p-1 rounded ${
                  activeTab.isDirty ? 'text-blue-400 hover:bg-gray-800' : 'text-gray-600'
                }`}
                title="Save (Ctrl+S)"
              >
                <Save size={16} />
              </button>
              {saving && <span className="text-xs text-gray-500">Saving...</span>}
            </>
          )}

          {/* AI Actions for selected code */}
          {selectedCode && onSendToChat && (
            <div className="ml-auto flex items-center gap-1">
              <span className="text-xs text-gray-500 mr-2">
                L{selectedCode.startLine}-{selectedCode.endLine}
              </span>
              {['Explain', 'Fix', 'Refactor', 'Write Tests', 'Add Types'].map((action) => (
                <button
                  key={action}
                  onClick={() => handleSendToAI(action.toLowerCase())}
                  className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700"
                >
                  {action}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        {openTabs.length > 0 && (
          <div className="flex border-b border-gray-800 bg-gray-900/50 overflow-x-auto">
            {openTabs.map((tab) => (
              <div
                key={tab.path}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs cursor-pointer border-r border-gray-800 min-w-0 ${
                  tab.path === activeTabPath
                    ? 'bg-gray-950 text-white border-b-2 border-b-blue-500'
                    : 'text-gray-400 hover:bg-gray-800/50'
                }`}
                onClick={() => setActiveTabPath(tab.path)}
              >
                <span className="truncate max-w-[120px]">{tab.name}</span>
                {tab.isDirty && <span className="text-blue-400 ml-1">●</span>}
                <button
                  onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.path); }}
                  className="ml-1 hover:bg-gray-700 rounded px-0.5 text-gray-500 hover:text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Editor Content */}
        <div className="flex-1 min-h-0">
          {activeTab ? (
            <CodeEditor
              value={activeTab.content}
              onChange={handleContentChange}
              filename={activeTab.name}
              onEditorMount={(ed) => { editorRef.current = ed; }}
              onSelectionChange={setSelectedCode}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Code2 size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-lg font-medium">No file open</p>
                <p className="text-sm mt-1">Select a file from the tree to start editing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
