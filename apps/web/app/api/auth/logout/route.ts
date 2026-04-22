import { NextRequest, NextResponse } from 'next/server'
import { getRefreshToken, clearAuthCookies } from '@/lib/cookies'

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL!

export async function POST(req: NextRequest) {
  const refreshToken = getRefreshToken(req)

  if (refreshToken) {
    // Best-effort — fire and forget. Cookies are cleared regardless.
    try {
      await fetch(`${AUTH_SERVICE_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${refreshToken}` },
      })
    } catch {
      // Auth service unreachable — still clear cookies locally
    }
  }

  const response = NextResponse.json({ ok: true })
  clearAuthCookies(response)
  return response
}
