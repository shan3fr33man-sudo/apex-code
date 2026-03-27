'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useMemo, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ErrorDisplay from './ErrorDisplay';

interface ChatInterfaceProps {
  conversationId?: string;
  initialMessages?: Array<{ id: string; role: 'user' | 'assistant' | 'system'; content: string }>;
  mode?: string;
  taskType?: string;
}

export default function ChatInterface({
  conversationId,
  initialMessages = [],
  mode = 'instant',
  taskType = 'general',
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentMode] = useState(mode);
  const [currentTaskType] = useState(taskType);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: {
          mode: currentMode,
          taskType: currentTaskType,
          conversationId,
        },
      }),
    [currentMode, currentTaskType, conversationId],
  );

  const { messages, status, sendMessage, stop, error } = useChat({
    transport,
    messages: initialMessages.map(m => ({
      id: m.id,
      role: m.role,
      parts: [{ type: 'text' as const, text: m.content }],
      createdAt: new Date(),
    })),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  const getErrorType = (err: Error): 'rate-limit' | 'network' | 'api-error' | 'generic' => {
    const msg = err.message.toLowerCase();
    if (msg.includes('token limit') || msg.includes('429') || msg.includes('rate limit')) return 'rate-limit';
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) return 'network';
    if (msg.includes('503') || msg.includes('unavailable')) return 'api-error';
    return 'generic';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmitMessage = (value: string) => {
    sendMessage({ text: value });
  };

  const handleFixError = (code: string, errorText: string) => {
    const fixPrompt = `The following code has an error. Please fix it and explain what was wrong.\n\n**Code:**\n\`\`\`\n${code}\n\`\`\`\n\n**Error:**\n\`\`\`\n${errorText}\n\`\`\``;
    sendMessage({ text: fixPrompt });
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">Start a new conversation</p>
              <p className="text-sm">Ask me anything about code, architecture, or debugging.</p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={{
              id: message.id,
              role: message.role,
              content: message.parts
                  ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                  .map(p => p.text)
                  .join('') ?? '',
              createdAt: message.createdAt,
            }}
            isStreaming={isLoading && message.role === 'assistant' && message === messages[messages.length - 1]}
            onFixError={handleFixError}
          />
        ))}

        {error && (
          <ErrorDisplay
            error={error.message}
            type={getErrorType(error)}
            onRetry={() => {
              if (messages.length > 0) {
                const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                if (lastUserMsg) {
                  const text = lastUserMsg.parts
                    ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                    .map(p => p.text)
                    .join('') ?? '';
                  if (text) sendMessage({ text });
                }
              }
            }}
            onUpgrade={() => window.location.href = '/settings/usage'}
          />
        )}

        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div className="flex items-center space-x-2 text-gray-400 px-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm">Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 p-4">
        <ChatInput
          onSubmit={handleSubmitMessage}
          isLoading={isLoading}
          placeholder="Type your message here..."
        />
      </div>
    </div>
  );
}
