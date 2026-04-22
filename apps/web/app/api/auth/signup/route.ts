import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookies } from '@/lib/cookies'
import type { AuthResponse } from '@oppi/types'

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL!

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  // name is not forwarded — auth service has no name field.
  // It stays in sessionStorage as oppi_onboarding_data for the User Service (Phase 3+).
  let res: Response
  try {
    res = await fetch(`${AUTH_SERVICE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  if (res.status === 409) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  if (!res.ok)            return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

  const { user, tokens } = (await res.json()) as AuthResponse
  const response = NextResponse.json({ user }, { status: 201 })
  setAuthCookies(response, tokens)
  return response
}
