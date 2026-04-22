import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookies } from '@/lib/cookies'
import type { AuthResponse } from '@oppi/types'

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL!

export async function POST(req: NextRequest) {
  const body = await req.json()

  let res: Response
  try {
    res = await fetch(`${AUTH_SERVICE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  if (res.status === 401) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  if (!res.ok)            return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

  const { user, tokens } = (await res.json()) as AuthResponse
  const response = NextResponse.json({ user })
  setAuthCookies(response, tokens)
  return response
}
