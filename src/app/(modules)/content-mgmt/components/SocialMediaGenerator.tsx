import { useState, useEffect } from 'react';
import { generateSocialPost, saveSocialPost, fetchSocialPosts } from '../utils/socialMediaService';
import { SocialMediaPost } from '../utils/types';

interface SocialMediaGeneratorProps {
  strategyId: string;
  contentPlanId: string | null;
}

/**
 * Component for generating and managing social media posts
 */
export default function SocialMediaGenerator({ strategyId, contentPlanId }: SocialMediaGeneratorProps) {
  const [postType, setPostType] = useState<string>('Twitter');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedPosts, setSavedPosts] = useState<SocialMediaPost[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showSavedPosts, setShowSavedPosts] = useState<boolean>(false);

  // Use useEffect to log when the component is mounted for debugging
  useEffect(() => {
    console.log('SocialMediaGenerator mounted with contentPlanId:', contentPlanId);
  }, [contentPlanId]);

  // Don't render if no content plan
  if (!contentPlanId) {
    return null;
  }

  const handlePostTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPostType(e.target.value);
  };

  const handleGeneratePost = async () => {
    if (!strategyId || !contentPlanId) {
      setError('Strategy and content plan are required to generate a post');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedText(null);
    setMessage(null);

    try {
      const result = await generateSocialPost({
        strategy_id: strategyId,
        content_plan_id: contentPlanId,
        post_type: postType
      });

      if (result.error) {
        setError(result.error);
      } else if (result.text) {
        setGeneratedText(result.text);
      } else {
        setError('Failed to generate post - received empty response');
      }
    } catch (err) {
      console.error('Error generating social media post:', err);
      setError('An unexpected error occurred while generating the post');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePost = async () => {
    if (!strategyId || !contentPlanId || !generatedText) {
      setMessage({
        text: 'Cannot save: missing strategy, content plan, or post text',
        type: 'error'
      });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const result = await saveSocialPost({
        strategy_id: strategyId,
        content_plan_id: contentPlanId,
        post_text: generatedText,
        post_type: postType,
        post_status: 'draft'
      });

      if (result.status === 'success') {
        setMessage({
          text: 'Social media post saved successfully!',
          type: 'success'
        });
        setGeneratedText(null);
        // Refresh the list of saved posts if it's visible
        if (showSavedPosts) {
          loadSavedPosts();
        }
      } else {
        throw new Error(result.error || 'Failed to save social media post');
      }
    } catch (err) {
      console.error('Error saving social media post:', err);
      setMessage({
        text: err instanceof Error ? err.message : 'Failed to save social media post',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const loadSavedPosts = async () => {
    if (!strategyId || !contentPlanId) return;

    try {
      const result = await fetchSocialPosts({
        strategy_id: strategyId,
        content_plan_id: contentPlanId
      });

      if (result.status === 'success' && result.data) {
        setSavedPosts(result.data);
      } else {
        console.error('Failed to load saved posts:', result.error);
      }
    } catch (err) {
      console.error('Error fetching saved posts:', err);
    }
  };

  const toggleSavedPosts = async () => {
    const newState = !showSavedPosts;
    setShowSavedPosts(newState);
    
    if (newState) {
      await loadSavedPosts();
    }
  };

  return (
    <div className="mt-6 bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Social Media Post Generator</h2>
      <p className="text-gray-600 mb-4">
        Generate social media posts based on your strategy and content plan.
      </p>

      <div className="mb-4">
        <label htmlFor="post-type" className="block text-sm font-medium text-gray-700 mb-1">
          Platform
        </label>
        <select
          id="post-type"
          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={postType}
          onChange={handlePostTypeChange}
        >
          <option value="Twitter">Twitter/X</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Facebook">Facebook</option>
          <option value="Instagram">Instagram</option>
        </select>
      </div>

      <div className="flex justify-start mb-6 space-x-4">
        <button
          onClick={handleGeneratePost}
          disabled={isGenerating || !contentPlanId}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate Post'}
        </button>
        
        <button
          onClick={toggleSavedPosts}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {showSavedPosts ? 'Hide Saved Posts' : 'Show Saved Posts'}
        </button>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {generatedText && (
        <div className="mt-6">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-medium">Generated Post for {postType}</h3>
            <button
              onClick={handleSavePost}
              disabled={isSaving}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Post'}
            </button>
          </div>

          {message && (
            <div className={`p-3 mb-4 rounded-md ${
              message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {message.text}
            </div>
          )}

          <div className="p-4 border border-gray-300 rounded-md bg-gray-50 whitespace-pre-wrap">
            {generatedText}
          </div>
        </div>
      )}

      {showSavedPosts && savedPosts.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Saved Posts</h3>
          <div className="space-y-4">
            {savedPosts.map((post) => (
              <div key={post.id} className="p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{post.post_type}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{post.post_text}</p>
                <div className="mt-2 text-xs text-gray-500">
                  Status: <span className="px-2 py-0.5 bg-gray-100 rounded">{post.post_status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSavedPosts && savedPosts.length === 0 && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md text-center text-gray-600">
          No saved posts found for this content plan.
        </div>
      )}
    </div>
  );
} 