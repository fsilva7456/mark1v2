import { createClient } from '@supabase/supabase-js';

/**
 * API route to fetch social media posts from Supabase
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ status: 'error', error: 'Method not allowed' });
  }

  try {
    const { strategy_id, content_plan_id } = req.query;
    
    // Validate required fields
    if (!strategy_id) {
      return res.status(400).json({ 
        status: 'error', 
        error: 'Strategy ID is required' 
      });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ status: 'error', error: 'Supabase credentials are missing' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query builder
    let query = supabase
      .from('social_media_posts')
      .select('*')
      .eq('strategy_id', strategy_id)
      .order('created_at', { ascending: false });
    
    // Add content plan filter if specified
    if (content_plan_id) {
      query = query.eq('content_plan_id', content_plan_id);
    }

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching social media posts from Supabase:', error);
      return res.status(500).json({ 
        status: 'error',
        error: error.message || 'Failed to fetch social media posts from database'
      });
    }

    // Return the posts data
    return res.status(200).json({
      status: 'success',
      data: data || [],
      message: 'Social media posts fetched successfully'
    });
  } catch (error) {
    console.error('Error in getSocialPosts API:', error);
    return res.status(500).json({ 
      status: 'error',
      error: error.message || 'An unexpected error occurred'
    });
  }
} 