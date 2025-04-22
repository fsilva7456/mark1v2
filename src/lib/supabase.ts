import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are properly loaded
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Supabase client for browser-side usage
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Create a Supabase server client (for API routes)
export const createServerSupabaseClient = (options?: { admin?: boolean }) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  // Use service role key when admin is true to bypass RLS
  const supabaseKey = options?.admin 
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseKey);
};

// Types for strategies
export interface Strategy {
  id: string;
  name: string;
  user_id: string; // UUID stored as string
  business_type: string;
  objectives: string;
  audience: string;
  differentiation: string;
  matrix_content: string;
  created_at: string;
  updated_at: string;
} 