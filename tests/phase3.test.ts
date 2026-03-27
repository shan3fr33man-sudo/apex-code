import { describe, it, expect } from 'vitest';

describe('Phase 3 Integration Tests', () => {
  describe('Monaco Editor', () => {
    it('CodeEditor component loads', async () => {
      const mod = await import('@/components/editor/CodeEditor');
      expect(mod.default).toBeDefined();
    });

    it('getLanguageFromFilename detects TypeScript', async () => {
      const { getLanguageFromFilename } = await import('@/components/editor/CodeEditor');
      expect(getLanguageFromFilename('index.ts')).toBe('typescript');
      expect(getLanguageFromFilename('App.tsx')).toBe('typescriptreact');
    });

    it('getLanguageFromFilename detects Python', async () => {
      const { getLanguageFromFilename } = await import('@/components/editor/CodeEditor');
      expect(getLanguageFromFilename('main.py')).toBe('python');
    });

    it('getLanguageFromFilename detects Go', async () => {
      const { getLanguageFromFilename } = await import('@/components/editor/CodeEditor');
      expect(getLanguageFromFilename('server.go')).toBe('go');
    });

    it('getLanguageFromFilename falls back to plaintext', async () => {
      const { getLanguageFromFilename } = await import('@/components/editor/CodeEditor');
      expect(getLanguageFromFilename('unknown.xyz')).toBe('plaintext');
      expect(getLanguageFromFilename('README')).toBe('plaintext');
    });

    it('DiffViewer component loads', async () => {
      const mod = await import('@/components/editor/DiffViewer');
      expect(mod.default).toBeDefined();
    });
  });

  describe('File Tree & Workspace', () => {
    it('FileTree component loads', async () => {
      const mod = await import('@/components/workspace/FileTree');
      expect(mod.default).toBeDefined();
    });

    it('WorkspaceLayout component loads', async () => {
      const mod = await import('@/components/workspace/WorkspaceLayout');
      expect(mod.default).toBeDefined();
    });

    it('project-files API module exports CRUD functions', async () => {
      const mod = await import('@/lib/api/project-files');
      expect(typeof mod.listProjectFiles).toBe('function');
      expect(typeof mod.getFileContent).toBe('function');
      expect(typeof mod.saveFileContent).toBe('function');
      expect(typeof mod.createFile).toBe('function');
      expect(typeof mod.renameFile).toBe('function');
      expect(typeof mod.deleteFile).toBe('function');
    });
  });

  describe('AI Inline Completions', () => {
    it('completions API route exports POST', async () => {
      const mod = await import('@/app/api/completions/route');
      expect(mod.POST).toBeDefined();
      expect(mod.maxDuration).toBe(15);
    });

    it('useInlineCompletions hook loads', async () => {
      const mod = await import('@/hooks/use-inline-completions');
      expect(typeof mod.useInlineCompletions).toBe('function');
    });
  });

  describe('AI Context Menu', () => {
    it('useEditorContextMenu hook loads with AI actions', async () => {
      const mod = await import('@/hooks/use-editor-context-menu');
      expect(typeof mod.useEditorContextMenu).toBe('function');
    });
  });

  describe('Project Context for AI', () => {
    it('buildProjectContext selects relevant files', async () => {
      const { buildProjectContext } = await import('@/lib/ai/project-context');

      const files = [
        { path: 'auth/login.ts', content: 'export function login(email: string) { /* auth logic */ }' },
        { path: 'auth/signup.ts', content: 'export function signup(email: string) { /* signup logic */ }' },
        { path: 'utils/format.ts', content: 'export function formatDate(d: Date) { return d.toISOString(); }' },
        { path: 'config.json', content: '{"port": 3000}' },
      ];

      const result = buildProjectContext(files, 'how does the auth module work?');
      expect(result.filesUsed.length).toBeGreaterThan(0);
      expect(result.context).toContain('auth');
      // Auth files should be ranked higher
      expect(result.filesUsed[0]).toContain('auth');
    });

    it('buildProjectContext respects token limits', async () => {
      const { buildProjectContext } = await import('@/lib/ai/project-context');

      const files = [
        { path: 'big.ts', content: 'x'.repeat(1000000) }, // 1MB file
        { path: 'small.ts', content: 'const x = 1;' },
      ];

      const result = buildProjectContext(files, 'what does big.ts do?');
      // Should not exceed max chars
      expect(result.totalChars).toBeLessThan(900000);
    });

    it('formatProjectContextForAI formats correctly', async () => {
      const { formatProjectContextForAI } = await import('@/lib/ai/project-context');

      const result = formatProjectContextForAI('file content', ['file1.ts', 'file2.ts']);
      expect(result).toContain('<project_context>');
      expect(result).toContain('file1.ts');
      expect(result).toContain('file content');
    });

    it('formatProjectContextForAI returns empty for no files', async () => {
      const { formatProjectContextForAI } = await import('@/lib/ai/project-context');
      expect(formatProjectContextForAI('', [])).toBe('');
    });

    it('project chat API route exports POST', async () => {
      const mod = await import('@/app/api/projects/[projectId]/chat/route');
      expect(mod.POST).toBeDefined();
      expect(mod.maxDuration).toBe(60);
    });
  });

  describe('Project Files API Routes', () => {
    it('files list route exports GET and POST', async () => {
      const mod = await import('@/app/api/projects/[projectId]/files/route');
      expect(mod.GET).toBeDefined();
      expect(mod.POST).toBeDefined();
    });

    it('file detail route exports GET, PUT, DELETE', async () => {
      const mod = await import('@/app/api/projects/[projectId]/files/[filePath]/route');
      expect(mod.GET).toBeDefined();
      expect(mod.PUT).toBeDefined();
      expect(mod.DELETE).toBeDefined();
    });

    it('rename route exports PATCH', async () => {
      const mod = await import('@/app/api/projects/[projectId]/files/[filePath]/rename/route');
      expect(mod.PATCH).toBeDefined();
    });
  });
});