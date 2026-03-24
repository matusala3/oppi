import type { Page } from '@playwright/test'

/** Fill and submit the login form. */
export async function fillLoginForm(
  page: Page,
  opts: { email: string; password: string },
) {
  await page.locator('#login-email').fill(opts.email)
  await page.locator('#login-password').fill(opts.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

/** Fill and submit the signup form. */
export async function fillSignupForm(
  page: Page,
  opts: { name: string; email: string; password: string },
) {
  await page.locator('#signup-name').fill(opts.name)
  await page.locator('#signup-email').fill(opts.email)
  await page.locator('#signup-password').fill(opts.password)
  await page.getByRole('button', { name: 'Create account' }).click()
}
