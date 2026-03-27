'use client';

import { useEffect, useState } from 'react';
import { History, Terminal, Check, AlertCircle, ChevronDown, ChevronRight, Clock } from 'lucide-react';

interface Execution {
  id: string;
  language: string;
  code: string;
  stdout: string;
  stderr: string;
  exit_code: number;
  runtime_ms: number;
  created_at: string;
}

export default function ExecutionHistory() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/execute?limit=20')
      .then(async (res) => {
        if (res.ok) return res.json();
        return [];
      })
      .then(setExecutions)
      .catch(() => setExecutions([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500 text-sm">
        Loading execution history...
      </div>
    );
  }

  if (executions.length === 0) {
    return (
      <div className="p-6 text-center">
        <Terminal size={32} className="mx-auto mb-3 text-gray-600" />
        <p className="text-gray-400 text-sm">No executions yet</p>
        <p className="text-gray-500 text-xs mt-1">Run code from chat to see results here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
        <History size={16} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-300">Execution History</span>
        <span className="text-xs text-gray-500 ml-auto">{executions.length} runs</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {executions.map((exec) => {
          const isExpanded = expandedId === exec.id;
          const isSuccess = exec.exit_code === 0;
          const time = new Date(exec.created_at).toLocaleString();

          return (
            <div key={exec.id} className="border-b border-gray-800/50">
              <button
                onClick={() => setExpandedId(isExpanded ? null : exec.id)}
                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-800/30 text-left"
              >
                {isExpanded ? (
                  <ChevronDown size={14} className="text-gray-500 shrink-0" />
                ) : (
                  <ChevronRight size={14} className="text-gray-500 shrink-0" />
                )}

                {isSuccess ? (
                  <Check size={14} className="text-green-400 shrink-0" />
                ) : (
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                )}

                <span className="text-xs font-mono text-blue-400 w-20 shrink-0">
                  {exec.language}
                </span>

                <span className="text-xs text-gray-400 truncate flex-1">
                  {exec.code.split('\n')[0].substring(0, 50)}
                </span>

                <span className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                  <Clock size={10} />
                  {exec.runtime_ms}ms
                </span>
              </button>

              {isExpanded && (
                <div className="px-4 pb-3 space-y-2">
                  <div className="text-xs text-gray-500">{time}</div>

                  {/* Code */}
                  <div className="bg-gray-900 rounded p-3">
                    <p className="text-xs text-gray-500 mb-1">Code:</p>
                    <pre className="text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {exec.code}
                    </pre>
                  </div>

                  {/* Output */}
                  {exec.stdout && (
                    <div className="bg-green-950/20 border border-green-900/30 rounded p-3">
                      <p className="text-xs text-green-500 mb-1">Output:</p>
                      <pre className="text-xs font-mono text-green-300 overflow-x-auto whitespace-pre-wrap max-h-24 overflow-y-auto">
                        {exec.stdout}
                      </pre>
                    </div>
                  )}

                  {/* Error */}
                  {exec.stderr && (
                    <div className="bg-red-950/20 border border-red-900/30 rounded p-3">
                      <p className="text-xs text-red-500 mb-1">Error:</p>
                      <pre className="text-xs font-mono text-red-300 overflow-x-auto whitespace-pre-wrap max-h-24 overflow-y-auto">
                        {exec.stderr}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
