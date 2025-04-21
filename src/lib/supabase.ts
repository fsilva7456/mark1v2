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
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseKey);
};

// Types for strategies
export interface Strategy {
  id: string;
  name: string;
  user_id: string;
  business_type: string;
  objectives: string;
  audience: string;
  differentiation: string;
  matrix_content: string;
  created_at: string;
  updated_at: string;
} 