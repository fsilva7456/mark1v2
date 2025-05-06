/**
 * Client-side service for content management operations
 */

export interface Strategy {
  id: string;
  name: string;
  business_type: string;
  created_at: string;
}

export interface StrategiesResponse {
  data: Strategy[];
  status: 'success' | 'error';
  error?: string;
}

/**
 * Fetch all strategies from the backend
 * @returns {Promise<StrategiesResponse>} The list of strategies
 */
export async function fetchStrategies(): Promise<StrategiesResponse> {
  try {
    const response = await fetch('/api/getStrategies', {
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
    console.error('Error fetching strategies:', error);
    return {
      data: [],
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to fetch strategies'
    };
  }
} 