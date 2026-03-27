'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';
import RunnableCodeBlock from './RunnableCodeBlock';

interface ChatMessageProps {
  message: {
    id: string;
    role: string;
    content: string;
    createdAt?: Date;
  };
  isStreaming?: boolean;
  onFixError?: (code: string, error: string) => void;
}

export default function ChatMessage({ message, isStreaming, onFixError }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%]">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-3 break-words">
            {message.content}
          </div>
          {message.createdAt && (
            <p className="text-xs text-gray-500 mt-1 text-right">
              {new Date(message.createdAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (isAssistant) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%]">
          <div className="bg-gray-800 text-gray-100 rounded-lg p-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  const codeString = String(children).replace(/\n$/, '');
                  const isInline = !match && !String(children).includes('\n');

                  if (isInline) {
                    return (
                      <code
                        className="bg-gray-900 text-purple-400 px-2 py-1 rounded font-mono text-sm"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }

                  // Use RunnableCodeBlock for fenced code blocks
                  return (
                    <RunnableCodeBlock
                      code={codeString}
                      language={language}
                      onFixError={onFixError}
                    />
                  );
                },
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
                ),
                li: ({ children }) => <li className="ml-2">{children}</li>,
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mb-3 mt-4 first:mt-0">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold mb-2 mt-3">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-bold mb-2 mt-2">{children}</h3>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-600 pl-4 my-3 italic text-gray-300">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          {message.createdAt && (
            <p className="text-xs text-gray-500 mt-1">
              {new Date(message.createdAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
}
