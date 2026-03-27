import { useRef, useCallback, useEffect } from 'react';
import type { editor, languages, IDisposable } from 'monaco-editor';

const DEBOUNCE_MS = 600;

export function useInlineCompletions(
  editorInstance: editor.IStandaloneCodeEditor | null,
  language: string,
  filename: string,
  enabled: boolean = true
) {
  const disposeRef = useRef<IDisposable | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchCompletion = useCallback(
    async (prefix: string, suffix: string): Promise<string> => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const res = await fetch('/api/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prefix, suffix, language, filename }),
          signal: abortRef.current.signal,
        });
        if (!res.ok) return '';
        const data = await res.json();
        return data.completion ?? '';
      } catch {
        return '';
      }
    },
    [language, filename]
  );

  useEffect(() => {
    if (!editorInstance || !enabled) return;

    // Access monaco from the editor instance
    const monaco = (window as unknown as { monaco?: typeof import('monaco-editor') }).monaco;
    if (!monaco) return;

    let debounceTimer: ReturnType<typeof setTimeout>;

    const provider: languages.InlineCompletionsProvider = {
      provideInlineCompletions: async (model, position, _context, token) => {
        // Clear previous debounce
        return new Promise((resolve) => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(async () => {
            if (token.isCancellationRequested) {
              resolve({ items: [] });
              return;
            }

            const offset = model.getOffsetAt(position);
            const fullText = model.getValue();
            const prefix = fullText.substring(0, offset);
            const suffix = fullText.substring(offset);

            const completion = await fetchCompletion(prefix, suffix);
            if (!completion || token.isCancellationRequested) {
              resolve({ items: [] });
              return;
            }

            resolve({
              items: [
                {
                  insertText: completion,
                  range: {
                    startLineNumber: position.lineNumber,
                    startColumn: position.column,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column,
                  },
                },
              ],
            });
          }, DEBOUNCE_MS);
        });
      },
      disposeInlineCompletions: () => {},
    };

    disposeRef.current = monaco.languages.registerInlineCompletionsProvider(
      { pattern: '**' },
      provider
    );

    return () => {
      clearTimeout(debounceTimer);
      disposeRef.current?.dispose();
      abortRef.current?.abort();
    };
  }, [editorInstance, enabled, fetchCompletion]);
}
