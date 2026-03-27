import { z } from 'zod';

export type ApiResponse<T> = { data: T; error: null } | { data: null; error: string };

export const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  conversationId: z.string().uuid().optional(),
  modelId: z.string().default('kimi-k2.5'),
  mode: z.enum(['instant', 'thinking']).default('instant'), // Legacy — kept for backward compat
  taskType: z.enum([
    'code-generation', 'debugging', 'refactoring',
    'explanation', 'architecture', 'general'
  ]).optional(),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const ExecuteCodeSchema = z.object({
  language: z.string().min(1),
  code: z.string().min(1),
  stdin: z.string().optional(),
  conversationId: z.string().uuid().optional(),
});
export type ExecuteCodeRequest = z.infer<typeof ExecuteCodeSchema>;

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  runtimeMs: number;
  language: string;
  version: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  model: string;
  mode: string;
  updatedAt: string;
  messageCount: number;
}

export interface TokenUsage {
  used: number;
  limit: number;
  resetDate: string;
  plan: string;
}
