'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceState {
  status: 'online' | 'offline' | 'away';
  lastSeen: string;
  userId?: string;
}

interface UseRealtimePresenceReturn {
  presenceState: Map<string, PresenceState>;
  trackPresence: (status: 'online' | 'offline' | 'away') => Promise<void>;
  isConnected: boolean;
}

export function useRealtimePresence(
  channelName: string,
  userId: string
): UseRealtimePresenceReturn {
  const [presenceState, setPresenceState] = useState<Map<string, PresenceState>>(
    new Map()
  );
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient());

  // Track current user's presence
  const trackPresence = useCallback(
    async (status: 'online' | 'offline' | 'away') => {
      if (!channelRef.current) return;

      try {
        await channelRef.current.track({
          userId,
          status,
          lastSeen: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to track presence:', error);
      }
    },
    [userId]
  );

  useEffect(() => {
    const supabase = supabaseRef.current;

    // Create or get the channel
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channelRef.current = channel;

    // Subscribe to presence updates
    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = new Map<string, PresenceState>();
        const state = channel.presenceState();

        Object.entries(state).forEach(([key, presences]) => {
          if (Array.isArray(presences) && presences.length > 0) {
            const presence = presences[0] as any;
            newState.set(key, {
              status: presence.status || 'offline',
              lastSeen: presence.lastSeen || new Date().toISOString(),
              userId: presence.userId,
            });
          }
        });

        setPresenceState(newState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setPresenceState(prev => {
          const updated = new Map(prev);
          if (Array.isArray(newPresences) && newPresences.length > 0) {
            const presence = newPresences[0] as any;
            updated.set(key, {
              status: presence.status || 'online',
              lastSeen: presence.lastSeen || new Date().toISOString(),
              userId: presence.userId,
            });
          }
          return updated;
        });
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setPresenceState(prev => {
          const updated = new Map(prev);
          updated.delete(key);
          return updated;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          // Track this user as online when subscribed
          await trackPresence('online');
        } else if (status === 'CLOSED') {
          setIsConnected(false);
        }
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [channelName, userId, trackPresence]);

  return {
    presenceState,
    trackPresence,
    isConnected,
  };
}
