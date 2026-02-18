
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
    const { pathname } = request.nextUrl;

    // 1. Check if maintenance mode is enabled
    if (maintenanceMode) {
        // 2. Define excluding paths (maintenance page itself, api routes, admin, and static assets)
        const isMaintenancePage = pathname.startsWith('/maintenance');
        const isApiRoute = pathname.startsWith('/api');
        const isAdminRoute = pathname.startsWith('/admin'); // Allow admin to still access dashboard
        const isStaticAsset =
            pathname.startsWith('/_next') ||
            pathname.startsWith('/static') ||
            pathname.includes('.') || // matches favicon.ico, logo.png, etc.
            pathname.startsWith('/fonts');

        // 3. Redirect to maintenance page if not on an excluded route
        if (!isMaintenancePage && !isApiRoute && !isAdminRoute && !isStaticAsset) {
            return NextResponse.redirect(new URL('/maintenance', request.url));
        }
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
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
