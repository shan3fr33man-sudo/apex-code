'use client';

import { useRef, useCallback } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

// Language detection from file extension
const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescriptreact',
  js: 'javascript',
  jsx: 'javascriptreact',
  py: 'python',
  go: 'go',
  rs: 'rust',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  cs: 'csharp',
  rb: 'ruby',
  php: 'php',
  swift: 'swift',
  kt: 'kotlin',
  scala: 'scala',
  r: 'r',
  sql: 'sql',
  html: 'html',
  css: 'css',
  scss: 'scss',
  less: 'less',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  xml: 'xml',
  md: 'markdown',
  sh: 'shell',
  bash: 'shell',
  dockerfile: 'dockerfile',
  toml: 'toml',
  ini: 'ini',
  env: 'plaintext',
  txt: 'plaintext',
};

export function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return EXTENSION_TO_LANGUAGE[ext] || 'plaintext';
}

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  filename?: string;
  readOnly?: boolean;
  height?: string;
  onEditorMount?: (editor: editor.IStandaloneCodeEditor) => void;
  onSelectionChange?: (selection: { text: string; startLine: number; endLine: number }) => void;
}

export default function CodeEditor({
  value,
  onChange,
  language,
  filename,
  readOnly = false,
  height = '100%',
  onEditorMount,
  onSelectionChange,
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const detectedLanguage = language || (filename ? getLanguageFromFilename(filename) : 'plaintext');

  const handleMount: OnMount = useCallback(
    (editor) => {
      editorRef.current = editor;

      // Track selection changes for "Send to AI" context
      editor.onDidChangeCursorSelection(() => {
        if (!onSelectionChange) return;
        const selection = editor.getSelection();
        if (!selection || selection.isEmpty()) return;

        const selectedText = editor.getModel()?.getValueInRange(selection) ?? '';
        if (selectedText) {
          onSelectionChange({
            text: selectedText,
            startLine: selection.startLineNumber,
            endLine: selection.endLineNumber,
          });
        }
      });

      onEditorMount?.(editor);
    },
    [onEditorMount, onSelectionChange],
  );

  const handleChange: OnChange = useCallback(
    (val) => {
      onChange?.(val ?? '');
    },
    [onChange],
  );

  return (
    <div className="h-full w-full overflow-hidden rounded-md border border-gray-800">
      <Editor
        height={height}
        language={detectedLanguage}
        value={value}
        onChange={handleChange}
        onMount={handleMount}
        theme="vs-dark"
        loading={
          <div className="flex items-center justify-center h-full bg-gray-950 text-gray-400 text-sm">
            Loading editor...
          </div>
        }
        options={{
          readOnly,
          minimap: { enabled: false },
          wordWrap: 'on',
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, monospace",
          fontLigatures: true,
          lineNumbers: 'on',
          tabSize: 2,
          insertSpaces: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true, indentation: true },
          suggest: { showIcons: true },
          fixedOverflowWidgets: true,
        }}
      />
    </div>
  );
}
