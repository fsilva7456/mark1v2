/**
 * Client for making LLM requests to generate content plans
 */

interface ContentPlanResponse {
  text: string | null;
  error: string | null;
}

/**
 * Generates a content plan using the Gemini API
 * 
 * @param {string} prompt - The prompt containing strategy and special considerations
 * @returns {Promise<ContentPlanResponse>} The generated content plan or error
 */
export async function generateContentPlan(prompt: string): Promise<ContentPlanResponse> {
  try {
    const response = await fetch('/api/contentPlanGenerate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    
    if (result.status === 'error') {
      throw new Error(result.error || 'Error generating content plan');
    }

    return {
      text: result.text || null,
      error: null,
    };
  } catch (error) {
    console.error('Error generating content plan:', error);
    return {
      text: null,
      error: error instanceof Error ? error.message : 'Failed to generate content plan',
    };
  }
}

/**
 * Saves a generated content plan to the database
 * 
 * @param {object} contentPlan - The content plan data to save
 * @returns {Promise<object>} The save result
 */
export async function saveContentPlan(contentPlan: {
  strategy_id: string;
  special_considerations: string;
  content_plan_text: string;
}): Promise<{ status: 'success' | 'error'; error?: string; data?: any }> {
  try {
    const response = await fetch('/api/saveContentPlan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contentPlan),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving content plan:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to save content plan',
    };
  }
} 