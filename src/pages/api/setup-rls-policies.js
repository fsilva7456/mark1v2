import { createServerSupabaseClient } from '@/lib/supabase';

/**
 * API route to set up RLS policies for the content_plans table
 * This should be run once to configure the database properly
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', error: 'Method not allowed' });
  }

  try {
    // Check for admin key in headers for basic security
    const adminKey = req.headers['x-admin-key'];
    if (!adminKey || adminKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(401).json({ status: 'error', error: 'Unauthorized' });
    }

    // Initialize Supabase client - note: this would still need a service role key
    // This is just to provide the SQL commands needed for manual execution
    const supabase = createServerSupabaseClient();
    
    // The SQL needed to enable RLS and set appropriate policies
    const rls_setup_sql = `
-- Enable RLS on the content_plans table
ALTER TABLE content_plans ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to select their own content plans
CREATE POLICY "Users can view their own content plans" 
ON content_plans FOR SELECT 
USING (auth.uid() = user_id);

-- Create a policy that allows users to insert their own content plans
CREATE POLICY "Users can create their own content plans" 
ON content_plans FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows users to update their own content plans
CREATE POLICY "Users can update their own content plans" 
ON content_plans FOR UPDATE 
USING (auth.uid() = user_id);

-- Create a policy that allows users to delete their own content plans
CREATE POLICY "Users can delete their own content plans" 
ON content_plans FOR DELETE 
USING (auth.uid() = user_id);
    `;

    return res.status(200).json({
      status: 'success',
      message: 'RLS policy setup instructions generated',
      sql: rls_setup_sql,
      instructions: 'Run these SQL commands in your Supabase SQL editor to set up proper RLS policies.'
    });
  } catch (error) {
    console.error('Error in setup-rls-policies API:', error);
    return res.status(500).json({ 
      status: 'error',
      error: error.message || 'An unexpected error occurred'
    });
  }
} 