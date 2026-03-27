'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface UsageData {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
  plan: string;
  planStatus: string;
  resetDate: string | null;
  conversationCount: number;
  recentConversations: Array<{
    id: string;
    title: string;
    total_input_tokens: number;
    total_output_tokens: number;
    created_at: string;
  }>;
}

const PLAN_FEATURES: Record<string, string[]> = {
  free: [
    '100,000 tokens per month',
    'Kimi K2.5 instant mode',
    'Basic code generation',
    'Community support',
  ],
  pro: [
    '2,000,000 tokens per month',
    'Kimi K2.5 thinking + instant modes',
    'Advanced code generation & debugging',
    'Priority support',
  ],
  team: [
    '10,000,000 tokens per month',
    'All Pro features',
    'Team collaboration & shared projects',
    'Dedicated support',
  ],
  enterprise: [
    '50,000,000 tokens per month',
    'All Team features',
    'Custom model fine-tuning',
    'SLA & dedicated account manager',
  ],
};

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function UsagePage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/usage')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch usage data');
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48 mb-2 bg-gray-800" />
        <Skeleton className="h-4 w-72 mb-8 bg-gray-800" />
        <Skeleton className="h-64 w-full mb-8 bg-gray-800 rounded-lg" />
        <Skeleton className="h-48 w-full bg-gray-800 rounded-lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">Token Usage</h1>
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-6 text-red-300">
          {error || 'Unable to load usage data. Please try again.'}
        </div>
      </div>
    );
  }

  const usagePercentage = data.limit > 0 ? (data.used / data.limit) * 100 : 0;
  const planName = data.plan.charAt(0).toUpperCase() + data.plan.slice(1);
  const features = PLAN_FEATURES[data.plan] ?? PLAN_FEATURES.free;
  const resetDateStr = data.resetDate
    ? new Date(data.resetDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'N/A';

  const usageColor = usagePercentage >= 90
    ? 'text-red-400'
    : usagePercentage >= 70
      ? 'text-yellow-400'
      : 'text-green-400';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Token Usage</h1>
        <p className="text-gray-400 mt-1">Monitor your API token consumption</p>
      </div>

      {/* Current Usage Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Current Plan</h2>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600">{planName}</Badge>
            <Badge className={data.planStatus === 'active' ? 'bg-green-700' : 'bg-yellow-700'}>
              {data.planStatus}
            </Badge>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <p className="text-gray-400 text-sm mb-2">Tokens Used</p>
            <p className="text-3xl font-bold text-white">
              {formatTokens(data.used)}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              of {formatTokens(data.limit)} limit
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2">Remaining</p>
            <p className={`text-3xl font-bold ${usageColor}`}>
              {formatTokens(data.remaining)}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Resets {resetDateStr}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2">Conversations</p>
            <p className="text-3xl font-bold text-white">
              {data.conversationCount}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              total this period
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">Monthly Progress</p>
            <p className={`text-sm font-medium ${usageColor}`}>
              {usagePercentage.toFixed(1)}%
            </p>
          </div>
          <Progress
            value={usagePercentage}
            className="h-2 bg-gray-800"
          />
          {usagePercentage >= 90 && (
            <p className="text-red-400 text-xs mt-2">
              You&apos;re approaching your token limit. Consider upgrading your plan.
            </p>
          )}
        </div>
      </div>

      {/* Recent Conversations */}
      {data.recentConversations.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Conversations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left py-3 pr-4">Title</th>
                  <th className="text-right py-3 px-4">Input Tokens</th>
                  <th className="text-right py-3 px-4">Output Tokens</th>
                  <th className="text-right py-3 pl-4">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.recentConversations.map((conv) => (
                  <tr key={conv.id} className="border-b border-gray-800/50 text-gray-300">
                    <td className="py-3 pr-4 truncate max-w-[200px]">{conv.title}</td>
                    <td className="py-3 px-4 text-right font-mono text-xs">
                      {(conv.total_input_tokens ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs">
                      {(conv.total_output_tokens ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3 pl-4 text-right font-mono text-xs">
                      {((conv.total_input_tokens ?? 0) + (conv.total_output_tokens ?? 0)).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Plan Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
        <h2 className="text-xl font-semibold text-white mb-4">{planName} Plan Details</h2>
        <ul className="space-y-2 text-gray-400 mb-6">
          {features.map((feature, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-blue-500">&#10003;</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        {data.plan !== 'enterprise' && (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Upgrade Plan
          </Button>
        )}
      </div>
    </div>
  );
}
