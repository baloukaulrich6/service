// Supabase client – only initialised when VITE_SUPABASE_URL is set.
// Falls back gracefully: all functions return null so GBM simulation is used.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseEnabled = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseEnabled
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export function getSupabase() {
  return supabase;
}
