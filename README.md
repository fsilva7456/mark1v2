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

3. Set up environment variables
   - Copy `.env.local.example` to `.env.local`
   - Update the Supabase URL and anon key in `.env.local`

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Supabase Setup

1. Create a new Supabase project
2. Create a `todos` table with the following schema:
   - `id` (uuid, primary key)
   - `task` (text, not null)
   - `is_complete` (boolean, default: false)
   - `created_at` (timestamp with time zone, default: now())
3. Copy your Supabase URL and anon key to `.env.local`

## Deployment

This project is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Import the project into Vercel
3. Set the environment variables in the Vercel dashboard
4. Deploy!

## License

MIT
