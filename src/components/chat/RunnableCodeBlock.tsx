'use client';

import { useState, useCallback } from 'react';
import { Play, Copy, Check, AlertCircle, Wrench, Loader2, Clock } from 'lucide-react';
import type { ExecutionResult } from '@/lib/api/types';

// Language aliases for Piston
const LANGUAGE_MAP: Record<string, string> = {
  typescript: 'typescript',
  ts: 'typescript',
  javascript: 'javascript',
  js: 'javascript',
  python: 'python',
  py: 'python',
  go: 'go',
  rust: 'rust',
  rs: 'rust',
  java: 'java',
  c: 'c',
  cpp: 'c++',
  'c++': 'c++',
  csharp: 'csharp',
  'c#': 'csharp',
  ruby: 'ruby',
  rb: 'ruby',
  php: 'php',
  swift: 'swift',
  kotlin: 'kotlin',
  bash: 'bash',
  sh: 'bash',
  sql: 'sql',
  r: 'r',
  lua: 'lua',
  perl: 'perl',
  scala: 'scala',
};

interface RunnableCodeBlockProps {
  code: string;
  language: string;
  onFixError?: (code: string, error: string) => void;
}

export default function RunnableCodeBlock({
  code,
  language,
  onFixError,
}: RunnableCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pistonLang = LANGUAGE_MAP[language.toLowerCase()] || language.toLowerCase();
  const isRunnable = Object.values(LANGUAGE_MAP).includes(pistonLang);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleRun = useCallback(async () => {
    setRunning(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: pistonLang, code }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Execution failed');
        return;
      }

      const data: ExecutionResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setRunning(false);
    }
  }, [pistonLang, code]);

  const handleFixError = useCallback(() => {
    if (result && onFixError) {
      const errorText = result.stderr || `Exit code: ${result.exitCode}`;
      onFixError(code, errorText);
    }
  }, [result, code, onFixError]);

  const hasError = result && result.exitCode !== 0;
  const hasOutput = result && (result.stdout || result.stderr);

  return (
    <div className="my-2 rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
        <span className="text-xs font-mono text-gray-400">
          {language || 'code'}
        </span>
        <div className="flex items-center gap-2">
          {isRunnable && (
            <button
              onClick={handleRun}
              disabled={running}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                running
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-green-800/50 hover:bg-green-700/50 text-green-400'
              }`}
            >
              {running ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Play size={12} />
              )}
              {running ? 'Running...' : 'Run'}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Code */}
      <pre className="p-4 overflow-x-auto">
        <code className={`font-mono text-sm language-${language}`}>
          {code}
        </code>
      </pre>

      {/* Output Panel */}
      {(hasOutput || error) && (
        <div className={`border-t ${hasError ? 'border-red-800/50 bg-red-950/20' : 'border-green-800/50 bg-green-950/20'}`}>
          <div className="flex items-center justify-between px-4 py-1.5">
            <div className="flex items-center gap-2">
              {hasError ? (
                <AlertCircle size={14} className="text-red-400" />
              ) : (
                <Check size={14} className="text-green-400" />
              )}
              <span className={`text-xs font-medium ${hasError ? 'text-red-400' : 'text-green-400'}`}>
                {hasError ? `Error (exit code ${result.exitCode})` : 'Success'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {result?.runtimeMs != null && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={12} />
                  {result.runtimeMs}ms
                </span>
              )}
              {hasError && onFixError && (
                <button
                  onClick={handleFixError}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-800/50 hover:bg-yellow-700/50 text-yellow-400 rounded transition-colors"
                >
                  <Wrench size={12} />
                  Fix Error
                </button>
              )}
            </div>
          </div>

          {/* stdout */}
          {result?.stdout && (
            <pre className="px-4 pb-3 text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap">
              {result.stdout}
            </pre>
          )}

          {/* stderr */}
          {(result?.stderr || error) && (
            <pre className="px-4 pb-3 text-xs font-mono text-red-400 overflow-x-auto whitespace-pre-wrap">
              {result?.stderr || error}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
