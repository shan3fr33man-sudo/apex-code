import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABAsE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export type Feature |  * |      |                                |           |                 |                  |
                                'thinking_mode'
  | 'collaboration'
  | 'code_execution'
  | 'inline_completions'
  | 'web_scraping';
:Þ²Ú~)^¶»§q«^