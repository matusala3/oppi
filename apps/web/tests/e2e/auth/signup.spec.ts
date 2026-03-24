import { test, expect } from '@playwright/test'
import { fillSignupForm } from '../../helpers/form.helper'
import { seedOnboardingData } from '../../helpers/session.helper'

test.describe('Signup page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/signup')
  })

  // ── Rendering ──────────────────────────────────────

  test('renders create account heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
  })

  test('renders step indicator with "Create Account" as active step', async ({ page, isMobile }) => {
    // Step indicator lives inside the brand panel which is hidden on mobile viewports
    test.skip(isMobile, 'Brand panel (and step indicator) is hidden below 1024px')
    await expect(page.getByText('Create Account', { exact: true })).toBeVisible()
  })

  // ── Validation ────────────────────────────────────

  test('shows name error for short name', async ({ page }) => {
    await fillSignupForm(page, { name: 'A', email: 'user@example.fi', password: 'Password1!' })
    await expect(page.getByText('Please enter your full name')).toBeVisible()
  })

  test('shows email error for invalid format', async ({ page }) => {
    await fillSignupForm(page, { name: 'Mikael', email: 'bad-email', password: 'Password1!' })
    await expect(page.getByText('Please enter a valid email address')).toBeVisible()
  })

  test('shows password error for short password', async ({ page }) => {
    await fillSignupForm(page, { name: 'Mikael', email: 'user@example.fi', password: 'short' })
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
  })

  // ── Password strength meter ────────────────────────

  test('shows Weak strength for a short password', async ({ page }) => {
    await page.locator('#signup-password').fill('abc')
    await expect(page.getByRole('status')).toHaveAttribute(
      'aria-label', 'Password strength: Weak', { timeout: 10_000 },
    )
  })

  test('shows Fair strength for a medium password', async ({ page }) => {
    // 'password1' scores 2 (length >=8 + digit) → Fair. 'password' scores 1 → Weak.
    await page.locator('#signup-password').fill('password1')
    await expect(page.getByRole('status')).toHaveAttribute(
      'aria-label', 'Password strength: Fair', { timeout: 10_000 },
    )
  })

  test('shows Strong strength for a complex password', async ({ page }) => {
    await page.locator('#signup-password').fill('P@ssw0rd!2024')
    await expect(page.getByRole('status')).toHaveAttribute(
      'aria-label', 'Password strength: Strong', { timeout: 10_000 },
    )
  })

  test('hides strength meter after password validation error is shown', async ({ page }) => {
    await page.locator('#signup-password').fill('abc')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page.getByRole('status')).not.toBeVisible()
  })

  // ── sessionStorage — onboarding data ──────────────

  test('reads onboarding data from sessionStorage when present', async ({ page }) => {
    await seedOnboardingData(page)
    await page.reload()

    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
  })

  test('loads without error when onboarding data is absent', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create account' })).toBeEnabled()
  })

  // ── Navigation ──────────────────────────────────────

  test('links back to login page', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/login')
  })

  // ── Submit (current stub behaviour) ──

  test('navigates to /onboarding/first-entry on valid submit (stub)', async ({ page }) => {
    await fillSignupForm(page, {
      name:     'Mikael Virtanen',
      email:    'mikael@example.fi',
      password: 'P@ssw0rd!',
    })
    await expect(page).toHaveURL('/onboarding/first-entry', { timeout: 10_000 })
  })

  test('clears onboarding data from sessionStorage after successful submit (stub)', async ({ page }) => {
    await seedOnboardingData(page)
    await page.reload()

    await fillSignupForm(page, {
      name:     'Mikael Virtanen',
      email:    'mikael@example.fi',
      password: 'P@ssw0rd!',
    })

    const stored = await page.evaluate(() => sessionStorage.getItem('oppi_onboarding_data'))
    expect(stored).toBeNull()
  })

})
