'use client';

import { Code, Bug, BookOpen, RefreshCw } from 'lucide-react';

interface EmptyChatProps {
  onSuggest: (suggestion: string) => void;
}

const suggestions = [
  {
    icon: Code,
    title: 'Write a React component',
    description: 'Create a new component',
  },
  {
    icon: Bug,
    title: 'Debug my Python script',
    description: 'Find and fix issues',
  },
  {
    icon: BookOpen,
    title: 'Explain this architecture',
    description: 'Understand the design',
  },
  {
    icon: RefreshCw,
    title: 'Refactor this function',
    description: 'Improve the code',
  },
];

export function EmptyChat({ onSuggest }: EmptyChatProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
      {/* Logo/Title */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-100 mb-2">APEX-CODE</h1>
        <p className="text-xl text-slate-400">How can I help you code today?</p>
      </div>

      {/* Suggestion Cards Grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <button
              key={index}
              onClick={() => onSuggest(suggestion.title)}
              className="flex flex-col items-center gap-3 p-4 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 transition-all cursor-pointer group"
            >
              <Icon className="w-8 h-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <div>
                <p className="font-medium text-slate-100 text-sm group-hover:text-white">
                  {suggestion.title}
                </p>
                <p className="text-xs text-slate-500 group-hover:text-slate-400">
                  {suggestion.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
