import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignupPage from '@/app/(auth)/signup/page'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('SignupPage — form reset', () => {
  beforeEach(() => {
    mockPush.mockReset()
  })

  // ── Values retained after failed submit ────────────

  it('retains all field values after a failed submit', async () => {
    render(<SignupPage />)
    await userEvent.type(screen.getByLabelText('Full name'), 'A')          // too short → error
    await userEvent.type(screen.getByLabelText('Email address'), 'bad')    // invalid → error
    await userEvent.type(screen.getByLabelText('Password'), 'short')       // < 8 chars → error
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByLabelText('Full name')).toHaveValue('A')
    expect(screen.getByLabelText('Email address')).toHaveValue('bad')
    expect(screen.getByLabelText('Password')).toHaveValue('short')
  })

  // ── Per-field inline error clears on edit ──────────

  it('clears the name error as soon as the user edits the name field', async () => {
    render(<SignupPage />)
    await userEvent.type(screen.getByLabelText('Full name'), 'A')
    await userEvent.type(screen.getByLabelText('Email address'), 'user@example.fi')
    await userEvent.type(screen.getByLabelText('Password'), 'short')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByText('Please enter your full name')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Full name'), 'x')
    expect(screen.queryByText('Please enter your full name')).not.toBeInTheDocument()
  })

  it('clears the email error as soon as the user edits the email field', async () => {
    render(<SignupPage />)
    await userEvent.type(screen.getByLabelText('Full name'), 'Mikael')
    await userEvent.type(screen.getByLabelText('Email address'), 'bad')
    await userEvent.type(screen.getByLabelText('Password'), 'short')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Email address'), 'x')
    expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument()
  })

  it('clears the password error as soon as the user edits the password field', async () => {
    render(<SignupPage />)
    await userEvent.type(screen.getByLabelText('Full name'), 'Mikael')
    await userEvent.type(screen.getByLabelText('Email address'), 'user@example.fi')
    await userEvent.type(screen.getByLabelText('Password'), 'short')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Password'), 'x')
    expect(screen.queryByText('Password must be at least 8 characters')).not.toBeInTheDocument()
  })

  // ── Errors are isolated to their own field ─────────

  it('does not clear the name error when the user edits the email field', async () => {
    render(<SignupPage />)
    await userEvent.type(screen.getByLabelText('Full name'), 'A')
    await userEvent.type(screen.getByLabelText('Email address'), 'user@example.fi')
    await userEvent.type(screen.getByLabelText('Password'), 'short')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByText('Please enter your full name')).toBeInTheDocument()

    // Editing a different field must not clear the name error
    await userEvent.type(screen.getByLabelText('Email address'), 'x')
    expect(screen.getByText('Please enter your full name')).toBeInTheDocument()
  })

  // ── Errors cleared on new submit ───────────────────

  it('clears all errors when the user resubmits with valid data', async () => {
    render(<SignupPage />)
    // First submit — all three errors
    await userEvent.type(screen.getByLabelText('Full name'), 'A')
    await userEvent.type(screen.getByLabelText('Email address'), 'bad')
    await userEvent.type(screen.getByLabelText('Password'), 'short')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByText('Please enter your full name')).toBeInTheDocument()

    // Fix all fields and resubmit
    mockPush.mockReturnValue(new Promise(() => {}))
    await userEvent.clear(screen.getByLabelText('Full name'))
    await userEvent.type(screen.getByLabelText('Full name'), 'Mikael Virtanen')
    await userEvent.clear(screen.getByLabelText('Email address'))
    await userEvent.type(screen.getByLabelText('Email address'), 'mikael@example.fi')
    await userEvent.clear(screen.getByLabelText('Password'))
    await userEvent.type(screen.getByLabelText('Password'), 'P@ssw0rd!')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.queryByText('Please enter your full name')).not.toBeInTheDocument()
    expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument()
    expect(screen.queryByText('Password must be at least 8 characters')).not.toBeInTheDocument()
  })
})
