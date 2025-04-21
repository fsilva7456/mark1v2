import dynamic from 'next/dynamic';
import { Metadata } from 'next';

// Use dynamic import with SSR disabled to avoid Supabase initialization during static build
const TodoList = dynamic(() => import('./components/TodoList'), { ssr: false });

export const metadata: Metadata = {
  title: 'Todos | Mark1',
  description: 'Todo management system',
};

/**
 * Todos page that displays the TodoList component
 */
export default function TodosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Todo Management</h1>
      <p className="text-center mb-8 text-gray-600">Manage your tasks with our simple todo application</p>
      
      <TodoList />
    </div>
  );
} 