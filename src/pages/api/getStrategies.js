import { createClient } from '@supabase/supabase-js';

/**
 * API route to get all strategies
 *
 * @param {object} req - Next.js API request
 * @param {object} res - Next.js API response
 * @returns {object} JSON response with strategies data
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ status: 'error', error: 'Method not allowed' });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ status: 'error', error: 'Supabase credentials are missing' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all strategies
    // Optional: Add query parameters for pagination or filtering
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ status: 'error', error: error.message });
    }

    // Return the strategies data
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ status: 'error', error: 'Internal server error' });
  }
} 