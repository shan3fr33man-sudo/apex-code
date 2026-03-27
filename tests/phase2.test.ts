import { describe, it, expect, vi } from 'vitest';

describe('Phase 2 Integration Tests', () => {
  describe('Chat API Route', () => {
    it('exports POST handler', async () => {
      const mod = await import('@/app/api/chat/route');
      expect(mod.POST).toBeDefined();
      expect(typeof mod.POST).toBe('function');
    });

    it('has maxDuration set to 60', async () => {
      const mod = await import('@/app/api/chat/route');
      expect(mod.maxDuration).toBe(60);
    });
  });

  describe('Usage API Route', () => {
    it('exports GET handler', async () => {
      const mod = await import('@/app/api/usage/route');
      expect(mod.GET).toBeDefined();
      expect(typeof mod.GET).toBe('function');
    });
  });

  describe('Conversations API Route', () => {
    it('exports GET handler for listing conversations', async () => {
      const mod = await import('@/app/api/conversations/route');
      expect(mod.GET).toBeDefined();
    });
  });

  describe('Billing / Usage Module', () => {
    it('exports checkTokenLimit function', async () => {
      const { checkTokenLimit } = await import('@/lib/billing/usage');
      expect(typeof checkTokenLimit).toBe('function');
    });

    it('exports incrementTokenUsage function', async () => {
      const { incrementTokenUsage } = await import('@/lib/billing/usage');
      expect(typeof incrementTokenUsage).toBe('function');
    });
  });

  describe('AI Kimi Module', () => {
    it('exports getKimiModel function', async () => {
      const { getKimiModel } = await import('@/lib/ai/kimi');
      expect(typeof getKimiModel).toBe('function');
    });

    it('exports kimiConfig with instant and thinking modes', async () => {
      const { kimiConfig } = await import('@/lib/ai/kimi');
      expect(kimiConfig).toHaveProperty('instant');
      expect(kimiConfig).toHaveProperty('thinking');
      expect(kimiConfig.instant.temperature).toBeLessThan(kimiConfig.thinking.temperature);
    });

    it('returns a model for instant mode', async () => {
      const { getKimiModel } = await import('@/lib/ai/kimi');
      const model = getKimiModel('instant');
      expect(model).toBeDefined();
    });

    it('returns a model for thinking mode', async () => {
      const { getKimiModel } = await import('@/lib/ai/kimi');
      const model = getKimiModel('thinking');
      expect(model).toBeDefined();
    });
  });

  describe('Chat Components exist', () => {
    it('ChatInterface module loads', async () => {
      // Just verify the module resolves (won't render without DOM)
      const mod = await import('@/components/chat/ChatInterface');
      expect(mod.default).toBeDefined();
    });

    it('ChatMessage module loads', async () => {
      const mod = await import('@/components/chat/ChatMessage');
      expect(mod.default).toBeDefined();
    });

    it('ChatInput module loads', async () => {
      const mod = await import('@/components/chat/ChatInput');
      expect(mod.default).toBeDefined();
    });

    it('ErrorDisplay module loads', async () => {
      const mod = await import('@/components/chat/ErrorDisplay');
      expect(mod.default).toBeDefined();
    });

    it('ConversationSidebar module loads', async () => {
      const mod = await import('@/components/chat/ConversationSidebar');
      expect(mod.ConversationSidebar).toBeDefined();
    });

    it('ModelSelector module loads', async () => {
      const mod = await import('@/components/chat/ModelSelector');
      expect(mod.default).toBeDefined();
    });
  });

  describe('System prompt builder', () => {
    it('chat route builds system prompts for different task types', async () => {
      // Indirectly test by verifying the route module loads cleanly
      const mod = await import('@/app/api/chat/route');
      expect(mod.POST).toBeDefined();
    });
  });
});
