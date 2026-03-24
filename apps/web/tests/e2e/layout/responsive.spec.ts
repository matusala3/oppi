import { test, expect } from '@playwright/test'

const AUTH_PAGES = ['/login', '/signup'] as const

for (const path of AUTH_PAGES) {
  test.describe(`${path} — responsive layout`, () => {

    test('shows mobile logo and hides brand panel below 1024px', async ({ page }) => {
      await page.setViewportSize({ width: 1023, height: 800 })
      await page.goto(path)

      // Mobile logo — "Oppi" wordmark — scoped to main to avoid matching brand panel
      await expect(page.getByRole('main').getByText('Oppi')).toBeVisible()

      // Brand panel must not be visible at mobile
      const brandPanel = page.locator('[class*="brandPanel"]').first()
      await expect(brandPanel).not.toBeVisible()
    })

    test('shows brand panel and hides mobile logo at 1024px+', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 })
      await page.goto(path)

      // .first() targets the outer container div (not the inner mark/text children)
      const mobileLogo = page.locator('[class*="mobileLogo"]').first()
      await expect(mobileLogo).toBeHidden()

      // Brand panel must be visible
      const brandPanel = page.locator('[class*="brandPanel"]').first()
      await expect(brandPanel).toBeVisible()
    })

    test('form is fully scrollable on narrow mobile (375px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(path)

      // Submit button must be reachable — scroll into view
      const submitButton = page.getByRole('button', { name: /sign in|create account/i })
      await submitButton.scrollIntoViewIfNeeded()
      await expect(submitButton).toBeVisible()
    })

  })
}

test.describe('onboarding — responsive layout', () => {

  test('welcome step renders at 375px without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // No horizontal scrollbar — body width equals viewport width
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(375)
  })

})
