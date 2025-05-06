import { SocialMediaPostResponse, SocialMediaPostsResponse } from './types';

/**
 * Generate a social media post using the backend API
 * 
 * @param {object} params - Parameters for generating the post
 * @returns {Promise<{text: string | null, error: string | null}>} Generated post text or error
 */
export async function generateSocialPost(params: {
  strategy_id: string;
  content_plan_id?: string;
  post_type: string;
}): Promise<{text: string | null, error: string | null}> {
  try {
    const response = await fetch('/api/generateSocialPost', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    
    if (result.status === 'error') {
      throw new Error(result.error || 'Error generating social media post');
    }

    return {
      text: result.text || null,
      error: null,
    };
  } catch (error) {
    console.error('Error generating social media post:', error);
    return {
      text: null,
      error: error instanceof Error ? error.message : 'Failed to generate social media post',
    };
  }
}

/**
 * Save a social media post to the database
 * 
 * @param {object} postData - The post data to save
 * @returns {Promise<SocialMediaPostResponse>} The save result
 */
export async function saveSocialPost(postData: {
  strategy_id: string;
  content_plan_id?: string;
  post_text: string;
  post_type: string;
  post_status?: 'draft' | 'scheduled' | 'posted';
  scheduled_date?: string;
}): Promise<SocialMediaPostResponse> {
  try {
    const response = await fetch('/api/saveSocialPost', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving social media post:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to save social media post',
    };
  }
}

/**
 * Fetch social media posts for a strategy and optional content plan
 * 
 * @param {object} params - Query parameters
 * @returns {Promise<SocialMediaPostsResponse>} The fetched posts
 */
export async function fetchSocialPosts(params: {
  strategy_id: string;
  content_plan_id?: string;
}): Promise<SocialMediaPostsResponse> {
  try {
    // Build query string
    const queryParams = new URLSearchParams({
      strategy_id: params.strategy_id,
    });
    
    if (params.content_plan_id) {
      queryParams.append('content_plan_id', params.content_plan_id);
    }
    
    const response = await fetch(`/api/getSocialPosts?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching social media posts:', error);
    return {
      status: 'error',
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch social media posts',
    };
  }
} 