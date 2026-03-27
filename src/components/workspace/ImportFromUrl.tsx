'use client';

import { useState, useCallback } from 'react';
import { Globe, GitBranch, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

interface ImportFromUrlProps {
  projectId: string;
  onImportComplete?: (files: Array<{ path: string; size: number }>) => void;
}

type ImportStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ImportFromUrl({ projectId, onImportComplete }: ImportFromUrlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [message, setMessage] = useState('');
  const [importedFiles, setImportedFiles] = useState<Array<{ path: string; size: number }>>([]);

  const isGithubUrl = url.includes('github.com');

  const handleImport = useCallback(async () => {
    if (!url.trim()) return;

    setStatus('loading');
    setMessage(isGithubUrl ? 'Crawling GitHub repository...' : 'Scraping URL...');
    setImportedFiles([]);

    try {
      if (isGithubUrl) {
        // GitHub crawl
        const res = await fetch('/api/scrape/github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, projectId, limit: 50 }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'GitHub import failed');
        }

        if (data.status === 'processing') {
          setMessage('Repository is being processed. This may take a minute...');
          // Could implement polling here with data.crawlId
          setStatus('success');
          setMessage(`Import started. Files will appear in your project shortly.`);
          return;
        }

        setImportedFiles(data.files || []);
        setStatus('success');
        setMessage(`Imported ${data.fileCount} files (${data.tokens} tokens used)`);
        onImportComplete?.(data.files || []);
      } else {
        // Single URL scrape
        const res = await fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Scrape failed');
        }

        const file = { path: `scraped/${data.title || 'page'}.md`, size: data.content.length };
        setImportedFiles([file]);
        setStatus('success');
        setMessage(`Scraped "${data.title}" (${data.tokens} tokens)`);
        onImportComplete?.([file]);
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Import failed');
    }
  }, [url, projectId, isGithubUrl, onImportComplete]);

  const handleClose = () => {
    setIsOpen(false);
    setUrl('');
    setStatus('idle');
    setMessage('');
    setImportedFiles([]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 transition-colors"
        title="Import from URL"
      >
        <Globe size={14} />
        Import URL
      </button>
    );
  }

  return (
    <div className="absolute top-12 left-0 right-0 z-50 mx-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-4 max-w-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            {isGithubUrl ? <GitBranch size={16} /> : <Globe size={16} />}
            Import from URL
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex gap-2 mb-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste any URL or GitHub repo..."
            className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            disabled={status === 'loading'}
            onKeyDown={(e) => e.key === 'Enter' && handleImport()}
          />
          <button
            onClick={handleImport}
            disabled={!url.trim() || status === 'loading'}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded font-medium transition-colors"
          >
            {status === 'loading' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              'Import'
            )}
          </button>
        </div>

        {/* Status message */}
        {message && (
          <div className={`flex items-start gap-2 text-xs p-2 rounded ${
            status === 'loading' ? 'bg-blue-900/30 text-blue-300' :
            status === 'success' ? 'bg-green-900/30 text-green-300' :
            status === 'error' ? 'bg-red-900/30 text-red-300' :
            'text-gray-400'
          }`}>
            {status === 'loading' && <Loader2 size={12} className="animate-spin mt-0.5 shrink-0" />}
            {status === 'success' && <CheckCircle size={12} className="mt-0.5 shrink-0" />}
            {status === 'error' && <AlertCircle size={12} className="mt-0.5 shrink-0" />}
            <span>{message}</span>
          </div>
        )}

        {/* Imported files list */}
        {importedFiles.length > 0 && (
          <div className="mt-2 max-h-32 overflow-y-auto">
            {importedFiles.slice(0, 10).map((f, i) => (
              <div key={i} className="text-xs text-gray-400 py-0.5 truncate">
                {f.path} ({Math.round(f.size / 1024)}KB)
              </div>
            ))}
            {importedFiles.length > 10 && (
              <div className="text-xs text-gray-500">
                ...and {importedFiles.length - 10} more files
              </div>
            )}
          </div>
        )}

        <p className="text-[10px] text-gray-600 mt-2">
          {isGithubUrl
            ? 'Crawls up to 50 pages from the repository. Files saved as project context.'
            : 'Scrapes page content as Markdown. Added as AI context for this project.'}
        </p>
      </div>
    </div>
  );
}
