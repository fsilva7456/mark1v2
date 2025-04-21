import { redirect } from 'next/navigation';

/**
 * Home page that redirects to the todos module
 */
export default function Home() {
  redirect('/todos');
}
