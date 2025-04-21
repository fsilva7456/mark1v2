import { createClient } from '@supabase/supabase-js';

let supabase: ReturnType<typeof createClient> | null = null;

// This approach ensures the client is only created in browser environment
// or when environment variables are available
export const getSupabase = () => {
  if (supabase) return supabase;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or anonymous key not provided. Supabase client will not work properly.');
    
    // During static build, return a mock client
    if (typeof window === 'undefined') {
      return null;
    }
  }
  
  // Only create the client if we have the credentials
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return supabase;
}; 