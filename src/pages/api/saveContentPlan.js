import { createClient } from '@supabase/supabase-js';

/**
 * API route to save content plans to Supabase
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', error: 'Method not allowed' });
  }

  try {
    const { strategy_id, special_considerations, content_plan_text } = req.body;
    
    // Validate required fields
    if (!strategy_id || !content_plan_text) {
      return res.status(400).json({ 
        status: 'error', 
        error: 'Strategy ID and content plan text are required' 
      });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ status: 'error', error: 'Supabase credentials are missing' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert the content plan into Supabase
    const { data, error } = await supabase
      .from('content_plans')
      .insert([{ 
        strategy_id,
        special_considerations,
        content_plan_text
      }])
      .select();

    if (error) {
      console.error('Error saving content plan to Supabase:', error);
      return res.status(500).json({ 
        status: 'error',
        error: error.message || 'Failed to save content plan to database'
      });
    }

    // Return the saved content plan data
    return res.status(200).json({
      status: 'success',
      data: data[0],
      message: 'Content plan saved successfully'
    });
  } catch (error) {
    console.error('Error in saveContentPlan API:', error);
    return res.status(500).json({ 
      status: 'error',
      error: error.message || 'An unexpected error occurred'
    });
  }
} 