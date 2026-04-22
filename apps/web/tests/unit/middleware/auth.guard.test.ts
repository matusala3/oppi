/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'

/** Build a NextRequest with an optional auth cookie. */
function makeRequest(pathname: string, token?: string): NextRequest {
  const url = new URL(pathname, 'http://localhost:3000')
  const headers: Record<string, string> = {}
  if (token) headers['cookie'] = `oppi_token=${token}`
  return new NextRequest(url.toString(), { headers })
}

describe('Auth middleware — route protection', () => {

  // ── Unauthenticated user ───────────────────────────

  it('redirects unauthenticated user from /dashboard to /login', () => {
    const response = middleware(makeRequest('/dashboard'))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/login')
  })

  it('redirects unauthenticated user from /dashboard/settings to /login', () => {
    const response = middleware(makeRequest('/dashboard/settings'))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/login')
  })

  it('allows unauthenticated user to access /login', () => {
    const response = middleware(makeRequest('/login'))
    expect(response.status).toBe(200)
  })

  it('allows unauthenticated user to access /signup', () => {
    const response = middleware(makeRequest('/signup'))
    expect(response.status).toBe(200)
  })

  // ── Authenticated user ─────────────────────────────

  it('redirects authenticated user from /login to /dashboard', () => {
    const response = middleware(makeRequest('/login', 'stub'))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard')
  })

  it('redirects authenticated user from /signup to /dashboard', () => {
    const response = middleware(makeRequest('/signup', 'stub'))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard')
  })

  it('allows authenticated user to access /dashboard', () => {
    const response = middleware(makeRequest('/dashboard', 'stub'))
    expect(response.status).toBe(200)
  })

  it('allows authenticated user to access /dashboard/settings', () => {
    const response = middleware(makeRequest('/dashboard/settings', 'stub'))
    expect(response.status).toBe(200)
  })

})
