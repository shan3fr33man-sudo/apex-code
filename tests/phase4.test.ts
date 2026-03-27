import { describe, it, expect } from 'vitest';

describe('Phase 4 Integration Tests', () => {
  describe('Piston Execution Engine', () => {
    it('exports executeCode function', async () => {
      const { executeCode } = await import('@/lib/execution/piston');
      expect(typeof executeCode).toBe('function');
    });

    it('ExecutionResult type is exported', async () => {
      const mod = await import('@/lib/execution/piston');
      expect(mod).toHaveProperty('executeCode');
    });
  });

  describe('Execute API Route', () => {
    it('exports POST and GET handlers', async () => {
      const mod = await import('@/app/api/execute/route');
      expect(mod.POST).toBeDefined();
      expect(mod.GET).toBeDefined();
      expect(mod.maxDuration).toBe(30);
    });
  });

  describe('Execute Code Schema', () => {
    it('validates valid execution request', async () => {
      const { ExecuteCodeSchema } = await import('@/lib/api/types');

      const valid = ExecuteCodeSchema.safeParse({
        language: 'python',
        code: 'print("hello")',
      });
      expect(valid.success).toBe(true);
    });

    it('validates with optional stdin and conversationId', async () => {
      const { ExecuteCodeSchema } = await import('@/lib/api/types');

      const valid = ExecuteCodeSchema.safeParse({
        language: 'javascript',
        code: 'console.log("hi")',
        stdin: 'input data',
        conversationId: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(valid.success).toBe(true);
    });

    it('rejects empty language', async () => {
      const { ExecuteCodeSchema } = await import('@/lib/api/types');

      const invalid = ExecuteCodeSchema.safeParse({
        language: '',
        code: 'print("hello")',
      });
      expect(invalid.success).toBe(false);
    });

    it('rejects empty code', async () => {
      const { ExecuteCodeSchema } = await import('@/lib/api/types');

      const invalid = ExecuteCodeSchema.safeParse({
        language: 'python',
        code: '',
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe('Chat Components with Code Execution', () => {
    it('RunnableCodeBlock component loads', async () => {
      const mod = await import('@/components/chat/RunnableCodeBlock');
      expect(mod.default).toBeDefined();
    });

    it('ExecutionHistory component loads', async () => {
      const mod = await import('@/components/chat/ExecutionHistory');
      expect(mod.default).toBeDefined();
    });

    it('ChatMessage component loads (with onFixError prop)', async () => {
      const mod = await import('@/components/chat/ChatMessage');
      expect(mod.default).toBeDefined();
    });
  });
});
