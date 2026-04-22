import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/(auth)/login/page'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('LoginPage — loading / disabled state', () => {
  beforeEach(() => {
    mockPush.mockReset()
  })

  // ── Disabled before input ──────────────────────────

  it('disables the submit button when fields are empty', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled()
  })

  it('enables the submit button once both fields are filled', async () => {
    render(<LoginPage />)
    await userEvent.type(screen.getByLabelText('Email address'), 'user@example.fi')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled()
  })

  // ── Loading while in flight ────────────────────────

  it('disables the submit button while the request is in flight', async () => {
    // push never resolves → loading state stays alive for the assertion
    mockPush.mockReturnValue(new Promise(() => {}))

    render(<LoginPage />)
    await userEvent.type(screen.getByLabelText('Email address'), 'user@example.fi')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  it('shows "Signing in…" text while the request is in flight', async () => {
    mockPush.mockReturnValue(new Promise(() => {}))

    render(<LoginPage />)
    await userEvent.type(screen.getByLabelText('Email address'), 'user@example.fi')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByRole('button', { name: /signing in/i })).toHaveTextContent('Signing in…')
  })
})
