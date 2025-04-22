import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

/**
 * Middleware to handle authentication checks and redirects
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Initialize Supabase auth middleware client
  const supabase = createMiddlewareClient({ req, res });
  
  // Get session data
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get the pathname from the URL
  const { pathname } = req.nextUrl;
  
  // Check if we're on a protected route
  const isProtectedRoute = 
    pathname.startsWith('/main_dashboard') || 
    pathname.startsWith('/strategy') || 
    pathname.startsWith('/content-mgmt');
  
  const isAuthRoute = pathname.startsWith('/login');

  // If we're on the root page, redirect to login if not authenticated
  if (pathname === '/') {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.redirect(new URL('/main_dashboard', req.url));
  }
  
  // If user is not authenticated and trying to access protected route, redirect to login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/main_dashboard', req.url));
  }
  
  return res;
}

// Configure which paths this middleware will run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 