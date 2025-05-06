import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Mark1',
  description: 'Main dashboard for Mark1 application',
};

/**
 * Main Dashboard page
 */
export default function MainDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Mark1 Dashboard</h1>
      <p className="text-center mb-8 text-gray-600">Welcome to your centralized dashboard - Deployed on Vercel</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard 
          title="Content Management" 
          description="Manage your content efficiently"
          link="/content-mgmt"
        />
        <DashboardCard 
          title="Strategy" 
          description="Plan and execute your strategies"
          link="/strategy"
        />
        <DashboardCard 
          title="Analytics" 
          description="View insights and performance metrics"
          link="#"
          isComingSoon
        />
      </div>
    </div>
  );
}

function DashboardCard({ 
  title, 
  description, 
  link, 
  isComingSoon = false 
}: { 
  title: string; 
  description: string; 
  link: string;
  isComingSoon?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
      
      {isComingSoon ? (
        <span className="inline-block px-3 py-1 text-sm bg-gray-100 text-gray-500 rounded-full">
          Coming soon
        </span>
      ) : (
        <a 
          href={link}
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Access
        </a>
      )}
    </div>
  );
} 