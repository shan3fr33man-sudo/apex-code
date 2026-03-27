import { describe, it, expect } from 'vitest';

describe('Phase 5 Integration Tests', () => {
  describe('Stripe Config', () => {
    it('exports getStripe function', async () => {
      const { getStripe } = await import('@/lib/stripe/config');
      expect(typeof getStripe).toBe('function');
    });

    it('exports PLANS with free, pro, team', async () => {
      const { PLANS } = await import('@/lib/stripe/config');
      expect(PLANS).toHaveProperty('free');
      expect(PLANS).toHaveProperty('pro');
      expect(PLANS).toHaveProperty('team');
      expect(PLANS.free.limits.monthlyTokens).toBe(100_000);
      expect(PLANS.pro.limits.monthlyTokens).toBe(2_000_000);
      expect(PLANS.team.limits.monthlyTokens).toBe(10_000_000);
    });

    it('free plan does not have thinking mode', async () => {
      const { PLANS } = await import('@/lib/stripe/config');
      expect(PLANS.free.limits.hasThinkingMode).toBe(false);
      expect(PLANS.pro.limits.hasThinkingMode).toBe(true);
    });

    it('only team plan has collaboration', async () => {
      const { PLANS } = await import('@/lib/stripe/config');
      expect(PLANS.free.limits.isCollaborative).toBe(false);
      expect(PLANS.pro.limits.isCollaborative).toBe(false);
      expect(PLANS.team.limits.isCollaborative).toBe(true);
    });

    it('getPlanFromPriceId returns null for unknown price', async () => {
      const { getPlanFromPriceId } = await import('@/lib/stripe/config');
      expect(getPlanFromPriceId('price_nonexistent')).toBeNull();
    });

    it('getPlanByName returns plan or null', async () => {
      const { getPlanByName } = await import('@/lib/stripe/config');
      expect(getPlanByName('free')).not.toBeNull();
      expect(getPlanByName('nonexistent')).toBeNull();
    });
  });

  describe('Plan Enforcement', () => {
    it('exports checkPlanAccess function', async () => {
      const mod = await import('@/lib/billing/plan-enforcement');
      expect(typeof mod.checkPlanAccess).toBe('function');
    });
  });

  describe('Stripe API Routes', () => {
    it('checkout route exports POST', async () => {
      const mod = await import('@/app/api/stripe/checkout/route');
      expect(mod.POST).toBeDefined();
    });

    it('webhook route exports POST', async () => {
      const mod = await import('@/app/api/stripe/webhook/route');
      expect(mod.POST).toBeDefined();
    });

    it('portal route exports POST', async () => {
      const mod = await import('@/app/api/stripe/portal/route');
      expect(mod.POST).toBeDefined();
    });
  });
});
