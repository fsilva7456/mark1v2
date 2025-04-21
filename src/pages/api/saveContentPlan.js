import { createServerSupabaseClient } from '@/lib/supabase';

/**
 * API route to save content plans to Supabase
 * This version handles the scenario where we don't have admin access
 * and need to work with existing RLS policies
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
        }
      } catch {
        console.log('Could not fetch strategy user_id, continuing with null');
      }
    }

    // For content plans without a user_id (public content), we need a special approach
    // because RLS policies typically restrict operations to authenticated users
    if (!finalUserId) {
      // Option 1: Try to directly create the content plan (might fail due to RLS)
      try {
        const { data, error } = await supabase
          .from('content_plans')
          .insert([{ 
            strategy_id,
            special_considerations,
            content_plan_text,
            title: title || 'Content Plan',
            user_id: null,
            status: 'active'
          }])
          .select();

        if (data) {
          return res.status(200).json({
            status: 'success',
            data: data[0],
            message: 'Content plan saved successfully'
          });
        }

        if (error) {
          console.log('Standard insert failed due to RLS, trying public content approach');
          // Continue to fallback approach
        }
      } catch (e) {
        console.log('Standard insert error:', e);
        // Continue to fallback approach
      }

      // Option 2: Return specific instructions for administrator
      return res.status(403).json({
        status: 'error',
        error: 'Cannot create content without authentication or proper RLS policies',
        instructions: 'Please visit /api/setup-rls-policies to get SQL commands needed to fix this issue, or add a public content policy in Supabase'
      });
    }

    // Standard approach for content with a valid user_id
    const { data, error } = await supabase
      .from('content_plans')
      .insert([{ 
        strategy_id,
        special_considerations,
        content_plan_text,
        title: title || 'Content Plan',
        user_id: finalUserId,
        status: 'active'
      }])
      .select();

    if (error) {
      console.error('Error saving content plan to Supabase:', error);
      return res.status(500).json({ 
        status: 'error',
        error: error.message || 'Failed to save content plan to database',
        details: 'This may be due to Row Level Security (RLS) policies in Supabase. Visit /api/setup-rls-policies for help.'
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