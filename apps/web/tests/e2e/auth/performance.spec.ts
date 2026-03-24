import { test, expect } from '@playwright/test'

test.describe('Performance — page load', () => {

  test('login page loads within 3 seconds (cold start)', async ({ page }) => {
    const start = Date.now()
    await page.goto('/login', { waitUntil: 'networkidle' })
    const loadTime = Date.now() - start

    expect(loadTime).toBeLessThan(3000)
  })

  test('login page LCP element is visible within 2.5 seconds', async ({ page }) => {
    await page.goto('/login')

    const heading = page.getByRole('heading', { name: 'Sign in' })
    await expect(heading).toBeVisible({ timeout: 2500 })
  })

  test('signup page loads within 3 seconds', async ({ page }) => {
    const start = Date.now()
    await page.goto('/signup', { waitUntil: 'networkidle' })
    const loadTime = Date.now() - start

    expect(loadTime).toBeLessThan(3000)
  })

})

test.describe('Performance — navigation timing', () => {

  test('login page navigation timing within budget', async ({ page }) => {
    await page.goto('/login')

    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
        load:             nav.loadEventEnd - nav.startTime,
        ttfb:             nav.responseStart - nav.requestStart,
      }
    })

    console.log('Timing:', timing)

    expect(timing.ttfb).toBeLessThan(500)
    expect(timing.domContentLoaded).toBeLessThan(1500)
    expect(timing.load).toBeLessThan(3000)
  })

})

test.describe('Performance — tracing', () => {

  test('capture trace of signup flow', async ({ page, context }) => {
    await context.tracing.start({ screenshots: true, snapshots: true })

    await page.goto('/signup')
    await page.locator('#signup-name').fill('Mikael Virtanen')
    await page.locator('#signup-email').fill('mikael@example.fi')
    await page.locator('#signup-password').fill('P@ssw0rd!')
    await page.getByRole('button', { name: 'Create account' }).click()

    await context.tracing.stop({ path: 'traces/signup-flow.zip' })
  })

})

test.describe('Performance — JS coverage', () => {

  test('login page JS coverage baseline', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'page.coverage API is only available in Chromium')
    await page.coverage.startJSCoverage({ includeRawScriptCoverage: true })
    await page.goto('/login')
    await page.getByRole('button', { name: 'Sign in' }).click()
    const coverage = await page.coverage.stopJSCoverage()

    // Next.js bundles may report empty text — use rawScriptCoverage byte counts
    const totalBytes = coverage.reduce((sum, e) =>
      sum + (e.rawScriptCoverage?.functions.reduce((fs, f) =>
        fs + f.ranges.reduce((rs, r) => rs + r.endOffset - r.startOffset, 0), 0) ?? e.text?.length ?? 0), 0)

    const usedBytes = coverage.reduce((sum, e) =>
      sum + (e.ranges ?? []).reduce((s, r) => s + r.end - r.start, 0), 0)

    console.log(`JS coverage entries: ${coverage.length}, total bytes tracked: ${totalBytes}, used: ${usedBytes}`)

    // Verify coverage API is working — at least some scripts were tracked
    expect(coverage.length).toBeGreaterThan(0)
  })

})
