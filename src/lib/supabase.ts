import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  'https://mndzabapdotugfaokyof.supabase.co';

const supabaseKey =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  'sb_publishable_h_RvmsnuakiateroJwcc4g_PN5bu5lJ';

export const supabase = createClient(supabaseUrl, supabaseKey);
