import ChatInterface from '@/components/chat/ChatInterface';

export default function ConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  // TODO: Load conversation from Supabase and pass initialMessages to ChatInterface
  // For now, this creates a fresh chat with the conversationId available via props

  return (
    <div className="h-full">
      <ChatInterface conversationId={params.conversationId} initialMessages={[]} />
    </div>
  );
}
