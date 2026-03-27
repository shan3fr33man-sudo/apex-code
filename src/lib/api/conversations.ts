import { createClient } from '@/lib/supabase/client';

export async function createConversation(orgId: string, userId: string, title?: string, model?: string, mode?: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('conversations')
    .insert({ org_id: orgId, user_id: userId, title: title || 'New conversation', model: model || 'kimi-k2.5', mode: mode || 'instant' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getConversations(orgId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('conversations')
    .select('id, title, model, mode, updated_at, total_input_tokens, total_output_tokens')
    .eq('org_id', orgId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getConversation(conversationId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();
  if (error) throw error;
  return data;
}

export async function getMessages(conversationId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function saveMessage(conversationId: string, role: string, content: string, model?: string, taskType?: string, inputTokens?: number, outputTokens?: number, reasoningContent?: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
      model,
      task_type: taskType,
      input_tokens: inputTokens || 0,
      output_tokens: outputTokens || 0,
      reasoning_content: reasoningContent,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateConversationTitle(conversationId: string, title: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('conversations')
    .update({ title })
    .eq('id', conversationId);
  if (error) throw error;
}

export async function deleteConversation(conversationId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);
  if (error) throw error;
}
