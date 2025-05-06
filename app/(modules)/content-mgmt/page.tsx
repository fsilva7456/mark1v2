'use client';

import { useState, useEffect } from 'react';
import { fetchStrategies, Strategy } from './utils/contentService';
import { marked } from 'marked';
import { buildContentOutlinePrompt } from './utils/contentOutlinePromptBuilder';
import { generateContentPlan, saveContentPlan } from './utils/contentLlmClient';
import { FullStrategyDetails, SocialMediaPost } from './utils/types';
import { generateSocialPost, saveSocialPost, fetchSocialPosts } from './utils/socialMediaService';
import './styles/contentPlan.css';

/**
 * Content Management page component
 * Allows users to select strategies and manage content
 */
export default function ContentManagementPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Content plan state
  const [specialConsiderations, setSpecialConsiderations] = useState<string>('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [contentPlan, setContentPlan] = useState<string | null>(null);
  const [parsedContentPlan, setParsedContentPlan] = useState<string | null>(null);
  const [contentPlanError, setContentPlanError] = useState<string | null>(null);
  const [savePlanMessage, setSavePlanMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [fullStrategyDetails, setFullStrategyDetails] = useState<FullStrategyDetails | null>(null);
  const [savedContentPlanId, setSavedContentPlanId] = useState<string | null>(null);
  
  // Social media post state
  const [postType, setPostType] = useState<string>('Twitter');
  const [isGeneratingPost, setIsGeneratingPost] = useState<boolean>(false);
  const [isSavingPost, setIsSavingPost] = useState<boolean>(false);
  const [generatedPost, setGeneratedPost] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [savedPosts, setSavedPosts] = useState<SocialMediaPost[]>([]);
  const [postMessage, setPostMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showSavedPosts, setShowSavedPosts] = useState<boolean>(false);

  useEffect(() => {
    async function loadStrategies() {
      setIsLoading(true);
      try {
        const response = await fetchStrategies();
        if (response.status === 'success') {
          setStrategies(response.data);
          // Select the first strategy by default if available
          if (response.data.length > 0) {
            setSelectedStrategyId(response.data[0].id);
          }
        } else {
          setError(response.error || 'Failed to load strategies');
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching strategies');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStrategies();
  }, []);

  // When a strategy is selected, fetch its full details
  useEffect(() => {
    async function fetchStrategyDetails() {
      if (!selectedStrategyId) return;
      
      try {
        const response = await fetch(`/api/getStrategy?id=${selectedStrategyId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch strategy details: ${response.statusText}`);
        }
        
        const result = await response.json();
        if (result.status === 'success') {
          setFullStrategyDetails(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch strategy details');
        }
      } catch (err) {
        console.error('Error fetching strategy details:', err);
      }
    }
    
    setContentPlan(null);
    setParsedContentPlan(null);
    setContentPlanError(null);
    setSavePlanMessage(null);
    setSpecialConsiderations('');
    fetchStrategyDetails();
  }, [selectedStrategyId]);
  
  // Parse content plan to HTML when it changes
  useEffect(() => {
    if (contentPlan) {
      // Configure marked options
      marked.setOptions({
        gfm: true,
        breaks: true,
      });
      
      // Parse the markdown to HTML
      const html = marked.parse(contentPlan) as string;
      
      // Find all week sections and wrap them in div containers
      // This uses regex to identify week sections and restructure the HTML
      const weekTitles = ['Week 1', 'Week 2', 'Week 3'];
      
      // First, find the title and overall theme
      const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);
      const themeMatch = html.match(/<h2[^>]*>(.*?)<\/h2>/);
      
      let restructuredHtml = '';
      
      // Add the title and theme
      if (titleMatch) {
        restructuredHtml += titleMatch[0];
      }
      
      if (themeMatch) {
        restructuredHtml += themeMatch[0];
      }
      
      // Create container for weeks
      restructuredHtml += '<div class="weeks-container">';
      
      // For each week, extract the content and wrap it
      weekTitles.forEach(weekTitle => {
        const weekRegex = new RegExp(`<h3[^>]*>${weekTitle}.*?<\/h3>(.*?)(?=<h3|$)`, 's');
        const weekMatch = html.match(weekRegex);
        
        if (weekMatch) {
          // Extract the content after the h3 (which should be the list)
          const weekContent = weekMatch[1].trim();
          
          // Create a card for this week
          restructuredHtml += `
            <div class="week-card">
              <h3>${weekTitle}</h3>
              <div class="week-content">
                ${weekContent}
              </div>
            </div>
          `;
        }
      });
      
      // Close the weeks container
      restructuredHtml += '</div>';
      
      setParsedContentPlan(restructuredHtml);
    } else {
      setParsedContentPlan(null);
    }
  }, [contentPlan]);

  const handleStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStrategyId(e.target.value);
  };

  const handleSpecialConsiderationsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSpecialConsiderations(e.target.value);
  };

  const handleGenerateContentPlan = async () => {
    if (!fullStrategyDetails) {
      setContentPlanError('Strategy details not available. Please select a strategy.');
      return;
    }
    
    setIsGeneratingPlan(true);
    setContentPlanError(null);
    setContentPlan(null);
    setSavePlanMessage(null);
    
    try {
      // Build the prompt using the content outline prompt builder
      const prompt = buildContentOutlinePrompt({
        strategyName: fullStrategyDetails.name,
        businessType: fullStrategyDetails.business_type,
        objectives: fullStrategyDetails.objectives,
        audience: fullStrategyDetails.audience,
        differentiation: fullStrategyDetails.differentiation,
        specialConsiderations: specialConsiderations
      });
      
      // Call the LLM to generate the content plan
      const result = await generateContentPlan(prompt);
      
      if (result.error) {
        setContentPlanError(result.error);
      } else if (result.text) {
        setContentPlan(result.text);
      } else {
        setContentPlanError('Failed to generate content plan - received empty response');
      }
    } catch (err) {
      console.error('Error generating content plan:', err);
      setContentPlanError('An unexpected error occurred while generating the content plan');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleSaveContentPlan = async () => {
    if (!selectedStrategyId || !contentPlan || !fullStrategyDetails) {
      setSavePlanMessage({
        text: 'Cannot save: missing strategy or content plan',
        type: 'error'
      });
      return;
    }
    
    setIsSavingPlan(true);
    setSavePlanMessage(null);
    
    try {
      // Extract the title from the content plan (first h1)
      const contentTitleMatch = contentPlan.match(/# ([^\n]+)/);
      const contentTitle = contentTitleMatch 
        ? contentTitleMatch[1]
        : `Content Plan for ${fullStrategyDetails.name}`;
      
      const result = await saveContentPlan({
        strategy_id: selectedStrategyId,
        special_considerations: specialConsiderations,
        content_plan_text: contentPlan,
        title: contentTitle,
        user_id: fullStrategyDetails.user_id
      });
      
      if (result.status === 'success') {
        setSavePlanMessage({
          text: 'Content plan saved successfully!',
          type: 'success'
        });
        
        // Safe check if data exists before accessing its properties
        if (result.data) {
          setSavedContentPlanId(result.data.id);
          console.log('Content plan saved with ID:', result.data.id);
        }
      } else {
        throw new Error(result.error || 'Failed to save content plan');
      }
    } catch (err) {
      console.error('Error saving content plan:', err);
      setSavePlanMessage({
        text: err instanceof Error ? err.message : 'Failed to save content plan',
        type: 'error'
      });
    } finally {
      setIsSavingPlan(false);
    }
  };

  const selectedStrategy = strategies.find(
    (strategy) => strategy.id === selectedStrategyId
  );

  // Social media post handlers
  const handlePostTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPostType(e.target.value);
  };

  const handleGeneratePost = async () => {
    if (!selectedStrategyId) {
      setPostError('Strategy is required to generate a post');
      return;
    }

    setIsGeneratingPost(true);
    setPostError(null);
    setGeneratedPost(null);
    setPostMessage(null);

    try {
      // Build request data, making content_plan_id optional
      const requestData = {
        strategy_id: selectedStrategyId,
        post_type: postType
      };
      
      // Add content plan ID if it exists
      if (savedContentPlanId) {
        Object.assign(requestData, { content_plan_id: savedContentPlanId });
      }
      
      const result = await generateSocialPost(requestData);

      if (result.error) {
        setPostError(result.error);
      } else if (result.text) {
        setGeneratedPost(result.text);
      } else {
        setPostError('Failed to generate post - received empty response');
      }
    } catch (err) {
      console.error('Error generating social media post:', err);
      setPostError('An unexpected error occurred while generating the post');
    } finally {
      setIsGeneratingPost(false);
    }
  };

  const handleSavePost = async () => {
    if (!selectedStrategyId || !generatedPost) {
      setPostMessage({
        text: 'Cannot save: missing strategy or post text',
        type: 'error'
      });
      return;
    }

    setIsSavingPost(true);
    setPostMessage(null);

    try {
      // Build post data, making content_plan_id optional
      const postData: {
        strategy_id: string;
        content_plan_id?: string;
        post_text: string;
        post_type: string;
        post_status: 'draft' | 'scheduled' | 'posted';
      } = {
        strategy_id: selectedStrategyId,
        post_text: generatedPost,
        post_type: postType,
        post_status: 'draft'
      };
      
      // Add content plan ID if it exists
      if (savedContentPlanId) {
        postData.content_plan_id = savedContentPlanId;
      }
      
      const result = await saveSocialPost(postData);

      if (result.status === 'success') {
        setPostMessage({
          text: 'Social media post saved successfully!',
          type: 'success'
        });
        setGeneratedPost(null);
        // Refresh the list of saved posts if it's visible
        if (showSavedPosts) {
          loadSavedPosts();
        }
      } else {
        throw new Error(result.error || 'Failed to save social media post');
      }
    } catch (err) {
      console.error('Error saving social media post:', err);
      setPostMessage({
        text: err instanceof Error ? err.message : 'Failed to save social media post',
        type: 'error'
      });
    } finally {
      setIsSavingPost(false);
    }
  };

  const loadSavedPosts = async () => {
    if (!selectedStrategyId) return;

    try {
      const queryParams: {
        strategy_id: string;
        content_plan_id?: string;
      } = {
        strategy_id: selectedStrategyId
      };
      
      // Only filter by content plan if one is selected
      if (savedContentPlanId) {
        queryParams.content_plan_id = savedContentPlanId;
      }
      
      const result = await fetchSocialPosts(queryParams);

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Content Management</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Select a Strategy</h2>
        
        {isLoading ? (
          <div className="py-4">Loading strategies...</div>
        ) : error ? (
          <div className="text-red-500 py-2">{error}</div>
        ) : strategies.length === 0 ? (
          <div className="py-2">
            No strategies found. Please create a strategy first.
          </div>
        ) : (
          <div className="mb-4">
            <label htmlFor="strategy-select" className="block text-sm font-medium text-gray-700 mb-1">
              Strategy
            </label>
            <select
              id="strategy-select"
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={selectedStrategyId}
              onChange={handleStrategyChange}
            >
              {strategies.map((strategy) => (
                <option key={strategy.id} value={strategy.id}>
                  {strategy.name} ({strategy.business_type})
                </option>
              ))}
            </select>
          </div>
        )}
        
        {selectedStrategy && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium text-gray-900 mb-2">Selected Strategy Details</h3>
            <p><span className="font-medium">Name:</span> {selectedStrategy.name}</p>
            <p><span className="font-medium">Business Type:</span> {selectedStrategy.business_type}</p>
            <p><span className="font-medium">Created:</span> {new Date(selectedStrategy.created_at).toLocaleDateString()}</p>
          </div>
        )}
      </div>
      
      {selectedStrategy && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Content Plan</h2>
          <p className="text-gray-600 mb-4">
            Create a 3-week content plan based on your strategy. Add any special considerations for the next 3 weeks.
          </p>
          
          <div className="mb-4">
            <label htmlFor="special-considerations" className="block text-sm font-medium text-gray-700 mb-1">
              Special Considerations (events, holidays, promotions in the next 3 weeks)
            </label>
            <textarea
              id="special-considerations"
              rows={4}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Product launch on Jan 15, Industry conference on Jan 20-22, Valentine's Day promotions"
              value={specialConsiderations}
              onChange={handleSpecialConsiderationsChange}
            />
          </div>
          
          <div className="flex justify-start mb-6">
            <button
              onClick={handleGenerateContentPlan}
              disabled={isGeneratingPlan || !selectedStrategyId}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isGeneratingPlan ? 'Generating...' : 'Generate Content Plan'}
            </button>
          </div>
          
          {contentPlanError && (
            <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-md">
              {contentPlanError}
            </div>
          )}
          
          {parsedContentPlan && (
            <div className="mt-6">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium">Generated Content Plan</h3>
                <button
                  onClick={handleSaveContentPlan}
                  disabled={isSavingPlan}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isSavingPlan ? 'Saving...' : 'Save Plan'}
                </button>
              </div>
              
              {savePlanMessage && (
                <div className={`p-3 mb-4 rounded-md ${
                  savePlanMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {savePlanMessage.text}
                  {savePlanMessage.type === 'success' && savedContentPlanId && (
                    <span className="ml-2">(Plan ID: {savedContentPlanId})</span>
                  )}
                </div>
              )}
              
              <div 
                className="content-plan-display p-6 bg-white border border-gray-200 rounded-lg shadow-sm prose max-w-none"
                dangerouslySetInnerHTML={{ __html: parsedContentPlan }}
              />
            </div>
          )}
        </div>
      )}
      
      {/* Social Media Post Generator - integrated directly */}
      {selectedStrategy && (
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Social Media Post Generator</h2>
          <p className="text-gray-600 mb-4">
            Generate social media posts based on your strategy{savedContentPlanId ? ' and content plan' : ''}.
            {!savedContentPlanId && (
              <span className="block mt-2 text-amber-600">
                Note: For best results, create and save a content plan first.
              </span>
            )}
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
              disabled={isGeneratingPost}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isGeneratingPost ? 'Generating...' : 'Generate Post'}
            </button>
            
            <button
              onClick={toggleSavedPosts}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {showSavedPosts ? 'Hide Saved Posts' : 'Show Saved Posts'}
            </button>
          </div>

          {postError && (
            <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-md">
              {postError}
            </div>
          )}

          {generatedPost && (
            <div className="mt-6">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium">Generated Post for {postType}</h3>
                <button
                  onClick={handleSavePost}
                  disabled={isSavingPost}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isSavingPost ? 'Saving...' : 'Save Post'}
                </button>
              </div>

              {postMessage && (
                <div className={`p-3 mb-4 rounded-md ${
                  postMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {postMessage.text}
                </div>
              )}

              <div className="p-4 border border-gray-300 rounded-md bg-gray-50 whitespace-pre-wrap">
                {generatedPost}
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
      )}
      
      {/* Content Management Tools - existing code */}
      {selectedStrategy && (
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Content Management Tools</h2>
          <p className="text-gray-600">
            Select a tool below to start managing content for this strategy.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <button
              className="p-4 border border-gray-300 rounded-md hover:bg-gray-50 transition flex flex-col items-center justify-center"
              disabled={!selectedStrategyId}
            >
              <span className="font-medium">Content Calendar</span>
              <span className="text-sm text-gray-500">Plan and schedule content</span>
            </button>
            
            <button
              className="p-4 border border-gray-300 rounded-md hover:bg-gray-50 transition flex flex-col items-center justify-center"
              disabled={!selectedStrategyId}
            >
              <span className="font-medium">Content Generator</span>
              <span className="text-sm text-gray-500">Generate new content ideas</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 