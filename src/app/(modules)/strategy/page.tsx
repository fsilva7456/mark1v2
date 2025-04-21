'use client';

import { useState, useEffect } from 'react';
import { marked } from 'marked';
import { buildStrategyPrompt } from './utils/StrategyPromptBuilder';
import { generateStrategy } from './utils/strategyLlmClient';

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
  const [result, setResult] = useState<{ text: string | null, error: string | null } | null>(null);
  const [parsedHtml, setParsedHtml] = useState<string | null>(null);

  // Parse the markdown response to HTML when result changes
  useEffect(() => {
    if (result?.text) {
      const html = marked.parse(result.text);
      setParsedHtml(html as string);
    } else {
      setParsedHtml(null);
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
    setParsedHtml(null);
    
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
          <h2 className="text-2xl font-bold mb-4">Your Audience Targeting Matrix</h2>
          
          {result.error ? (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
              {result.error}
            </div>
          ) : parsedHtml ? (
            <div className="strategy-matrix">
              <style jsx>{`
                .strategy-matrix table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 1rem 0;
                  font-size: 0.9rem;
                }
                .strategy-matrix table th {
                  background-color: #f3f4f6;
                  color: #111827;
                  font-weight: 600;
                  text-align: left;
                  padding: 0.75rem 1rem;
                  border: 1px solid #e5e7eb;
                }
                .strategy-matrix table td {
                  padding: 0.75rem 1rem;
                  border: 1px solid #e5e7eb;
                  vertical-align: top;
                }
                .strategy-matrix table tr:nth-child(even) {
                  background-color: #f9fafb;
                }
                .strategy-matrix h1 {
                  font-size: 1.5rem;
                  font-weight: 700;
                  margin: 1rem 0;
                  color: #1f2937;
                }
                .strategy-matrix p {
                  margin: 0.5rem 0;
                  line-height: 1.5;
                }
                .strategy-matrix ul, .strategy-matrix ol {
                  margin: 0.5rem 0;
                  padding-left: 1.5rem;
                }
                .strategy-matrix ul li, .strategy-matrix ol li {
                  margin: 0.25rem 0;
                }
              `}</style>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: parsedHtml }} 
              />
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