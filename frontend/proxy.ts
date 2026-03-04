import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the routes that need protection
const protectedRoutes = ['/admin', '/pharmacist'];

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Check if the path requires protection
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    // Try to get the session cookie. Note: express-session usually sets 'connect.sid'
    const sessionCookie = request.cookies.get('connect.sid');

    if (!sessionCookie) {
        // Not logged in at all
        return NextResponse.redirect(new URL('/?login=true', request.url));
    }

    try {
        // We must verify the session manually against the API since we are on the Edge
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        // Pass the cookie along to the backend
        const res = await fetch(`${apiUrl}/auth/me`, {
            headers: {
                Cookie: `connect.sid=${sessionCookie.value}`
            }
        });

        if (!res.ok) {
            // Invalid session
            return NextResponse.redirect(new URL('/?login=true', request.url));
        }

        const user = await res.json();

        // Admin Routes Protection
        if (path.startsWith('/admin')) {
            if (user.role !== 'admin' && user.role !== 'pharmacist') {
                return new NextResponse(
                    JSON.stringify({ error: 'Access Denied: Admins or Pharmacists only.' }),
                    { status: 403, headers: { 'content-type': 'application/json' } }
                );
            }
        }

        // Pharmacist Routes Protection
        if (path.startsWith('/pharmacist')) {
            if (user.role !== 'pharmacist' && user.role !== 'admin') {
                return new NextResponse(
                    JSON.stringify({ error: 'Access Denied: Pharmacists only.' }),
                    { status: 403, headers: { 'content-type': 'application/json' } }
                );
            }
        }

        return NextResponse.next();
    } catch (error) {
        // If the backend is down or unreachable, fail secure.
        console.error('Middleware auth check failed:', error);
        return NextResponse.redirect(new URL('/?error=auth_unavailable', request.url));
    }
}

// Ensure the middleware only selectively runs on matching paths
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
