'use client';

import { useRef, useEffect, useState } from 'react';
import { Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Dynamic import for Monaco diff editor
import { DiffEditor, type DiffOnMount } from '@monaco-editor/react';

interface DiffViewerProps {
  original: string;
  modified: string;
  language?: string;
  filename?: string;
  onAccept: (newContent: string) => void;
  onReject: () => void;
}

export default function DiffViewer({
  original,
  modified,
  language = 'plaintext',
  filename,
  onAccept,
  onReject,
}: DiffViewerProps) {
  const [editorContent, setEditorContent] = useState(modified);

  const handleMount: DiffOnMount = (editor) => {
    // Track changes in the modified side
    const modifiedEditor = editor.getModifiedEditor();
    modifiedEditor.onDidChangeModelContent(() => {
      const value = modifiedEditor.getValue();
      setEditorContent(value);
    });
  };

  return (
    <div className="flex flex-col h-full border border-gray-800 rounded-lg overflow-hidden bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-300">
            {filename ? `Diff: ${filename}` : 'AI Suggested Changes'}
          </span>
          <span className="text-xs text-gray-500">
            Review the changes before applying
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-red-800 text-red-400 hover:bg-red-900/30 h-7 text-xs"
            onClick={onReject}
          >
            <X size={14} className="mr-1" />
            Reject All
          </Button>
          <Button
            size="sm"
            className="bg-green-700 hover:bg-green-600 text-white h-7 text-xs"
            onClick={() => onAccept(editorContent)}
          >
            <Check size={14} className="mr-1" />
            Accept All
          </Button>
        </div>
      </div>

      {/* Labels */}
      <div className="flex border-b border-gray-800 text-xs">
        <div className="flex-1 px-4 py-1 text-gray-500 bg-red-950/20">Current Code</div>
        <div className="flex-1 px-4 py-1 text-gray-500 bg-green-950/20">AI Suggestion</div>
      </div>

      {/* Diff Editor */}
      <div className="flex-1 min-h-0">
        <DiffEditor
          original={original}
          modified={modified}
          language={language}
          theme="vs-dark"
          onMount={handleMount}
          options={{
            readOnly: false,
            originalEditable: false,
            renderSideBySide: true,
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            renderIndicators: true,
            padding: { top: 8, bottom: 8 },
          }}
        />
      </div>
    </div>
  );
}
