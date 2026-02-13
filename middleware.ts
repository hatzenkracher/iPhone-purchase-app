import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for authentication protection
 * Redirects unauthenticated users to /login
 */
export async function middleware(request: NextRequest) {
    const userId = request.cookies.get('user_id')?.value;
    const { pathname } = request.nextUrl;

    // Public paths that don't require authentication
    const isPublicPath = pathname.startsWith('/login');

    // If not logged in and trying to access protected route, redirect to login
    if (!userId && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If logged in and trying to access login page, redirect to home
    if (userId && isPublicPath) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// Configure which routes require authentication
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
