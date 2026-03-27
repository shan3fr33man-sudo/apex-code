/**
 * Smart context windowing for project-aware AI chat.
 * Gathers relevant files from a project and stays under token limits.
 */

const MAX_CONTEXT_TOKENS = 200_000; // Reserve 56K for response within 256K context
const APPROX_CHARS_PER_TOKEN = 4;
const MAX_CONTEXT_CHARS = MAX_CONTEXT_TOKENS * APPROX_CHARS_PER_TOKEN;

export interface ProjectFileContext {
  path: string;
  content: string;
  relevanceScore: number;
}

/**
 * Score a file's relevance to a query using simple keyword matching.
 * In production, this would use embeddings/vector search.
 */
function scoreRelevance(filePath: string, fileContent: string, query: string): number {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
  let score = 0;

  // File path relevance
  const pathLower = filePath.toLowerCase();
  for (const word of queryWords) {
    if (pathLower.includes(word)) score += 10;
  }

  // Content relevance (keyword frequency)
  const contentLower = fileContent.toLowerCase();
  for (const word of queryWords) {
    const regex = new RegExp(word, 'gi');
    const matches = contentLower.match(regex);
    score += (matches?.length ?? 0) * 2;
  }

  // Boost for important file types
  if (filePath.match(/\.(ts|tsx|js|jsx|py|go|rs)$/)) score += 5;
  if (filePath.includes('index.') || filePath.includes('main.')) score += 3;
  if (filePath.includes('route.') || filePath.includes('api/')) score += 3;
  if (filePath.includes('lib/') || filePath.includes('utils/')) score += 2;

  // Penalize test files unless query mentions test
  if (filePath.includes('test') && !queryLower.includes('test')) score -= 3;

  // Penalize config files unless query mentions config
  if (filePath.match(/\.(json|yaml|yml|toml|env)$/) && !queryLower.includes('config')) score -= 2;

  return Math.max(0, score);
}

/**
 * Build a context string from project files, selecting the most relevant
 * files that fit within the token budget.
 */
export function buildProjectContext(
  files: Array<{ path: string; content: string }>,
  query: string
): { context: string; filesUsed: string[]; totalChars: number } {
  // Score all files
  const scored: ProjectFileContext[] = files.map(f => ({
    path: f.path,
    content: f.content,
    relevanceScore: scoreRelevance(f.path, f.content, query),
  }));

  // Sort by relevance (highest first)
  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Select files within budget
  let totalChars = 0;
  const selected: ProjectFileContext[] = [];

  for (const file of scored) {
    if (file.relevanceScore === 0 && selected.length > 0) break;

    const fileBlock = `--- ${file.path} ---\n${file.content}\n`;
    if (totalChars + fileBlock.length > MAX_CONTEXT_CHARS) {
      // Try truncating this file
      const remaining = MAX_CONTEXT_CHARS - totalChars;
      if (remaining > 200) {
        const truncated = file.content.substring(0, remaining - 100) + '\n... (truncated)';
        selected.push({ ...file, content: truncated });
        totalChars += truncated.length + file.path.length + 20;
      }
      break;
    }

    selected.push(file);
    totalChars += fileBlock.length;
  }

  // Build context string
  const context = selected
    .map(f => `--- ${f.path} ---\n${f.content}`)
    .join('\n\n');

  return {
    context,
    filesUsed: selected.map(f => f.path),
    totalChars,
  };
}

/**
 * Format project context as a system message addition.
 */
export function formatProjectContextForAI(
  context: string,
  filesUsed: string[]
): string {
  if (!context || filesUsed.length === 0) return '';

  return `\n\n<project_context>
The user's project contains the following files. Use this context to provide accurate, project-aware answers.
Files included: ${filesUsed.join(', ')}

${context}
</project_context>`;
}
