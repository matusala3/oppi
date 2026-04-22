import { NextRequest, NextResponse } from 'next/server'
import { getRefreshToken, setAuthCookies, clearAuthCookies } from '@/lib/cookies'
import type { TokenPair } from '@oppi/types'

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL!

export async function POST(req: NextRequest) {
  const refreshToken = getRefreshToken(req)
  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
  }

  let res: Response
  try {
    res = await fetch(`${AUTH_SERVICE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${refreshToken}` },
    })
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  if (res.status === 401) {
    const response = NextResponse.json({ error: 'Session expired' }, { status: 401 })
    clearAuthCookies(response)
    return response
  }
  if (!res.ok) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

  const tokens = (await res.json()) as TokenPair
  const response = NextResponse.json({ ok: true })
  setAuthCookies(response, tokens)
  return response
}
