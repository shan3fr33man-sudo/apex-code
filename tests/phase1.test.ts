import { describe, it, expect } from 'vitest';
import { routeTask } from '@/lib/ai/router';
import { withRetry } from '@/lib/ai/retry';

describe('Phase 1 Integration Tests', () => {
  describe('AI Router', () => {
    it('routes code-generation to kimi instant mode', () => {
      const result = routeTask('code-generation');
      expect(result.provider).toBe('kimi');
      expect(result.mode).toBe('instant');
    });

    it('routes debugging to kimi instant mode', () => {
      const result = routeTask('debugging');
      expect(result.provider).toBe('kimi');
      expect(result.mode).toBe('instant');
    });

    it('routes architecture to kimi thinking mode', () => {
      const result = routeTask('architecture');
      expect(result.provider).toBe('kimi');
      expect(result.mode).toBe('thinking');
    });

    it('routes explanation to claude', () => {
      const result = routeTask('explanation');
      expect(result.provider).toBe('claude');
      expect(result.mode).toBe('instant');
    });

    it('routes general to claude', () => {
      const result = routeTask('general');
      expect(result.provider).toBe('claude');
      expect(result.mode).toBe('instant');
    });
  });

  describe('Retry Utility', () => {
    it('returns result on first success', async () => {
      const result = await withRetry(() => Promise.resolve('success'));
      expect(result).toBe('success');
    });

    it('retries on failure and succeeds', async () => {
      let attempts = 0;
      const result = await withRetry(async () => {
        attempts++;
        if (attempts < 3) throw new Error('fail');
        return 'success';
      }, 3, 10); // short delay for test
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('throws after max attempts', async () => {
      await expect(
        withRetry(() => Promise.reject(new Error('always fails')), 2, 10)
      ).rejects.toThrow('always fails');
    });
  });

  describe('API Types', () => {
    it('validates chat request schema', async () => {
      const { ChatRequestSchema } = await import('@/lib/api/types');

      const valid = ChatRequestSchema.safeParse({
        messages: [{ role: 'user', content: 'hello' }],
        mode: 'instant',
      });
      expect(valid.success).toBe(true);

      const invalid = ChatRequestSchema.safeParse({
        messages: 'not an array',
      });
      expect(invalid.success).toBe(false);
    });

    it('validates execute code schema', async () => {
      const { ExecuteCodeSchema } = await import('@/lib/api/types');

      const valid = ExecuteCodeSchema.safeParse({
        language: 'python',
        code: 'print("hello")',
      });
      expect(valid.success).toBe(true);

      const invalid = ExecuteCodeSchema.safeParse({
        language: '',
        code: '',
      });
      expect(invalid.success).toBe(false);
    });
  });
});
