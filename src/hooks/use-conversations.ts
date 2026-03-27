'use client';

import { useState, useEffect, useCallback } from 'react';

interface Conversation {
  id: string;
  title: string;
  model: string;
  mode: string;
  updated_at: string;
  total_input_tokens: number;
  total_output_tokens: number;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, isLoading, refetch: fetchConversations };
}
