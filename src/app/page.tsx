import { redirect } from 'next/navigation';

/**
 * Home page that redirects to the main dashboard
 */
export default function Home() {
  redirect('/main_dashboard');
}
