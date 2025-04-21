/**
 * API endpoint for generating strategic plans using Google's Gemini API
 */
import { v4 as uuidv4 } from 'uuid';

// Record of in-progress generations (would use Redis or another storage in production)
const activeGenerations = new Map();

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
 * Make a request to the Gemini API
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {Promise<Object>} - The response from Gemini
 */
async function callGeminiApi(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
  }
  
  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent';
  
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
        maxOutputTokens: 2048,
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
 * API handler for generating strategies
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Generate a unique ID for this request
    const requestId = uuidv4();
    
    // Store information about this generation
    activeGenerations.set(requestId, {
      status: 'processing',
      progress: 0,
      startTime: Date.now(),
    });

    // Call the Gemini API
    const geminiResponse = await callGeminiApi(prompt);
    
    // Process the response
    const text = processGeminiResponse(geminiResponse);
    
    // Update generation status
    activeGenerations.set(requestId, {
      status: 'completed',
      progress: 100,
      completionTime: Date.now(),
    });

    // After some time, clean up this generation record
    setTimeout(() => {
      activeGenerations.delete(requestId);
    }, 3600000); // Clean up after 1 hour

    // Return the generated text
    return res.status(200).json({
      requestId,
      text,
      status: 'success'
    });
  } catch (error) {
    console.error('Strategy generation error:', error);
    return res.status(500).json({ 
      error: error.message || 'An error occurred during strategy generation',
      status: 'error'
    });
  }
} 