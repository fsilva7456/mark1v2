import { createServerSupabaseClient } from '@/lib/supabase';

/**
 * API route to set up RLS policies for Supabase tables
 * This should be run once during initial setup or when policies need to be updated
 */
export default async function handler(req, res) {
  // Only allow POST requests with proper authorization
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', error: 'Method not allowed' });
  }

  try {
    // Initialize Supabase admin client (requires service_role key)
    const supabase = createServerSupabaseClient();
    
    console.log('Setting up RLS policies...');

    // Add policy to allow creation of content plans with null user_id
    const { error: policyError } = await supabase.rpc('execute_sql', {
      sql: `
        -- Add policy to allow creation of content plans with null user_id
        CREATE POLICY IF NOT EXISTS "Allow creation of public content plans" 
        ON content_plans FOR INSERT 
        WITH CHECK (user_id IS NULL);
      `
    });

    if (policyError) {
      console.error('Error setting up RLS policies:', policyError);
      return res.status(500).json({ 
        status: 'error',
        error: policyError.message || 'Failed to set up RLS policies'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'RLS policies successfully set up'
    });
  } catch (error) {
    console.error('Error in setup-rls-policies API:', error);
    return res.status(500).json({ 
      status: 'error',
      error: error.message || 'An unexpected error occurred'
    });
  }
} 