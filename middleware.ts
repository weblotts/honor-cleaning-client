import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware runs on the edge — it cannot access sessionStorage or the Express
// backend's httpOnly cookie (different origin in dev). Auth protection is
// handled client-side via the useAuth hook and AuthGuard component.
//
// This middleware only adds security headers and handles basic redirects
// that don't depend on auth state.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
