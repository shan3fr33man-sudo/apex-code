'use client';

import { AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  error: string;
  type?: 'rate-limit' | 'api-error' | 'network' | 'generic';
  onRetry?: () => void;
  onUpgrade?: () => void;
}

export default function ErrorDisplay({ error, type = 'generic', onRetry, onUpgrade }: ErrorDisplayProps) {
  const isRateLimit = type === 'rate-limit' || error.toLowerCase().includes('token limit') || error.toLowerCase().includes('rate limit');
  const isNetwork = type === 'network' || error.toLowerCase().includes('network') || error.toLowerCase().includes('fetch');

  if (isRateLimit) {
    return (
      <div className="mx-4 my-2 bg-yellow-900/30 border border-yellow-800/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Zap className="text-yellow-500 mt-0.5 shrink-0" size={20} />
          <div className="flex-1">
            <p className="text-yellow-300 font-medium text-sm">Token Limit Reached</p>
            <p className="text-yellow-400/70 text-xs mt-1">
              You&apos;ve used all your tokens for this billing period. Upgrade your plan for more capacity.
            </p>
            <div className="flex gap-2 mt-3">
              {onUpgrade && (
                <Button
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs h-7"
                  onClick={onUpgrade}
                >
                  Upgrade Plan
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isNetwork) {
    return (
      <div className="mx-4 my-2 bg-orange-900/30 border border-orange-800/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-orange-500 mt-0.5 shrink-0" size={20} />
          <div className="flex-1">
            <p className="text-orange-300 font-medium text-sm">Connection Error</p>
            <p className="text-orange-400/70 text-xs mt-1">
              Unable to reach the AI service. Please check your connection and try again.
            </p>
            {onRetry && (
              <Button
                size="sm"
                variant="outline"
                className="mt-3 border-orange-700 text-orange-300 hover:bg-orange-900/50 text-xs h-7"
                onClick={onRetry}
              >
                <RefreshCw size={14} className="mr-1" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 my-2 bg-red-900/30 border border-red-800/50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
        <div className="flex-1">
          <p className="text-red-300 font-medium text-sm">Something went wrong</p>
          <p className="text-red-400/70 text-xs mt-1">{error}</p>
          {onRetry && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3 border-red-700 text-red-300 hover:bg-red-900/50 text-xs h-7"
              onClick={onRetry}
            >
              <RefreshCw size={14} className="mr-1" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
