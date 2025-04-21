'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Todo = {
  id: string;
  task: string;
  is_complete: boolean;
  created_at: string;
};

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    try {
      setLoading(true);
      
      // This is where we'll fetch from Supabase when connected
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
      // For demo purposes, set some sample data
      setTodos([
        { id: '1', task: 'Setup Next.js project', is_complete: true, created_at: new Date().toISOString() },
        { id: '2', task: 'Connect to Supabase', is_complete: false, created_at: new Date().toISOString() },
        { id: '3', task: 'Deploy to Vercel', is_complete: false, created_at: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function addTodo() {
    if (!newTask.trim()) return;
    
    try {
      // This is where we'll insert to Supabase when connected
      const { data, error } = await supabase
        .from('todos')
        .insert([{ task: newTask }])
        .select();
        
      if (error) throw error;
      
      if (data) {
        setTodos([...data, ...todos]);
        setNewTask('');
      }
    } catch (error) {
      console.error('Error adding todo:', error);
      // For demo purposes, add locally
      const newTodo = {
        id: Date.now().toString(),
        task: newTask,
        is_complete: false,
        created_at: new Date().toISOString()
      };
      setTodos([newTodo, ...todos]);
      setNewTask('');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      
      <div className="flex mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task"
          className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none"
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
        />
        <button 
          onClick={addTodo}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
        >
          Add
        </button>
      </div>
      
      {loading ? (
        <p className="text-center py-4">Loading...</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li 
              key={todo.id}
              className="p-3 bg-gray-100 rounded flex justify-between items-center"
            >
              <span className={todo.is_complete ? 'line-through text-gray-500' : ''}>
                {todo.task}
              </span>
              <div className="flex space-x-2">
                <button className="text-sm text-blue-500 hover:text-blue-700">
                  {todo.is_complete ? 'Undo' : 'Complete'}
                </button>
                <button className="text-sm text-red-500 hover:text-red-700">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 