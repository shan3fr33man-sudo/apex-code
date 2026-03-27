import { z } from 'zod';

// Validated at startup — app crashes immediately if any var is missing
const serverSchema = z.object({
  // Kimi K2.5
  MOONSHOT_API_KEY: z.string().min(1).optional(),
  TOGETHER_API_KEY: z.string().min(1).optional(),
  OPENROUTER_API_KEY: z.string().min(1).optional(),

  // Anthropic (Claude models)
  ANTHROPIC_API_KEY: z.string().min(1).optional(),

  // OpenAI (GPT models)
  OPENAI_API_KEY: z.string().min(1).optional(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  STRIPE_PRICE_FREE: z.string().optional(),
  STRIPE_PRICE_PRO_MONTHLY: z.string().optional(),
  STRIPE_PRICE_TEAM_MONTHLY: z.string().optional(),

  // Firecrawl (Web Scraping)
  FIRECRAWL_API_KEY: z.string().min(1).optional(),

  // Piston (Code Execution)
  PISTON_API_URL: z.string().url().default('https://emkc.org/api/v2/piston'),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
}).refine(
  (data) => data.MOONSHOT_API_KEY || data.TOGETHER_API_KEY || data.OPENROUTER_API_KEY,
  { message: 'At least one AI API key must be provided (MOONSHOT_API_KEY, TOGETHER_API_KEY, or OPENROUTER_API_KEY)' }
);

// Only validate on server side
function getEnv() {
  if (typeof window !== 'undefined') {
    // Client-side: only public vars available
    return {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    } as z.infer<typeof serverSchema>;
  }
  return serverSchema.parse(process.env);
}

export const env = getEnv();
