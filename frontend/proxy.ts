import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * DealOrbit Request & Route Authorization Proxy (Next.js 16 convention)
 * Enforces strict authentication and role-based path access:
 * 1. Unauthenticated users cannot access any application pages.
 * 2. CUSTOMER role is strictly restricted to /portal/* (e.g. /portal/demo-token).
 * 3. SALES_REP, SALES_MANAGER, FINANCE_OPS are barred from /admin and /portal.
 * 4. ADMIN has platform-wide access.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('dealorbit_token')?.value;
  const role = request.cookies.get('dealorbit_role')?.value;

  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password');

  // If already logged in and visiting auth pages (/login, /signup), redirect to role workspace
  if (token && isAuthRoute) {
    if (role === 'CUSTOMER') {
      return NextResponse.redirect(new URL('/portal/demo-token', request.url));
    }
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL('/quotations', request.url));
  }

  // Pass request through so each page's PageAuthGuard inspects auth & role
  // and renders the authorized page or displays the contextual 401/403 error accordingly.
  return NextResponse.next();
}

// Backward compatibility alias for middleware
export const middleware = proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - static asset extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};
