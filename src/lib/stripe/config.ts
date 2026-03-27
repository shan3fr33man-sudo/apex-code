import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
    _stripe = new Stripe(key, { apiVersion: '2026-03-25.dahlia' });
  }
  return _stripe;
}

export interface PlanConfig {
  name: string;
  displayName: string;
  priceId: string;
  monthlyPrice: number;
  features: string[];
  limits: {
    monthlyTokens: number;
    isCollaborative: boolean;
    canExecuteCode: boolean;
    hasInlineCompletions: boolean;
    hasThinkingMode: boolean;
  };
}

export const PLANS: Record<string, PlanConfig> = {
  free: {
    name: 'free',
    displayName: 'Free',
    priceId: process.env.STRIPE_PRICE_FREE || '',
    monthlyPrice: 0,
    features: [
      '100,000 tokens/month',
      'Claude Sonnet access',
      'Community support',
    ],
    limits: {
      monthlyTokens: 100_000,
      isCollaborative: false,
      canExecuteCode: true,
      hasInlineCompletions: true,
      hasThinkingMode: false,
    },
  },
  pro: {
    name: 'pro',
    displayName: 'Pro',
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    monthlyPrice: 2900, // in cents
    features: [
      '2,000,000 tokens/month',
      'All models access',
      'Priority support',
      'Custom integrations',
      'Advanced analytics',
    ],
    limits: {
      monthlyTokens: 2_000_000,
      isCollaborative: false,
      canExecuteCode: true,
      hasInlineCompletions: true,
      hasThinkingMode: true,
    },
  },
  team: {
    name: 'team',
    displayName: 'Team',
    priceId: process.env.STRIPE_PRICE_TEAM_MONTHLY || '',
    monthlyPrice: 9900, // in cents
    features: [
      '10,000,000 tokens/month',
      'All models access',
      'Priority support',
      'Custom integrations',
      'Team collaboration',
      'Advanced analytics',
    ],
    limits: {
      monthlyTokens: 10_000_000,
      isCollaborative: true,
      canExecuteCode: true,
      hasInlineCompletions: true,
      hasThinkingMode: true,
    },
  },
};

export function getPlanFromPriceId(priceId: string): PlanConfig | null {
  for (const plan of Object.values(PLANS)) {
    if (plan.priceId === priceId) {
      return plan;
    }
  }
  return null;
}

export function getPlanByName(name: string): PlanConfig | null {
  return PLANS[name] || null;
}