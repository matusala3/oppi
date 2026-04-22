import { NextRequest, NextResponse } from 'next/server'

// Onboarding is intentionally NOT protected — it is a try-before-you-sign-up
// experience. Anyone can go through onboarding to evaluate the app's value
// before creating an account.
const PROTECTED  = ['/dashboard']
const AUTH_PAGES = ['/login', '/signup']

export function proxy(req: NextRequest) {
  const hasToken = req.cookies.has('oppi_access_token')
  const { pathname } = req.nextUrl

  if (!hasToken && PROTECTED.some(p => pathname.startsWith(p)))
    return NextResponse.redirect(new URL('/login', req.url))

  if (hasToken && AUTH_PAGES.includes(pathname))
    return NextResponse.redirect(new URL('/dashboard', req.url))
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
}
