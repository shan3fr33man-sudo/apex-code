'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Search, Plus, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConversationItem {
  id: string;
  title: string;
  updated_at: string;
}

interface ConversationSidebarProps {
  conversations: ConversationItem[];
  activeId?: string;
  onNewChat: () => void;
  onDelete: (id: string) => void;
}

export function ConversationSidebar({
  conversations,
  activeId,
  onNewChat,
  onDelete,
}: ConversationSidebarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const handleDelete = (id: string) => {
    setDeleteConfirm(null);
    onDelete(id);
  };

  const handleNavigate = (id: string) => {
    router.push(`/chat/${id}`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-64">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
        >
          <Plus size={18} />
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-slate-800">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-sm">
            {conversations.length === 0 ? 'No conversations yet. Start a new chat!' : 'No matching conversations'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onMouseEnter={() => setHoverId(conversation.id)}
                onMouseLeave={() => setHoverId(null)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${
                  activeId === conversation.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div
                  onClick={() => handleNavigate(conversation.id)}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium truncate">{conversation.title}</p>
                  <p className={`text-xs truncate ${activeId === conversation.id ? 'text-blue-100' : 'text-slate-500'}`}>
                    {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                  </p>
                </div>
                {hoverId === conversation.id && (
                  <button
                    onClick={() => setDeleteConfirm(conversation.id)}
                    className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogTitle className="text-slate-100">Delete conversation</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            Are you sure you want to delete this conversation? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel className="bg-slate-700 text-slate-100 hover:bg-slate-600 border-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
