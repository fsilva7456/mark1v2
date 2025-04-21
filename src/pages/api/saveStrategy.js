import { createServerSupabaseClient } from '@/lib/supabase';

/**
 * API handler for saving strategies to Supabase
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      name, 
      user_id, 
      business_type, 
      objectives, 
      audience, 
      differentiation, 
      matrix_content 
    } = req.body;
    
    // Validate required fields
    if (!name || !matrix_content) {
      return res.status(400).json({ error: 'Strategy name and content are required' });
    }

    // Initialize Supabase client
    const supabase = createServerSupabaseClient();
    
    // Insert the strategy into Supabase
    const { data, error } = await supabase
      .from('strategies')
      .insert([{ 
        name,
        user_id: user_id || 'anonymous', // Fallback until auth is implemented
        business_type,
        objectives,
        audience,
        differentiation,
        matrix_content
      }])
      .select();

    if (error) {
      console.error('Error saving strategy to Supabase:', error);
      return res.status(500).json({ 
        error: error.message || 'Failed to save strategy to database',
        status: 'error'
      });
    }

    // Return the saved strategy data
    return res.status(200).json({
      data: data[0],
      status: 'success',
      message: 'Strategy saved successfully'
    });
  } catch (error) {
    console.error('Error in saveStrategy API:', error);
    return res.status(500).json({ 
      error: error.message || 'An unexpected error occurred',
      status: 'error'
    });
  }
} 