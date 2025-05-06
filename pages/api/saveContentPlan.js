import { createServerSupabaseClient } from '@/lib/supabase';

/**
 * API route to save content plans to Supabase
 * This endpoint creates content plans with null user_id to bypass RLS
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
    
    console.log('Received request to save content plan:', { strategy_id, title });
    
    // Validate required fields
    if (!strategy_id || !content_plan_text) {
      return res.status(400).json({ 
        status: 'error', 
        error: 'Strategy ID and content plan text are required' 
      });
    }

    // Initialize Supabase client
    const supabase = createServerSupabaseClient();

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
          console.log('Found user_id from strategy:', finalUserId);
        }
      } catch {
        console.log('Could not fetch strategy user_id, continuing with null');
      }
    }

    // Insert the content plan as a public plan (null user_id)
    // This relies on a specific RLS policy to allow null user_id inserts
    const contentPlan = { 
      strategy_id,
      special_considerations,
      content_plan_text,
      title: title || 'Content Plan',
      user_id: null, // Force user_id to be null to work with public content RLS policy
      status: 'active'
    };
    
    console.log('Inserting content plan with:', contentPlan);
    
    const { data, error } = await supabase
      .from('content_plans')
      .insert([contentPlan])
      .select();

    if (error) {
      console.error('Error saving content plan to Supabase:', error);
      return res.status(500).json({ 
        status: 'error',
        error: error.message || 'Failed to save content plan to database',
        details: 'Make sure to add a policy allowing null user_id inserts: CREATE POLICY "Allow creation of public content plans" ON content_plans FOR INSERT WITH CHECK (user_id IS NULL);'
      });
    }

    console.log('Content plan saved successfully:', data[0].id);
    
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