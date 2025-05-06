/**
 * Service for interacting with strategies in the content management module
 */

/**
 * Fetches all available strategies from the API
 * 
 * @returns {Promise<Array>} - Array of strategy objects
 * @throws {Error} - If fetching fails
 */
export async function fetchStrategies() {
  try {
    const response = await fetch('/api/getStrategies');
    const result = await response.json();
    
    if (result.status !== 'success') {
      throw new Error(result.error || 'Failed to fetch strategies');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching strategies:', error);
    throw error;
  }
}

/**
 * Retrieves a strategy by its ID
 * 
 * @param {string} id - The strategy ID to retrieve
 * @returns {Promise<Object>} - The strategy object
 * @throws {Error} - If fetching fails
 */
export async function fetchStrategyById(id) {
  try {
    const response = await fetch(`/api/getStrategy?id=${id}`);
    const result = await response.json();
    
    if (result.status !== 'success') {
      throw new Error(result.error || 'Failed to fetch strategy');
    }
    
    return result.data;
  } catch (error) {
    console.error(`Error fetching strategy ${id}:`, error);
    throw error;
  }
} 