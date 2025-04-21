/**
 * Client-side utility for making API calls to the strategy generation endpoint
 * Provides retries, error handling, and logging
 */

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // milliseconds

/**
 * Generate a strategy using the LLM API
 * @param {string} prompt - The prompt to send to the LLM
 * @returns {Promise<{text: string, error: string|null}>} - The generated strategy or error
 */
export async function generateStrategy(prompt) {
  let attempts = 0;
  let lastError = null;

  while (attempts < MAX_RETRIES) {
    attempts++;
    
    try {
      console.log(`Strategy generation attempt ${attempts}/${MAX_RETRIES}`);
      
      const response = await fetch('/api/strategyGenerate', {
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

      const data = await response.json();
      console.log('Strategy generated successfully');
      
      return {
        text: data.text,
        error: null
      };
    } catch (error) {
      console.error(`Strategy generation error (attempt ${attempts}/${MAX_RETRIES}):`, error);
      lastError = error.message;
      
      // If we have more retries left, wait before trying again
      if (attempts < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempts));
      }
    }
  }

  // If we've exhausted all retries, return with error
  return {
    text: null,
    error: `Failed to generate strategy after ${MAX_RETRIES} attempts. Last error: ${lastError}`
  };
}

/**
 * Monitor the generation progress (for future use with streaming)
 * @param {string} requestId - The ID of the generation request
 * @returns {Promise<{progress: number, status: string}>} - The progress information
 */
export async function checkGenerationProgress(requestId) {
  try {
    const response = await fetch(`/api/strategyProgress?requestId=${requestId}`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`API error (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking generation progress:', error);
    return {
      progress: 0,
      status: 'error',
      error: error.message
    };
  }
} 