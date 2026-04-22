import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/(auth)/login/page'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('LoginPage — form reset', () => {
  beforeEach(() => {
    mockPush.mockReset()
  })

  // ── Values retained after failed submit ────────────

  it('retains email value after a failed submit', async () => {
    render(<LoginPage />)
    await userEvent.type(screen.getByLabelText('Email address'), 'not-an-email')
    await userEvent.type(screen.getByLabelText('Password'), 'secret')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByLabelText('Email address')).toHaveValue('not-an-email')
  })

  it('retains password value after a failed submit', async () => {
    render(<LoginPage />)
    await userEvent.type(screen.getByLabelText('Email address'), 'not-an-email')
    await userEvent.type(screen.getByLabelText('Password'), 'secret')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByLabelText('Password')).toHaveValue('secret')
  })

  // ── Per-field inline error clears on edit ──────────
  // Note: errors.password is unreachable via UI (button is disabled when password is empty),
  // so only the email error path is testable here.

  it('clears the email error as soon as the user edits the email field', async () => {
    render(<LoginPage />)
    await userEvent.type(screen.getByLabelText('Email address'), 'bad')
    await userEvent.type(screen.getByLabelText('Password'), 'secret')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Email address'), 'x')
    expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument()
  })

  it('does not clear the email error when the user edits the password field', async () => {
    render(<LoginPage />)
    await userEvent.type(screen.getByLabelText('Email address'), 'bad')
    await userEvent.type(screen.getByLabelText('Password'), 'secret')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()

    // Editing a different field must not clear the email error
    await userEvent.type(screen.getByLabelText('Password'), 'x')
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
  })

  // ── Errors cleared on new submit ───────────────────

  it('clears all errors when the user resubmits with valid data', async () => {
    render(<LoginPage />)
    // First submit — trigger email error
    await userEvent.type(screen.getByLabelText('Email address'), 'bad')
    await userEvent.type(screen.getByLabelText('Password'), 'secret')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()

    // Fix and resubmit — errors should be gone before router.push fires
    mockPush.mockReturnValue(new Promise(() => {}))
    await userEvent.clear(screen.getByLabelText('Email address'))
    await userEvent.type(screen.getByLabelText('Email address'), 'user@example.fi')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument()
  })
})
