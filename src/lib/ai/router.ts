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
  return { provider: 'claude', mode: 'instant' };
}

/**
 * Extract URLs from a message string.
 * Returns an array of valid URLs found in the text.
 */
export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
  const matches = text.match(urlRegex);
  if (!matches) return [];
  // Deduplicate and filter out common non-content URLs
  const seen = new Set<string>();
  return matches.filter((url) => {
    if (seen.has(url)) return false;
    seen.add(url);
    // Skip common API/service URLs that aren't content pages
    if (url.includes('api.github.com')) return false;
    if (url.includes('googleapis.com')) return false;
    if (url.includes('stripe.com/v1')) return false;
    return true;
  });
}

/**
 * Check if a message contains URLs that should trigger an auto-scrape.
 * Returns the first scrapable URL or null.
 */
export function getAutoScrapeUrl(message: string): string | null {
  const urls = extractUrls(message);
  if (urls.length === 0) return null;

  // Only auto-scrape for content-like URLs
  const contentPatterns = [
    /github\.com\/[^/]+\/[^/]+/,  // GitHub repos
    /stackoverflow\.com/,
    /docs\./,
    /blog\./,
    /medium\.com/,
    /dev\.to/,
    /\.md$/,
    /readme/i,
  ];

  for (const url of urls) {
    if (contentPatterns.some((p) => p.test(url))) {
      return url;
    }
  }

  // Return first URL if user explicitly seems to want it scraped
  const scrapeIndicators = ['scrape', 'read this', 'import', 'fetch', 'get the content', 'look at this'];
  if (scrapeIndicators.some((s) => message.toLowerCase().includes(s))) {
    return urls[0];
  }

  return null;
}
