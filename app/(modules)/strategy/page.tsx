'use client';

import { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import { buildStrategyPrompt } from './utils/StrategyPromptBuilder';
import { generateStrategy } from './utils/strategyLlmClient';
import { saveStrategy } from './utils/strategyService';

/**
 * Strategy page with a form to collect business strategy information
 */
export default function StrategyPage() {
  const [formData, setFormData] = useState({
    name: 'Sarah Johnson',
    businessType: 'Personal Fitness Training Business',
    objectives: 'Grow client base by 25% in the next 6 months, launch an online training program, and increase client retention through personalized fitness plans.',
    audience: 'Adults aged 30-55 who are busy professionals, want to improve their health and fitness, have disposable income for personalized training, and prefer flexible scheduling options.',
    differentiation: 'Specialized in nutrition-integrated fitness plans, certified in pre/post-natal training, offering both in-person and virtual sessions, and providing monthly fitness assessments to track progress.'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [result, setResult] = useState<{ text: string | null, error: string | null } | null>(null);
  const [parsedMatrix, setParsedMatrix] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [strategyName, setStrategyName] = useState('');
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [feedback, setFeedback] = useState('');
  const [updateMessage, setUpdateMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const matrixRef = useRef<HTMLDivElement>(null);

  // Apply styling to the matrix table after render
  useEffect(() => {
    if (matrixRef.current && parsedMatrix) {
      const tableElement = matrixRef.current.querySelector('table');
      
      if (tableElement) {
        // Add class to table
        tableElement.classList.add('matrix-table');
        
        // Get all th elements and add class
        const thElements = tableElement.querySelectorAll('th');
        thElements.forEach(th => {
          th.classList.add('matrix-header');
        });
        
        // Get all td elements in first column and add class
        const rows = tableElement.querySelectorAll('tr');
        rows.forEach(row => {
          const firstCell = row.querySelector('td:first-child');
          if (firstCell) {
            firstCell.classList.add('audience-column');
          }
        });
      }
    }
  }, [parsedMatrix]);

  // Set default strategy name when generating a strategy
  useEffect(() => {
    if (result?.text && !strategyName) {
      setStrategyName(`${formData.name}'s ${formData.businessType} Strategy`);
    }
  }, [result, formData, strategyName]);

  // Parse the markdown response to HTML when result changes
  useEffect(() => {
    if (result?.text) {
      // Split the content - matrix is before explanation, which typically follows a blank line after the table
      const parts = result.text.split(/\n\n/);
      let matrixContent = '';
      let explanationContent = '';
      
      // Find where the table ends and explanation begins
      let foundTable = false;
      
      for (let i = 0; i < parts.length; i++) {
        if (!foundTable && parts[i].includes('|')) {
          foundTable = true;
          matrixContent += parts[i] + '\n\n';
        } else if (foundTable) {
          explanationContent += parts[i] + '\n\n';
        } else {
          matrixContent += parts[i] + '\n\n';
        }
      }

      // If there's an explanation, make sure it's clean
      if (explanationContent.trim()) {
        setExplanation(marked.parse(explanationContent) as string);
      } else {
        setExplanation(null);
      }

      // Set the matrix content
      setParsedMatrix(marked.parse(matrixContent) as string);
    } else {
      setParsedMatrix(null);
      setExplanation(null);
    }
  }, [result]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);
    setParsedMatrix(null);
    setExplanation(null);
    setSaveMessage(null);
    
    try {
      // Build the LLM prompt using the utility
      const prompt = buildStrategyPrompt(formData);
      
      // Use our client to generate the strategy
      const response = await generateStrategy(prompt);
      
      setResult(response);
    } catch (error) {
      console.error('Error submitting strategy information:', error);
      setResult({
        text: null,
        error: 'Failed to submit strategy information. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveStrategy = async () => {
    if (!parsedMatrix || !strategyName.trim()) {
      setSaveMessage({
        text: 'Please provide a name for your strategy.',
        type: 'error'
      });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Combine matrix and explanation for saving
      const fullContent = matrixRef.current?.outerHTML || '';
      
      // Save the strategy to Supabase
      const result = await saveStrategy({
        name: strategyName,
        user_id: 'anonymous', // Will be replaced with real user ID when auth is implemented
        business_type: formData.businessType,
        objectives: formData.objectives,
        audience: formData.audience,
        differentiation: formData.differentiation,
        matrix_content: fullContent
      });

      if (result.status === 'success') {
        setSaveMessage({
          text: 'Strategy saved successfully!',
          type: 'success'
        });
      } else {
        throw new Error(result.error || 'Failed to save strategy');
      }
    } catch (error) {
      console.error('Error saving strategy:', error);
      setSaveMessage({
        text: error instanceof Error ? error.message : 'Failed to save strategy',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleExplanation = () => {
    setIsExplanationOpen(!isExplanationOpen);
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(e.target.value);
  };

  const handleUpdateStrategy = async () => {
    if (!feedback.trim()) {
      setUpdateMessage({
        text: 'Please provide feedback to update the strategy.',
        type: 'error'
      });
      return;
    }

    setIsUpdating(true);
    setUpdateMessage(null);
    
    try {
      // Build a prompt that includes the original strategy and the feedback
      const updatePrompt = `
I previously generated the following strategy: 

${result?.text || ''}

The user has provided the following feedback to improve or adjust the strategy:

${feedback}

Please update the strategy matrix based on this feedback. Keep the same format but incorporate the changes requested.
Return the full, updated strategy matrix with explanation.
`;
      
      // Use our client to generate the updated strategy
      const response = await generateStrategy(updatePrompt);
      
      if (response.error) {
        setUpdateMessage({
          text: response.error,
          type: 'error'
        });
      } else {
        setResult(response);
        setFeedback('');
        setUpdateMessage({
          text: 'Strategy updated successfully!',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error updating strategy:', error);
      setUpdateMessage({
        text: error instanceof Error ? error.message : 'Failed to update strategy',
        type: 'error'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Strategy Builder</h1>
      <p className="text-center mb-8 text-gray-600">
        Answer the questions below to help us create a customized strategy for your business
      </p>
      
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              1. What is your name?
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
              2. What type of business do you have?
            </label>
            <input
              type="text"
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="objectives" className="block text-sm font-medium text-gray-700 mb-1">
              3. What are your primary objectives?
            </label>
            <textarea
              id="objectives"
              name="objectives"
              value={formData.objectives}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-1">
              4. Who is your target audience(s)?
            </label>
            <textarea
              id="audience"
              name="audience"
              value={formData.audience}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="differentiation" className="block text-sm font-medium text-gray-700 mb-1">
              5. What differentiates your service?
            </label>
            <textarea
              id="differentiation"
              name="differentiation"
              value={formData.differentiation}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setFormData({
                name: '',
                businessType: '',
                objectives: '',
                audience: '',
                differentiation: ''
              })}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Clear Form
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
            >
              {isSubmitting ? 'Generating Strategy...' : 'Generate Strategy'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Result display section */}
      {result && (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Your Audience Targeting Matrix</h2>
          
          {result.error ? (
            <div className="p-6 bg-red-50 text-red-700 rounded-md flex flex-col items-center">
              <p className="mb-4 text-center">{result.error}</p>
              {result.error.includes("AI service") && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
                >
                  {isSubmitting ? 'Retrying...' : 'Retry Generation'}
                </button>
              )}
            </div>
          ) : parsedMatrix ? (
            <div className="strategy-matrix">
              <style jsx global>{`
                .matrix-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 1.5rem 0;
                  font-size: 0.95rem;
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                  border-radius: 0.5rem;
                  overflow: hidden;
                  border: none;
                }
                .matrix-table th, .matrix-header {
                  background-color: #3b82f6 !important;
                  color: white !important;
                  font-weight: 600 !important;
                  text-align: left !important;
                  padding: 1rem !important;
                  border: 1px solid #60a5fa !important;
                  text-transform: uppercase !important;
                  letter-spacing: 0.05em !important;
                  font-size: 0.85rem !important;
                }
                .matrix-table td {
                  padding: 1rem !important;
                  border: 1px solid #e5e7eb !important;
                  vertical-align: top !important;
                  line-height: 1.5 !important;
                }
                .matrix-table tr:nth-child(even) {
                  background-color: #f9fafb !important;
                }
                .matrix-table tr:hover {
                  background-color: #f3f4f6 !important;
                }
                .matrix-table tr:first-child td {
                  border-top: 2px solid #3b82f6 !important;
                }
                .audience-column, .matrix-table td:first-child {
                  font-weight: 600 !important;
                  color: #4b5563 !important;
                  border-right: 2px solid #3b82f6 !important;
                  background-color: #eff6ff !important;
                }
                .strategy-matrix h1 {
                  font-size: 1.8rem;
                  font-weight: 700;
                  margin: 1.5rem 0;
                  color: #3b82f6;
                  text-align: center;
                  border-bottom: 2px solid #3b82f6;
                  padding-bottom: 0.5rem;
                  margin-bottom: 1.5rem;
                }
                .strategy-matrix p {
                  margin: 0.75rem 0;
                  line-height: 1.6;
                }
                .strategy-matrix ul, .strategy-matrix ol {
                  margin: 0.75rem 0;
                  padding-left: 1.5rem;
                }
                .strategy-matrix ul li, .strategy-matrix ol li {
                  margin: 0.5rem 0;
                }
                .accordion-button {
                  display: flex;
                  align-items: center;
                  width: 100%;
                  padding: 0.75rem 1rem;
                  margin-top: 1.5rem;
                  background-color: #3b82f6;
                  color: white;
                  border: none;
                  border-radius: 0.375rem;
                  font-weight: 600;
                  text-align: left;
                  transition: all 0.2s ease;
                  cursor: pointer;
                  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
                }
                .accordion-button:hover {
                  background-color: #2563eb;
                }
                .accordion-button svg {
                  margin-right: 0.5rem;
                  transition: transform 0.2s ease;
                }
                .accordion-button.open svg {
                  transform: rotate(90deg);
                }
                .accordion-content {
                  max-height: 0;
                  overflow: hidden;
                  transition: max-height 0.3s ease;
                }
                .accordion-content.open {
                  max-height: 1000px;
                }
                .accordion-content .prose {
                  background-color: #f9fafb;
                  border-radius: 0 0 0.375rem 0.375rem;
                }
              `}</style>
              <div 
                ref={matrixRef}
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: parsedMatrix }} 
              />

              {explanation && (
                <div className="mt-4">
                  <button 
                    onClick={toggleExplanation}
                    className={`accordion-button ${isExplanationOpen ? 'open' : ''}`}
                    aria-expanded={isExplanationOpen}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                    <span>{isExplanationOpen ? 'Hide Explanation' : 'View Explanation'}</span>
                  </button>
                  <div className={`accordion-content ${isExplanationOpen ? 'open' : ''}`}>
                    <div 
                      className="p-6 border border-t-0 border-gray-200 rounded-b prose max-w-none bg-white shadow-inner"
                      dangerouslySetInnerHTML={{ __html: explanation }}
                    />
                  </div>
                </div>
              )}

              {/* Feedback section - NEW */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold mb-4">Provide Feedback to Update Strategy</h3>
                <div className="mb-4">
                  <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                    What would you like to change or improve about this strategy?
                  </label>
                  <textarea
                    id="feedback"
                    rows={4}
                    value={feedback}
                    onChange={handleFeedbackChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Could you focus more on digital marketing channels? I'd like more emphasis on retention strategies."
                  />
                </div>
                
                <button
                  type="button"
                  onClick={handleUpdateStrategy}
                  disabled={isUpdating || !feedback.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300"
                >
                  {isUpdating ? 'Updating...' : 'Update Strategy'}
                </button>

                {updateMessage && (
                  <div className={`mt-4 p-3 rounded-md ${updateMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {updateMessage.text}
                  </div>
                )}
              </div>

              {/* Save strategy section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold mb-4">Save This Strategy</h3>
                <div className="flex items-end gap-4">
                  <div className="flex-grow">
                    <label htmlFor="strategyName" className="block text-sm font-medium text-gray-700 mb-1">
                      Strategy Name
                    </label>
                    <input
                      type="text"
                      id="strategyName"
                      value={strategyName}
                      onChange={(e) => setStrategyName(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter a name for this strategy"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveStrategy}
                    disabled={isSaving || !strategyName.trim()}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-300"
                  >
                    {isSaving ? 'Saving...' : 'Save Strategy'}
                  </button>
                </div>

                {saveMessage && (
                  <div className={`mt-4 p-3 rounded-md ${saveMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {saveMessage.text}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-100 text-gray-500 rounded-md">
              No results to display
            </div>
          )}
        </div>
      )}
    </div>
  );
}