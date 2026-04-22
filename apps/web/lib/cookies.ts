import type { NextRequest, NextResponse } from 'next/server'

const isProd = process.env.NODE_ENV === 'production'
const BASE = { httpOnly: true, secure: isProd, sameSite: 'strict' as const }

export const getAccessToken  = (req: NextRequest) => req.cookies.get('oppi_access_token')?.value
export const getRefreshToken = (req: NextRequest) => req.cookies.get('oppi_refresh_token')?.value

export function setAuthCookies(
  res: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
) {
  res.cookies.set('oppi_access_token',  tokens.accessToken,  { ...BASE, path: '/',         maxAge: 15 * 60 })
  res.cookies.set('oppi_refresh_token', tokens.refreshToken, { ...BASE, path: '/api/auth', maxAge: 7 * 24 * 60 * 60 })
}

export function clearAuthCookies(res: NextResponse) {
  // path must match the original — a path-less delete won't clear a scoped cookie
  res.cookies.set('oppi_access_token',  '', { ...BASE, path: '/',         maxAge: 0 })
  res.cookies.set('oppi_refresh_token', '', { ...BASE, path: '/api/auth', maxAge: 0 })
}
