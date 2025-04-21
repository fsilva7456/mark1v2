# Mark1 Todo App

A simple todo application built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- Modern React with Next.js App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Supabase for database and authentication
- Vercel for deployment

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account
- GitHub account
- Vercel account

### Setup Instructions

1. Clone the repository
   ```bash
   git clone <your-repo-url>
   cd mark1v2
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Push your code to GitHub
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

## Supabase Setup

1. Create a new Supabase project
2. Create a `todos` table with the following schema:
   - `id` (uuid, primary key)
   - `task` (text, not null)
   - `is_complete` (boolean, default: false)
   - `created_at` (timestamp with time zone, default: now())

## Deployment

This project is configured for easy deployment on Vercel:

1. Import the GitHub repository into Vercel
2. Set the environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
3. Deploy!

## License

MIT
