/**
 * API endpoint for checking the progress of a strategy generation
 * This could be used for streaming responses in the future
 */

// This should be shared with the strategyGenerate.js endpoint in production
// For this sample, we just maintain a placeholder map
const activeGenerations = new Map();

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { requestId } = req.query;
    
    if (!requestId) {
      return res.status(400).json({ error: 'requestId is required' });
    }

    // Check if we have information about this generation
    const generationInfo = activeGenerations.get(requestId);
    
    if (!generationInfo) {
      return res.status(404).json({ 
        error: 'Generation not found. It may have completed or expired.',
        status: 'not_found'
      });
    }

    // Return the progress information
    return res.status(200).json({
      requestId,
      status: generationInfo.status,
      progress: generationInfo.progress,
      startTime: generationInfo.startTime,
      completionTime: generationInfo.completionTime,
    });
  } catch (error) {
    console.error('Error checking generation progress:', error);
    return res.status(500).json({ 
      error: error.message || 'An error occurred while checking generation progress',
      status: 'error'
    });
  }
} 