import { createClient } from '@supabase/supabase-js';

/**
 * API route to generate social media posts using Gemini API
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', error: 'Method not allowed' });
  }

  try {
    const { strategy_id, content_plan_id, post_type } = req.body;
    
    // Validate required fields
    if (!strategy_id) {
      return res.status(400).json({ 
        status: 'error', 
        error: 'Strategy ID is required' 
      });
    }

    if (!post_type) {
      return res.status(400).json({ 
        status: 'error', 
        error: 'Post type is required' 
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

    // Fetch the content plan if a content_plan_id was provided
    let contentPlanData = null;
    if (content_plan_id) {
      const { data, error: contentPlanError } = await supabase
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
      
      contentPlanData = data;
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

    // Call the Gemini API
    const geminiResponse = await callGeminiApi(prompt);
    
    // Process the response
    const generatedPost = processGeminiResponse(geminiResponse);

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
 * Make a request to the Gemini API
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {Promise<Object>} - The response from Gemini
 */
async function callGeminiApi(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
  }
  
  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';
  
  const response = await fetch(`${apiUrl}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * Process the Gemini API response to extract relevant text
 * @param {Object} response - The raw response from Gemini API
 * @returns {string} - The extracted text
 */
function processGeminiResponse(response) {
  // Extract the text from Gemini's response
  if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
    return response.candidates[0].content.parts[0].text;
  }
  
  throw new Error('Unexpected response format from Gemini API');
}

/**
 * Builds a prompt for the LLM to generate a social media post
 */
function buildSocialMediaPostPrompt({ strategy, contentPlan, postType, previousPosts }) {
  const previousPostsText = previousPosts.length > 0 
    ? `Previous posts:\n${previousPosts.map(post => `- ${post.post_text} (${post.post_type})`).join('\n')}`
    : 'No previous posts.';
  
  const contentPlanText = contentPlan 
    ? `CONTENT PLAN:\n${contentPlan.content_plan_text}`
    : 'CONTENT PLAN:\nNo content plan provided. Generate based on business strategy only.';

  return `
Create a compelling social media post for ${postType} that aligns with this business strategy and content plan:

BUSINESS STRATEGY:
- Business Type: ${strategy.business_type}
- Target Audience: ${strategy.audience}
- Business Objectives: ${strategy.objectives}
- Unique Differentiation: ${strategy.differentiation}

${contentPlanText}

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