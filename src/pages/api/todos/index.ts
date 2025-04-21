import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

type Todo = {
  id: string;
  task: string;
  is_complete: boolean;
  created_at: string;
};

// Connect to Supabase - properly handle environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Sample todos for when Supabase is not connected
const SAMPLE_TODOS: Todo[] = [
  { id: '1', task: 'Setup Next.js project', is_complete: true, created_at: new Date().toISOString() },
  { id: '2', task: 'Connect to Supabase', is_complete: false, created_at: new Date().toISOString() },
  { id: '3', task: 'Deploy to Vercel', is_complete: false, created_at: new Date().toISOString() }
];

/**
 * API handler for /api/todos endpoint
 * Supports GET (fetch all todos) and POST (create new todo)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check if we have valid Supabase credentials
  const isSupabaseConfigured = supabaseUrl && supabaseKey;
  
  switch (req.method) {
    case 'GET':
      try {
        if (!isSupabaseConfigured) {
          // Return sample data if Supabase is not configured
          return res.status(200).json(SAMPLE_TODOS);
        }
        
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        return res.status(200).json(data || []);
      } catch (error) {
        console.error('Error fetching todos:', error);
        return res.status(500).json({ message: 'Error fetching todos' });
      }
      
    case 'POST':
      try {
        const { task } = req.body;
        
        if (!task || typeof task !== 'string') {
          return res.status(400).json({ message: 'Task is required' });
        }
        
        if (!isSupabaseConfigured) {
          // Return mock response if Supabase is not configured
          const newTodo: Todo = {
            id: Date.now().toString(),
            task,
            is_complete: false,
            created_at: new Date().toISOString()
          };
          return res.status(201).json(newTodo);
        }
        
        const { data, error } = await supabase
          .from('todos')
          .insert([{ task, is_complete: false }])
          .select()
          .single();
          
        if (error) throw error;
        
        return res.status(201).json(data);
      } catch (error) {
        console.error('Error creating todo:', error);
        return res.status(500).json({ message: 'Error creating todo' });
      }
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 