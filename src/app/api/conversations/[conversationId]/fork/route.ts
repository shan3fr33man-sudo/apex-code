import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/conversations/[conversationId]/fork — fork a conversation
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get the original conversation
  const { data: originalConversation, error: convError } = await supabase
    .from('conversations')
    .select('id, title, model, mode')
    .eq('id', conversationId)
    .single();

  if (convError || !originalConversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  // Get all messages from the original conversation
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (messagesError) {
    return NextResponse.json({ error: messagesError.message }, { status: 500 });
  }

  // Create a new conversation with forked title
  const forkedTitle = `${originalConversation.title} (Forked)`;
  const { data: newConversation, error: createError } = await supabaseAdmin
    .from('conversations')
    .insert({
      user_id: user.id,
      title: forkedTitle,
      model: originalConversation.model,
      mode: originalConversation.mode,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (createError || !newConversation) {
    return NextResponse.json({ error: createError?.message || 'Failed to create forked conversation' }, { status: 500 });
  }

  // Copy all messages to the new conversation
  if (messages && messages.length > 0) {
    const messagesToInsert = messages.map(msg => ({
      conversation_id: newConversation.id,
      role: msg.role,
      content: msg.content,
      created_at: msg.created_at,
    }));

    const { error: insertMessagesError } = await supabaseAdmin
      .from('messages')
      .insert(messagesToInsert);

    if (insertMessagesError) {
      return NextResponse.json({ error: insertMessagesError.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    id: newConversation.id,
    title: forkedTitle,
    model: originalConversation.model,
    mode: originalConversation.mode,
    messageCount: messages?.length || 0,
  });
}
