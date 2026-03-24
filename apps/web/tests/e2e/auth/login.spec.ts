import { test, expect } from '@playwright/test'
import { fillLoginForm } from '../../helpers/form.helper'

test.describe('Login page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  // ── Rendering ──────────────────────────────────────

  test('renders the sign-in heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  })

  test('renders email and password fields', async ({ page }) => {
    await expect(page.locator('#login-email')).toBeVisible()
    await expect(page.locator('#login-password')).toBeVisible()
  })

  // ── Client-side validation ──────────────────────────

  test('shows email error when submitting empty email', async ({ page }) => {
    await page.locator('#login-password').fill('somepassword')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('Please enter a valid email address')).toBeVisible()
  })

  test('shows password error when submitting empty password', async ({ page }) => {
    await page.locator('#login-email').fill('valid@example.com')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('Please enter your password')).toBeVisible()
  })

  test('shows email error for malformed email', async ({ page }) => {
    await fillLoginForm(page, { email: 'not-an-email', password: 'secret' })

    await expect(page.getByText('Please enter a valid email address')).toBeVisible()
  })

  test('clears errors when user corrects the field', async ({ page }) => {
    // Trigger error
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText('Please enter a valid email address')).toBeVisible()

    // Fix field and re-submit valid form
    await page.locator('#login-email').fill('valid@example.com')
    await page.locator('#login-password').fill('secret')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('Please enter a valid email address')).not.toBeVisible()
  })

  // ── Password toggle ────────────────────────────────

  test('toggles password visibility', async ({ page }) => {
    const passwordInput = page.locator('#login-password')
    await passwordInput.fill('mysecret')

    expect(await passwordInput.getAttribute('type')).toBe('password')

    await page.getByRole('button', { name: /show password/i }).click()
    expect(await passwordInput.getAttribute('type')).toBe('text')

    await page.getByRole('button', { name: /hide password/i }).click()
    expect(await passwordInput.getAttribute('type')).toBe('password')
  })

  // ── Navigation ──────────────────────────────────────

  test('links to signup page', async ({ page }) => {
    await page.getByRole('link', { name: 'Create one free' }).click()
    await expect(page).toHaveURL('/signup')
  })

  // ── Submit (current stub behaviour — replace when API is wired) ──

  test('navigates to /dashboard on valid submit (stub)', async ({ page }) => {
    await fillLoginForm(page, { email: 'user@example.fi', password: 'password123' })
    await expect(page).toHaveURL('/dashboard', { timeout: 10_000 })
  })

  // ── When API is wired, replace the stub test above with: ──
  //
  // test('shows form error on invalid credentials', async ({ page }) => {
  //   await page.route('/api/auth/login', route =>
  //     route.fulfill({ status: 401, json: { message: 'Incorrect email or password.' } }),
  //   )
  //   await fillLoginForm(page, { email: 'user@example.fi', password: 'wrong' })
  //   await expect(page.getByRole('alert')).toContainText('Incorrect email or password.')
  // })
  //
  // test('shows loading state during submit', async ({ page }) => {
  //   await page.route('/api/auth/login', async route => {
  //     await new Promise(r => setTimeout(r, 500))
  //     await route.fulfill({ status: 200, json: { tokens: { accessToken: 'x' } } })
  //   })
  //   const submitBtn = page.getByRole('button', { name: 'Sign in' })
  //   await page.locator('#login-email').fill('user@example.fi')
  //   await page.locator('#login-password').fill('password')
  //   await submitBtn.click()
  //   await expect(submitBtn).toBeDisabled()
  //   await expect(submitBtn).toContainText('Signing in…')
  // })

})
