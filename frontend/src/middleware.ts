/**
 * Next.js middleware
 * Minimal middleware configuration
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware handler for Next.js requests
 * @param {NextRequest} request - The incoming request
 */
export function middleware(request: NextRequest) {
  // Pass through all requests without modification
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
