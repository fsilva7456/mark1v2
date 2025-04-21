'use client';

import { useState, useEffect } from 'react';
import { fetchStrategies, Strategy } from './utils/contentService';
import { marked } from 'marked';
import { buildContentOutlinePrompt } from './utils/contentOutlinePromptBuilder';
import { generateContentPlan, saveContentPlan } from './utils/contentLlmClient';
import { FullStrategyDetails } from './utils/types';

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
      setParsedContentPlan(marked.parse(contentPlan) as string);
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
    if (!selectedStrategyId || !contentPlan) {
      setSavePlanMessage({
        text: 'Cannot save: missing strategy or content plan',
        type: 'error'
      });
      return;
    }
    
    setIsSavingPlan(true);
    setSavePlanMessage(null);
    
    try {
      const result = await saveContentPlan({
        strategy_id: selectedStrategyId,
        special_considerations: specialConsiderations,
        content_plan_text: contentPlan
      });
      
      if (result.status === 'success') {
        setSavePlanMessage({
          text: 'Content plan saved successfully!',
          type: 'success'
        });
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
                </div>
              )}
              
              <div 
                className="p-4 bg-gray-50 rounded-md prose max-w-none" 
                dangerouslySetInnerHTML={{ __html: parsedContentPlan }}
              />
            </div>
          )}
        </div>
      )}
      
      {selectedStrategy && (
        <div className="bg-white shadow rounded-lg p-6">
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