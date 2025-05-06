/**
 * Home page that redirects based on authentication status
 * This is handled by the middleware, which will redirect to:
 * - /login if user is not authenticated
 * - /main_dashboard if user is authenticated
 */
export default function Home() {
  // The actual redirect logic is in the middleware
  return null;
}
