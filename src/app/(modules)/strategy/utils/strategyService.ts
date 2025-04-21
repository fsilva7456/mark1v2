/**
 * Client-side service for saving strategies to Supabase
 */

export interface SaveStrategyParams {
  name: string;
  user_id: string; // Will be converted to UUID on the server if 'anonymous'
  business_type: string;
  objectives: string;
  audience: string;
  differentiation: string;
  matrix_content: string;
}

export interface SaveStrategyResponse {
  data?: any;
  status: 'success' | 'error';
  message?: string;
  error?: string;
}

/**
 * Save a strategy to Supabase
 * @param {SaveStrategyParams} strategy - The strategy to save
 * @returns {Promise<SaveStrategyResponse>} - The saved strategy or error
 */
export async function saveStrategy(strategy: SaveStrategyParams): Promise<SaveStrategyResponse> {
  try {
    const response = await fetch('/api/saveStrategy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(strategy),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving strategy:', error);
    throw error;
  }
} 