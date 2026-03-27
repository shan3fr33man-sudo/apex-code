'use client';

import { Zap, Brain } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ModelSelectorProps {
  mode: string;
  onModeChange: (mode: string) => void;
  taskType: string;
  onTaskTypeChange: (type: string) => void;
}

const modes = [
  { value: 'Kimi K2.5 Instant', label: 'Kimi K2.5 Instant', icon: Zap },
  { value: 'Kimi K2.5 Thinking', label: 'Kimi K2.5 Thinking', icon: Brain },
];

const taskTypes = [
  'General',
  'Code Generation',
  'Debugging',
  'Refactoring',
  'Explanation',
  'Architecture',
];

export default function ModelSelector({
  mode,
  onModeChange,
  taskType,
  onTaskTypeChange,
}: ModelSelectorProps) {
  const currentMode = modes.find((m) => m.value === mode);
  const ModeIcon = currentMode?.icon || Zap;

  return (
    <div className="flex gap-3 items-center">
      <div className="flex items-center gap-2">
        <ModeIcon size={16} className="text-purple-400" />
        <Select value={mode} onValueChange={onModeChange}>
          <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {modes.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
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
