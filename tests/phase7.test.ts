import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Phase 7 Production + Polish Tests', () => {
  describe('Security: No Secrets in Client Bundles', () => {
    it('SUPABASE_SERVICE_ROLE_KEY not in NEXT_PUBLIC vars', () => {
      const envContent = fs.readFileSync(path.join(process.cwd(), 'src/lib/env.ts'), 'utf-8');
      expect(/NEXT_PUBLIC.*SERVICE_ROLE/.test(envContent)).toBe(false);
    });

    it('MOONSHOT_API_KEY not in NEXT_PUBLIC vars', () => {
      const envContent = fs.readFileSync(path.join(process.cwd(), 'src/lib/env.ts'), 'utf-8');
      expect(/NEXT_PUBLIC.*MOONSHOT/.test(envContent)).toBe(false);
    });
  });

  describe('Loading Skeletons', () => {
    it('root loading component exports', async () => {
      const mod = await import('@/app/loading');
      expect(typeof mod.default).toBe('function');
    });

    it('dashboard loading component exports', async () => {
      const mod = await import('@/app/(dashboard)/loading');
      expect(typeof mod.default).toBe('function');
    });
  });

  describe('Middleware', () => {
    it('exports middleware function', async () => {
      const mod = await import('@/middleware');
      expect(typeof mod.middleware).toBe('function');
    });

    it('exports config with matcher', async () => {
      const mod = await import('@/middleware');
      expect(mod.config).toBeDefined();
      expect(mod.config.matcher).toBeDefined();
    });
  });

  describe('Next.js Config', () => {
    it('next.config.ts exists and has image + headers config', () => {
      const configContent = fs.readFileSync(path.join(process.cwd(), 'next.config.ts'), 'utf-8');
      expect(configContent).toContain('images');
      expect(configContent).toContain('headers');
      expect(configContent).toContain('X-Frame-Options');
      expect(configContent).toContain('Strict-Transport-Security');
    });
  });

  describe('Vercel Deploy Config', () => {
    it('vercel.json is valid with correct settings', () => {
      const content = fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf-8');
      const config = JSON.parse(content);
      expect(config.framework).toBe('nextjs');
      expect(config.buildCommand).toBe('npm run build');
    });

    it('vercel.json has function maxDuration', () => {
      const content = fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf-8');
      const config = JSON.parse(content);
      expect(config.functions).toBeDefined();
    });
  });

  describe('Plan Enforcement', () => {
    it('exports checkPlanAccess function', async () => {
      const mod = await import('@/lib/billing/plan-enforcement');
      expect(typeof mod.checkPlanAccess).toBe('function');
    });
  });

  describe('All API Routes Export Handlers', () => {
    it('chat POST', async () => {
      expect((await import('@/app/api/chat/route')).POST).toBeDefined();
    });

    it('conversations GET', async () => {
      expect((await import('@/app/api/conversations/route')).GET).toBeDefined();
    });

    it('execute POST + GET', async () => {
      const mod = await import('@/app/api/execute/route');
      expect(mod.POST).toBeDefined();
      expect(mod.GET).toBeDefined();
    });

    it('stripe checkout POST', async () => {
      expect((await import('@/app/api/stripe/checkout/route')).POST).toBeDefined();
    });

    it('stripe webhook POST', async () => {
      expect((await import('@/app/api/stripe/webhook/route')).POST).toBeDefined();
    });

    it('stripe portal POST', async () => {
      expect((await import('@/app/api/stripe/portal/route')).POST).toBeDefined();
    });

    it('orgs invite POST + GET', async () => {
      const mod = await import('@/app/api/orgs/invite/route');
      expect(mod.POST).toBeDefined();
      expect(mod.GET).toBeDefined();
    });

    it('conversation fork POST', async () => {
      expect((await import('@/app/api/conversations/[conversationId]/fork/route')).POST).toBeDefined();
    });

    it('usage GET', async () => {
      expect((await import('@/app/api/usage/route')).GET).toBeDefined();
    });

    it('completions POST', async () => {
      expect((await import('@/app/api/completions/route')).POST).toBeDefined();
    });
  });

  describe('Environment', () => {
    it('env module loads without error', async () => {
      const mod = await import('@/lib/env');
      expect(mod.env).toBeDefined();
      expect(mod.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    });
  });
});
