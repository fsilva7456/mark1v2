import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase';

type ResponseData = {
  status: 'success' | 'error';
  message?: string;
  error?: string;
};

/**
 * API route to set up Row Level Security (RLS) policies for Supabase tables
 * This should be run once during initial setup or when policies need to be updated
 * 
 * @param {NextApiRequest} req - The request object
 * @param {NextApiResponse<ResponseData>} res - The response object
 */
export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      status: 'error', 
      error: 'Method not allowed. Only POST requests are accepted.' 
    });
  }

  try {
    // Initialize Supabase admin client with service role key to bypass RLS
    const supabase = createServerSupabaseClient({ admin: true });
    
    console.log('Setting up RLS policies...');

    // Execute multiple RLS policies in a single SQL transaction
    const { error: policyError } = await supabase.rpc('execute_sql', {
      sql: `
        BEGIN;
        
        -- Policy for content_plans: Allow creation of content plans with null user_id
        CREATE POLICY IF NOT EXISTS "Allow creation of public content plans" 
          ON content_plans FOR INSERT 
          WITH CHECK (user_id IS NULL);

        -- Policy for content_plans: Allow users to view their own content plans
        CREATE POLICY IF NOT EXISTS "Allow users to view their own content plans" 
          ON content_plans FOR SELECT 
          USING (auth.uid() = user_id OR user_id IS NULL);
        
        -- Policy for content_plans: Allow users to update their own content plans
        CREATE POLICY IF NOT EXISTS "Allow users to update their own content plans" 
          ON content_plans FOR UPDATE 
          USING (auth.uid() = user_id);

        COMMIT;
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
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
} 