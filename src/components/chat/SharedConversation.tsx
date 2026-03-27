'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface SharedConversationProps {
  conversationId: string;
  isPublic: boolean;
  onToggleVisibility: (isPublic: boolean) => void | Promise<void>;
  onFork: () => void | Promise<void>;
  children?: React.ReactNode;
}

export function SharedConversation({
  conversationId,
  isPublic,
  onToggleVisibility,
  onFork,
  children,
}: SharedConversationProps) {
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [isForking, setIsForking] = useState(false);

  const handleToggleVisibility = async () => {
    setIsTogglingVisibility(true);
    try {
      await onToggleVisibility(!isPublic);
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const handleFork = async () => {
    setIsForking(true);
    try {
      await onFork();
    } finally {
      setIsForking(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Sharing Controls Header */}
      <div className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label htmlFor="visibility-toggle" className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {isPublic ? 'Public' : 'Private'}
              </span>
              <Switch
                id="visibility-toggle"
                checked={isPublic}
                onCheckedChange={handleToggleVisibility}
                disabled={isTogglingVisibility}
              />
            </label>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFork}
            disabled={isForking}
          >
            {isForking ? 'Forking...' : 'Fork'}
          </Button>
        </div>
      </div>

      {/* Conversation View */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      {/* Comments Section Placeholder */}
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          <p className="font-medium">Comments</p>
          <p className="mt-1 text-xs">Comments section coming soon</p>
        </div>
      </div>
    </div>
  );
}
