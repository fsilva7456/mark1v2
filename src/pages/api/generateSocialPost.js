import { createClient } from '@supabase/supabase-js';

/**
 * API route to generate social media posts using LLM
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', error: 'Method not allowed' });
  }

  try {
    const { strategy_id, content_plan_id, post_type } = req.body;
    
    // Validate required fields
    if (!strategy_id || !content_plan_id || !post_type) {
      return res.status(400).json({ 
        status: 'error', 
        error: 'Strategy ID, content plan ID, and post type are required' 
      });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ status: 'error', error: 'Supabase credentials are missing' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the strategy details
    const { data: strategyData, error: strategyError } = await supabase
      .from('strategies')
      .select('*')
      .eq('id', strategy_id)
      .single();

    if (strategyError) {
      console.error('Error fetching strategy:', strategyError);
      return res.status(500).json({ 
        status: 'error',
        error: strategyError.message || 'Failed to fetch strategy'
      });
    }

    // Fetch the content plan
    const { data: contentPlanData, error: contentPlanError } = await supabase
      .from('content_plans')
      .select('*')
      .eq('id', content_plan_id)
      .single();

    if (contentPlanError) {
      console.error('Error fetching content plan:', contentPlanError);
      return res.status(500).json({ 
        status: 'error',
        error: contentPlanError.message || 'Failed to fetch content plan'
      });
    }

    // Fetch previous posts for this strategy to avoid repetition
    const { data: previousPosts, error: postsError } = await supabase
      .from('social_media_posts')
      .select('post_text, post_type')
      .eq('strategy_id', strategy_id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (postsError) {
      console.error('Error fetching previous posts:', postsError);
      // Non-critical error, we can continue without previous posts
    }

    // Prepare the prompt for the LLM
    const prompt = buildSocialMediaPostPrompt({
      strategy: strategyData,
      contentPlan: contentPlanData,
      postType: post_type,
      previousPosts: previousPosts || []
    });

    // Call the OpenAI API for completion
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional social media content creator that specializes in creating engaging and strategic social media posts.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API error: ${errorData}`);
    }

    const result = await response.json();
    const generatedPost = result.choices[0].message.content.trim();

    return res.status(200).json({
      status: 'success',
      text: generatedPost
    });
  } catch (error) {
    console.error('Error in generateSocialPost API:', error);
    return res.status(500).json({ 
      status: 'error',
      error: error.message || 'An unexpected error occurred'
    });
  }
}

/**
 * Builds a prompt for the LLM to generate a social media post
 */
function buildSocialMediaPostPrompt({ strategy, contentPlan, postType, previousPosts }) {
  const previousPostsText = previousPosts.length > 0 
    ? `Previous posts:\n${previousPosts.map(post => `- ${post.post_text} (${post.post_type})`).join('\n')}`
    : 'No previous posts.';

  return `
Create a compelling social media post for ${postType} that aligns with this business strategy and content plan:

BUSINESS STRATEGY:
- Business Type: ${strategy.business_type}
- Target Audience: ${strategy.audience}
- Business Objectives: ${strategy.objectives}
- Unique Differentiation: ${strategy.differentiation}

CONTENT PLAN:
${contentPlan.content_plan_text}

PREVIOUS POSTS (DO NOT REPEAT THESE):
${previousPostsText}

Create ONE ${postType} post that:
1. Aligns with the strategy and current content plan
2. Is engaging and compelling for the target audience
3. Has appropriate tone, length, and format for ${postType}
4. Includes relevant hashtags if appropriate
5. Encourages engagement (likes, comments, shares)
6. Is entirely unique compared to previous posts

ONLY output the post text without any explanations or introductions.
`;
} 