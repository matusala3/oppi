import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignupPage from '@/app/(auth)/signup/page'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('SignupPage — loading / disabled state', () => {
  beforeEach(() => {
    mockPush.mockReset()
  })

  // ── Disabled before input ──────────────────────────

  it('disables the submit button when fields are empty', () => {
    render(<SignupPage />)
    expect(screen.getByRole('button', { name: 'Create account' })).toBeDisabled()
  })

  it('enables the submit button once all fields are filled', async () => {
    render(<SignupPage />)
    await userEvent.type(screen.getByLabelText('Full name'), 'Mikael Virtanen')
    await userEvent.type(screen.getByLabelText('Email address'), 'mikael@example.fi')
    await userEvent.type(screen.getByLabelText('Password'), 'P@ssw0rd!')
    expect(screen.getByRole('button', { name: 'Create account' })).toBeEnabled()
  })

  // ── Loading while in flight ────────────────────────

  it('disables the submit button while the request is in flight', async () => {
    // push never resolves → loading state stays alive for the assertion
    mockPush.mockReturnValue(new Promise(() => {}))

    render(<SignupPage />)
    await userEvent.type(screen.getByLabelText('Full name'), 'Mikael Virtanen')
    await userEvent.type(screen.getByLabelText('Email address'), 'mikael@example.fi')
    await userEvent.type(screen.getByLabelText('Password'), 'P@ssw0rd!')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled()
  })

  it('shows "Creating account…" text while the request is in flight', async () => {
    mockPush.mockReturnValue(new Promise(() => {}))

    render(<SignupPage />)
    await userEvent.type(screen.getByLabelText('Full name'), 'Mikael Virtanen')
    await userEvent.type(screen.getByLabelText('Email address'), 'mikael@example.fi')
    await userEvent.type(screen.getByLabelText('Password'), 'P@ssw0rd!')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByRole('button', { name: /creating account/i })).toHaveTextContent('Creating account…')
  })
})
