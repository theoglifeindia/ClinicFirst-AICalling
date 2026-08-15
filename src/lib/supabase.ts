import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Ensure it is a genuine, non-placeholder Supabase configuration
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('xyzcompany') &&
  !supabaseUrl.includes('your-project') &&
  !supabaseUrl.includes('example') &&
  !supabaseAnonKey.includes('...') &&
  supabaseAnonKey.length > 30
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function getSupabaseClient(): SupabaseClient | null {
  return supabase;
}

