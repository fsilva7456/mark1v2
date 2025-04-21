import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Content Management | Mark1',
  description: 'Content management system',
};

/**
 * Content Management page
 */
export default function ContentManagementPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Content Management</h1>
      <p className="text-center mb-8 text-gray-600">Manage your content with our powerful tools</p>
      
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <p className="text-center text-gray-500">
          Content management features coming soon...
        </p>
      </div>
    </div>
  );
} 