'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSubmit: (value: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSubmit,
  isLoading,
  placeholder = 'Type your message here...',
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit(value);
        setValue('');
        // Reset height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 40), 150);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  return (
    <div className="flex gap-3 items-end">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        rows={1}
        className="flex-1 bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-all min-h-[40px] max-h-[150px] font-normal"
      />
      <Button
        onClick={() => {
          if (value.trim() && !isLoading) {
            onSubmit(value);
            setValue('');
            // Reset height
            if (textareaRef.current) {
              textareaRef.current.style.height = 'auto';
            }
          }
        }}
        disabled={isLoading || !value.trim()}
        size="icon"
        className="bg-purple-600 hover:bg-purple-700 text-white shrink-0"
      >
        <Send size={18} />
      </Button>
    </div>
  );
}
