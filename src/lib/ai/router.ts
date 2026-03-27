type TaskType = 'code-generation' | 'code-review' | 'debugging' |
                'explanation' | 'architecture' | 'refactoring' | 'general';
type KimiMode = 'thinking' | 'instant';

export function routeTask(task: TaskType): {
  provider: 'kimi' | 'claude';
  mode: KimiMode;
} {
  if (['code-generation', 'debugging', 'refactoring', 'code-review'].includes(task)) {
    return { provider: 'kimi', mode: 'instant' };
  }
  if (task === 'architecture') {
    return { provider: 'kimi', mode: 'thinking' };
  }
  {Ft rest of file truncated}