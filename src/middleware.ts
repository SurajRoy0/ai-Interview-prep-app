import { NextRequest, NextResponse } from 'next/server'

// Fast cookie-based auth check — no DB round-trip on every request.
// Actual session validation happens in server components/layouts.
const SESSION_COOKIE_NAMES = [
  'better-auth.session_token',
  '__Secure-better-auth.session_token',
]

function isAuthenticated(req: NextRequest): boolean {
  return SESSION_COOKIE_NAMES.some(name => !!req.cookies.get(name)?.value)
}

// Paths that don't require auth — checked with startsWith
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/api/auth',
  '/api/seed',
  '/api/reset',
  '/api/developer', // devOnlyGuard on each route — no session required
]

// Paths that require ADMIN role — checked with startsWith
const ADMIN_PATHS = ['/admin']

// Auth pages that logged-in users should be bounced away from
// /verify-email is excluded — users may need to verify email even with a partial session
const AUTH_ONLY_PATHS = ['/login', '/register', '/forgot-password', '/reset-password']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Static assets, Next internals, favicon — always skip
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next()
  }

  const loggedIn = isAuthenticated(req)

  // Redirect authenticated users away from auth-only pages
  if (AUTH_ONLY_PATHS.some(p => pathname.startsWith(p)) && loggedIn) {
    return NextResponse.redirect(new URL('/candidate/dashboard', req.url))
  }

  // Public paths — anyone can access
  if (PUBLIC_PATHS.some(p => pathname === p || (p !== '/' && pathname.startsWith(p)))) {
    return NextResponse.next()
  }

  // Unauthenticated → send to login, preserving intended destination
  if (!loggedIn) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin guard — server components also verify role, this is the fast layer
  if (ADMIN_PATHS.some(p => pathname.startsWith(p))) {
    // Can't read role from JWT without DB, so let the layout handle the role
    // check. Here we only ensure the user is authenticated.
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
