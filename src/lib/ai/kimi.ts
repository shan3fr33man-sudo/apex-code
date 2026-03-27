import { createOpenAI } from '@ai-sdk/openai';

// Primary: Moonshot official API
export const kimiOfficial = createOpenAI({
  baseURL: 'https://api.moonshot.ai/v1',
  apiKey: process.env.MOONSHOT_API_KEY!,
});

// Fallback 1: Together AI
export const kimiTogether = createOpenAI({
  baseURL: 'https://api.together.xyz/v1',
  apiKey: process.env.TOGETHER_API_KEY!,
});

// Fallback 2: OpenRouter
export const kimiOpenRouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export function getKimiModel(mode: 'thinking' | 'instant' = 'instant') {
  const provider = process.env.MOONSHOT_API_KEY
    ? kimiOfficial
    : process.env.TOGETHER_API_KEY
      ? kimiTogether
      : kimiOpenRouter;

  return provider('kimi-k2.5');
}

export const kimiConfig = {
  instant: { temperature: 0.6, topP: 0.95 },
  thinking: { temperature: 1.0, topP: 0.95 },
} as const;
