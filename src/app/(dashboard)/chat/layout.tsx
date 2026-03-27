export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full gap-4">
      {/* Sidebar for conversation history */}
      <div className="w-64 border-r border-gray-800 p-4 overflow-y-auto hidden lg:block">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Recent Conversations</h2>
        <div className="space-y-2">
          {/* Placeholder for conversation list */}
          <p className="text-xs text-gray-500">Your conversation history will appear here</p>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
