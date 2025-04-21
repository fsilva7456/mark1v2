import { createClient } from '@supabase/supabase-js';

/**
 * API route to save social media posts to Supabase
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', error: 'Method not allowed' });
  }

  try {
    const { 
      strategy_id, 
      content_plan_id, 
      post_text, 
      post_type, 
      post_status = 'draft',
      scheduled_date = null 
    } = req.body;
    
    // Validate required fields
    if (!strategy_id || !post_text || !post_type) {
      return res.status(400).json({ 
        status: 'error', 
        error: 'Strategy ID, post text, and post type are required' 
      });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ status: 'error', error: 'Supabase credentials are missing' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Prepare the data to insert
    const postData = {
      strategy_id,
      content_plan_id,
      post_text,
      post_type,
      post_status,
      scheduled_date: scheduled_date ? new Date(scheduled_date).toISOString() : null,
      posted_date: post_status === 'posted' ? new Date().toISOString() : null
    };

    // Insert the social media post into Supabase
    const { data, error } = await supabase
      .from('social_media_posts')
      .insert([postData])
      .select();

    if (error) {
      console.error('Error saving social media post to Supabase:', error);
      return res.status(500).json({ 
        status: 'error',
        error: error.message || 'Failed to save social media post to database'
      });
    }

    // Return the saved post data
    return res.status(200).json({
      status: 'success',
      data: data[0],
      message: 'Social media post saved successfully'
    });
  } catch (error) {
    console.error('Error in saveSocialPost API:', error);
    return res.status(500).json({ 
      status: 'error',
      error: error.message || 'An unexpected error occurred'
    });
  }
} 