import TodoList from '@/components/Todo';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">Mark1 Todo App - Deployed on Vercel</h1>
        <p className="text-center mb-10">A simple todo app built with Next.js, Tailwind CSS, and Supabase</p>
        
        <TodoList />
      </div>
    </main>
  );
}
