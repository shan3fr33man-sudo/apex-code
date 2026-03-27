'use client';

import { useState, useEffect } from 'react';
import { Zap, Brain, Sparkles, Lock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ModelInfo {
  id: string;
  label: string;
  provider: string;
  tier: string;
  description: string;
  supportsThinking: boolean;
}

interface ModelSelectorProps {
  modelId: string;
  onModelChange: (modelId: string) => void;
  taskType: string;
  onTaskTypeChange: (type: string) => void;
}

const providerIcons: Record<string, string> = {
  kimi: '🌙',
  anthropic: '🟠',
  openai: '🟢',
  google: '🔵',
};

const taskTypes = [
  'General',
  'Code Generation',
  'Debugging',
  'Refactoring',
  'Explanation',
  'Architecture',
];

export default function ModelSelector({
  modelId,
  onModelChange,
  taskType,
  onTaskTypeChange,
}: ModelSelectorProps) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [plan, setPlan] = useState('free');

  useEffect(() => {
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        if (data.models) {
          setModels(data.models);
          setPlan(data.plan);
        }
      })
      .catch(() => {
        // Fallback: show default model
        setModels([{
          id: 'kimi-k2.5',
          label: 'Kimi K2.5',
          provider: 'kimi',
          tier: 'free',
          description: 'Fast coding assistant',
          supportsThinking: false,
        }]);
      });
  }, []);

  const currentModel = models.find((m) => m.id === modelId) || models[0];
  const isPro = ['pro', 'team', 'enterprise'].includes(plan);

  return (
    <div className="flex gap-3 items-center">
      <div className="flex items-center gap-2">
        {currentModel?.supportsThinking ? (
          <Brain size={16} className="text-purple-400" />
        ) : (
          <Sparkles size={16} className="text-blue-400" />
        )}
        <Select value={modelId} onValueChange={onModelChange}>
          <SelectTrigger className="w-52 bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {models.map((m) => (
              <SelectItem
                key={m.id}
                value={m.id}
                disabled={m.tier === 'pro' && !isPro}
              >
                <span className="flex items-center gap-2">
                  <span>{providerIcons[m.provider] || '⚡'}</span>
                  <span>{m.label}</span>
                  {m.tier === 'pro' && !isPro && (
                    <Lock size={12} className="text-yellow-500 ml-1" />
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="h-5 w-px bg-gray-700" />

      <Select value={taskType} onValueChange={onTaskTypeChange}>
        <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          {taskTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
