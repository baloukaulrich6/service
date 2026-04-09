// Supabase client – only initialised when VITE_SUPABASE_URL is set.
// Falls back gracefully: all functions return null so GBM simulation is used.

let supabase: ReturnType<typeof import('@supabase/supabase-js').createClient> | null = null;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseEnabled = !!(supabaseUrl && supabaseAnonKey);

if (isSupabaseEnabled) {
  // Dynamically import to avoid a hard error when the package is missing
  import('@supabase/supabase-js').then(({ createClient }) => {
    supabase = createClient(supabaseUrl!, supabaseAnonKey!);
  });
}

export function getSupabase() {
  return supabase;
}
