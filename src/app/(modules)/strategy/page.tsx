'use client';

import { useState } from 'react';
import { buildStrategyPrompt } from './utils/StrategyPromptBuilder';
import { generateStrategy } from './utils/strategyLlmClient';

/**
 * Strategy page with a form to collect business strategy information
 */
export default function StrategyPage() {
  const [formData, setFormData] = useState({
    name: '',
    businessType: '',
    objectives: '',
    audience: '',
    differentiation: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ text: string | null, error: string | null } | null>(null);

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
          
          <div className="flex justify-center">
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
          <h2 className="text-2xl font-bold mb-4">Your Strategic Plan</h2>
          
          {result.error ? (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
              {result.error}
            </div>
          ) : result.text ? (
            <div className="prose max-w-none whitespace-pre-wrap">
              {result.text}
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