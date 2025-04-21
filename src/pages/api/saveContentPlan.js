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
    const { 
      strategy_id, 
      special_considerations, 
      content_plan_text,
      title,
      user_id
    } = req.body;
    
    // Validate required fields
    if (!strategy_id || !content_plan_text) {
      return res.status(400).json({ 
        status: 'error', 
        error: 'Strategy ID and content plan text are required' 
      });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ status: 'error', error: 'Supabase credentials are missing' });
    }
    
    // Creating client with service role key which can bypass RLS
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });

    // If no user_id was provided, try to get the strategy's user_id
    let finalUserId = user_id;
    if (!finalUserId) {
      try {
        const { data: strategyData } = await supabase
          .from('strategies')
          .select('user_id')
          .eq('id', strategy_id)
          .single();
        
        if (strategyData) {
          finalUserId = strategyData.user_id;
        }
      } catch {
        console.log('Could not fetch strategy user_id, continuing with null');
      }
    }

    // Insert the content plan into Supabase
    const { data, error } = await supabase
      .from('content_plans')
      .insert([{ 
        strategy_id,
        special_considerations,
        content_plan_text,
        title: title || 'Content Plan',
        user_id: finalUserId || null,
        status: 'active'
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