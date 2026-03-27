'use client';

import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Member {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  isOnline?: boolean;
}

interface CollaboratorAvatarsProps {
  members: Member[];
  maxVisible?: number;
}

export function CollaboratorAvatars({
  members,
  maxVisible = 5,
}: CollaboratorAvatarsProps) {
  const visibleMembers = members.slice(0, maxVisible);
  const overflowCount = Math.max(0, members.length - maxVisible);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const onlineColors = [
    'bg-green-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-orange-500',
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {visibleMembers.map((member, idx) => (
          <div key={member.id} className="relative">
            <Avatar className="h-8 w-8 border-2 border-white dark:border-slate-900">
              {member.avatar_url && (
                <AvatarImage src={member.avatar_url} alt={member.name} />
              )}
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            {member.isOnline && (
              <div
                className={cn(
                  'absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white dark:border-slate-900',
                  onlineColors[idx % onlineColors.length]
                )}
              />
            )}
          </div>
        ))}
      </div>
      {overflowCount > 0 && (
        <div className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
          +{overflowCount}
        </div>
      )}
    </div>
  );
}
