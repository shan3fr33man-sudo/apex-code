import { useEffect, useRef } from 'react';
import type { editor, IDisposable } from 'monaco-editor';

export interface AIAction {
  id: string;
  label: string;
  prompt: (code: string) => string;
}

const AI_ACTIONS: AIAction[] = [
  { id: 'explain', label: 'AI: Explain This', prompt: (c) => `Explain this code:\n\n\`\`\`\n${c}\n\`\`\`` },
  { id: 'fix', label: 'AI: Fix This', prompt: (c) => `Fix any bugs in this code:\n\n\`\`\`\n${c}\n\`\`\`` },
  { id: 'refactor', label: 'AI: Refactor This', prompt: (c) => `Refactor this code for better readability and performance:\n\n\`\`\`\n${c}\n\`\`\`` },
  { id: 'tests', label: 'AI: Write Tests', prompt: (c) => `Write comprehensive tests for this code:\n\n\`\`\`\n${c}\n\`\`\`` },
  { id: 'types', label: 'AI: Add Types', prompt: (c) => `Add TypeScript types to this code:\n\n\`\`\`\n${c}\n\`\`\`` },
];

export function useEditorContextMenu(
  editorInstance: editor.IStandaloneCodeEditor | null,
  onAction: (prompt: string) => void
) {
  const disposablesRef = useRef<IDisposable[]>([]);

  useEffect(() => {
    if (!editorInstance) return;

    // Clean up previous actions
    disposablesRef.current.forEach(d => d.dispose());
    disposablesRef.current = [];

    for (const action of AI_ACTIONS) {
      const disposable = editorInstance.addAction({
        id: `apex-ai-${action.id}`,
        label: action.label,
        contextMenuGroupId: 'apex-ai',
        contextMenuOrder: AI_ACTIONS.indexOf(action) + 1,
        precondition: 'editorHasSelection',
        run: (ed) => {
          const selection = ed.getSelection();
          if (!selection) return;
          const selectedText = ed.getModel()?.getValueInRange(selection) ?? '';
          if (selectedText) {
            onAction(action.prompt(selectedText));
          }
        },
      });
      disposablesRef.current.push(disposable);
    }

    return () => {
      disposablesRef.current.forEach(d => d.dispose());
      disposablesRef.current = [];
    };
  }, [editorInstance, onAction]);
}
