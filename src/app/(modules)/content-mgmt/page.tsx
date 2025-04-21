'use client';

import { useState, useEffect } from 'react';
import { fetchStrategies, Strategy } from './utils/contentService';

/**
 * Content Management page component
 * Allows users to select strategies and manage content
 */
export default function ContentManagementPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStrategyId(e.target.value);
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