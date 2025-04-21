import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Strategy | Mark1',
  description: 'Strategic planning and management',
};

/**
 * Strategy page
 */
export default function StrategyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Strategy</h1>
      <p className="text-center mb-8 text-gray-600">Plan and manage your strategies effectively</p>
      
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <p className="text-center text-gray-500">
          Strategic planning features coming soon...
        </p>
      </div>
    </div>
  );
} 