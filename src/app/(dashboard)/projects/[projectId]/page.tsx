'use client';

import { use, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ChatInterface from '@/components/chat/ChatInterface';
import { PanelRight, PanelRightClose } from 'lucide-react';

const WorkspaceLayout = dynamic(() => import('@/components/workspace/WorkspaceLayout'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-950 text-gray-500">
      Loading workspace...
    </div>
  ),
});

export default function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const [showChat, setShowChat] = useState(true);
  const [chatPrefill, setChatPrefill] = useState<string | null>(null);

  const handleSendToChat = useCallback((code: string, action: string) => {
    const prompts: Record<string, string> = {
      explain: `Explain this code:\n\n\`\`\`\n${code}\n\`\`\``,
      fix: `Fix any bugs in this code:\n\n\`\`\`\n${code}\n\`\`\``,
      refactor: `Refactor this code for better readability and performance:\n\n\`\`\`\n${code}\n\`\`\``,
      'write tests': `Write comprehensive tests for this code:\n\n\`\`\`\n${code}\n\`\`\``,
      'add types': `Add TypeScript types to this code:\n\n\`\`\`\n${code}\n\`\`\``,
    };
    setChatPrefill(prompts[action] ?? `${action}:\n\n\`\`\`\n${code}\n\`\`\``);
    setShowChat(true);
  }, []);

  return (
    <div className="flex h-[calc(100vh-48px)]">
      {/* Workspace (file tree + editor) */}
      <div className="flex-1 min-w-0">
        <WorkspaceLayout
          projectId={projectId}
          onSendToChat={handleSendToChat}
        />
      </div>

      {/* Chat toggle */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="absolute top-14 right-2 z-10 p-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-gray-400 hover:text-white"
        title={showChat ? 'Hide chat' : 'Show chat'}
      >
        {showChat ? <PanelRightClose size={16} /> : <PanelRight size={16} />}
      </button>

      {/* Chat Panel */}
      {showChat && (
        <div className="w-[400px] shrink-0 border-l border-gray-800">
          <ChatInterface
            mode="instant"
            taskType="code-generation"
          />
        </div>
      )}
    </div>
  );
}
