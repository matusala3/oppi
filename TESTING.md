# Playwright E2E Testing Guide — Oppi

Practical engineering reference for end-to-end testing the Oppi web app.
Stack: Next.js 16 (App Router) · React 19 · TypeScript · pnpm monorepo.

---

## Table of Contents

1. [Installation & Setup](#1-installation--setup)
2. [Project Structure](#2-project-structure)
3. [Configuration — Browsers & Devices](#3-configuration--browsers--devices)
4. [Writing Responsive Layout Tests](#4-writing-responsive-layout-tests)
5. [Writing Functional Auth Tests](#5-writing-functional-auth-tests)
6. [Writing Accessibility Tests](#6-writing-accessibility-tests)
7. [Writing Performance Tests](#7-writing-performance-tests)
8. [Running, Debugging & Reports](#8-running-debugging--reports)

---

## 1. Installation & Setup

### 1.1 Install Playwright in the web app

```bash
# From the repo root — scope to the web app package
pnpm --filter @oppi/web add -D @playwright/test @axe-core/playwright
```

### 1.2 Install browser binaries

```bash
cd apps/web
pnpm exec playwright install --with-deps
```

`--with-deps` installs OS-level dependencies (fonts, libglib, etc.) needed for headless browsers on Linux.

### 1.3 Add test scripts to `apps/web/package.json`

```json
"scripts": {
  "test:e2e":        "playwright test",
  "test:e2e:ui":     "playwright test --ui",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:debug":  "playwright test --debug"
}
```

### 1.4 Add to root `turbo.json`

```json
{
  "tasks": {
    "test:e2e": {
      "dependsOn": ["build"],
      "outputs": ["apps/web/playwright-report/**"]
    }
  }
}
```

### 1.5 Start the dev environment before tests

Playwright tests run against a live server. Start everything first:

```bash
# Terminal 1 — local infrastructure
docker compose up -d

# Terminal 2 — web dev server
pnpm dev:web
```

Or configure Playwright to start Next.js automatically (see `webServer` in Section 3).

---

## 2. Project Structure

Create the following layout inside `apps/web/`:

```
apps/web/
├── playwright.config.ts          # Playwright configuration
└── tests/
    ├── e2e/
    │   ├── auth/
    │   │   ├── login.spec.ts     # Login page tests
    │   │   └── signup.spec.ts    # Signup page tests
    │   ├── onboarding/
    │   │   └── flow.spec.ts      # Onboarding wizard tests
    │   └── layout/
    │       └── responsive.spec.ts # Responsive breakpoint tests
    ├── fixtures/
    │   └── auth.fixture.ts       # Shared auth setup / teardown
    └── helpers/
        ├── form.helper.ts        # Form fill utilities
        └── session.helper.ts     # sessionStorage utilities
```

**Rules:**
- One `spec.ts` file per page/feature — keep files focused.
- Helpers contain reusable logic; fixtures contain Playwright `test.extend` overrides.
- No shared state between tests — each test is fully independent.

---

## 3. Configuration — Browsers & Devices

Create `apps/web/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

/**
 * Base URL for the running Next.js dev server.
 * Override with PLAYWRIGHT_BASE_URL env var in CI.
 */
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /**
   * Automatically start Next.js before the test run.
   * Remove this block if you prefer to start the server manually.
   */
  webServer: {
    command: 'pnpm dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },

  projects: [
    // ── Desktop browsers ──────────────────────────────
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // ── Mobile viewports ──────────────────────────────
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },         // 393 × 851, deviceScaleFactor 2.75
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },       // 390 × 844, deviceScaleFactor 3
    },
  ],
})
```

**Device reference:**

| Project | Viewport | Notes |
|---|---|---|
| Desktop Chrome | 1280 × 720 | Brand panel visible (≥1024px) |
| Desktop Firefox | 1280 × 720 | Cross-browser parity |
| Desktop Safari | 1280 × 720 | WebKit rendering |
| Pixel 5 | 393 × 851 | Mobile logo visible, no brand panel |
| iPhone 12 | 390 × 844 | Safari on iOS |

---

## 4. Writing Responsive Layout Tests

The `AuthShell` component switches layout at **1024px**:
- `< 1024px` — Mobile logo (`Oppi` wordmark) visible; brand panel hidden.
- `≥ 1024px` — Brand panel visible; mobile logo hidden (`display: none`).

### `tests/e2e/layout/responsive.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

const AUTH_PAGES = ['/login', '/signup'] as const

for (const path of AUTH_PAGES) {
  test.describe(`${path} — responsive layout`, () => {

    test('shows mobile logo and hides brand panel below 1024px', async ({ page }) => {
      await page.setViewportSize({ width: 1023, height: 800 })
      await page.goto(path)

      // Mobile logo — "Oppi" wordmark — must be visible
      await expect(page.getByText('Oppi')).toBeVisible()

      // Brand panel title is absent from the DOM (or hidden)
      // Login has "Welcome\nback." and signup has "Your money,\nsorted."
      // Check that the brand panel element is not visible at mobile
      const brandPanel = page.locator('[class*="brandPanel"]').first()
      await expect(brandPanel).not.toBeVisible()
    })

    test('shows brand panel and hides mobile logo at 1024px+', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 })
      await page.goto(path)

      // Mobile logo must be hidden at desktop
      const mobileLogo = page.locator('[class*="mobileLogo"]')
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
```

---

## 5. Writing Functional Auth Tests

### 5.1 Helper — `tests/helpers/form.helper.ts`

```typescript
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
```

### 5.2 Helper — `tests/helpers/session.helper.ts`

```typescript
import type { Page } from '@playwright/test'

/** Seed onboarding data into sessionStorage before navigating to /signup. */
export async function seedOnboardingData(page: Page) {
  // Must be called after page.goto() — session storage is origin-scoped
  await page.evaluate(() => {
    const data = {
      quizAnswers: [0, 1, 0, 1, 0, 1, 0, 1],
      lifeStage: {
        goal:            'Save for a goal',
        startingModule:  'Budgeting basics',
        confidence:      'Not confident',
      },
    }
    sessionStorage.setItem('oppi_onboarding_data', JSON.stringify(data))
  })
}

/** Clear onboarding data from sessionStorage. */
export async function clearOnboardingData(page: Page) {
  await page.evaluate(() => sessionStorage.removeItem('oppi_onboarding_data'))
}
```

### 5.3 Login tests — `tests/e2e/auth/login.spec.ts`

```typescript
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

    // Toggle button — aria-label set in AuthFormField
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
    await expect(page).toHaveURL('/dashboard')
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
```

### 5.4 Signup tests — `tests/e2e/auth/signup.spec.ts`

```typescript
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

  test('renders step indicator with "Create Account" as active step', async ({ page }) => {
    await expect(page.getByText('Create Account')).toBeVisible()
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
  // The meter appears while typing and is hidden after a validation error.
  // It uses role="status" and aria-label="Password strength: {level}".

  test('shows Weak strength for a short password', async ({ page }) => {
    await page.locator('#signup-password').fill('abc')
    await expect(page.getByRole('status')).toHaveAttribute(
      'aria-label', 'Password strength: Weak',
    )
  })

  test('shows Fair strength for a medium password', async ({ page }) => {
    await page.locator('#signup-password').fill('password')
    await expect(page.getByRole('status')).toHaveAttribute(
      'aria-label', 'Password strength: Fair',
    )
  })

  test('shows Strong strength for a complex password', async ({ page }) => {
    await page.locator('#signup-password').fill('P@ssw0rd!2024')
    await expect(page.getByRole('status')).toHaveAttribute(
      'aria-label', 'Password strength: Strong',
    )
  })

  test('hides strength meter after password validation error is shown', async ({ page }) => {
    await page.locator('#signup-password').fill('abc')
    await page.getByRole('button', { name: 'Create account' }).click()

    // Meter is removed when errors.password is set
    await expect(page.getByRole('status')).not.toBeVisible()
  })

  // ── sessionStorage — onboarding data ──────────────

  test('reads onboarding data from sessionStorage when present', async ({ page }) => {
    await seedOnboardingData(page)

    // Reload the page so the useEffect re-runs with storage populated
    await page.reload()

    // Confirm the page still loads correctly (data is silent — no visible indicator)
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
  })

  test('loads without error when onboarding data is absent', async ({ page }) => {
    // Default — no seed — page should still work
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
    await expect(page).toHaveURL('/onboarding/first-entry')
  })

  test('clears onboarding data from sessionStorage after successful submit (stub)', async ({ page }) => {
    await seedOnboardingData(page)
    await page.reload()

    await fillSignupForm(page, {
      name:     'Mikael Virtanen',
      email:    'mikael@example.fi',
      password: 'P@ssw0rd!',
    })

    // After redirect, go back and verify storage was cleared
    const stored = await page.evaluate(() => sessionStorage.getItem('oppi_onboarding_data'))
    expect(stored).toBeNull()
  })

})
```

### 5.5 Mocking API routes (for when the API is wired)

Use `page.route()` to mock `fetch` calls without needing a live backend:

```typescript
// Intercept POST /api/auth/login
await page.route('/api/auth/login', route =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      user: { id: '1', email: 'user@example.fi' },
      tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
    }),
  }),
)
```

---

## 6. Writing Accessibility Tests

Install the axe integration (already added in Section 1.1):

```bash
pnpm --filter @oppi/web add -D @axe-core/playwright
```

### 6.1 Fixture — `tests/fixtures/auth.fixture.ts`

```typescript
import { test as base } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

type AxeFixture = { makeAxeBuilder: () => AxeBuilder }

export const test = base.extend<AxeFixture>({
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () =>
      new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])

    await use(makeAxeBuilder)
  },
})

export { expect } from '@playwright/test'
```

### 6.2 Accessibility tests — add to each spec file

```typescript
import { test, expect } from '../../fixtures/auth.fixture'

test.describe('Login — accessibility', () => {

  test('has no axe violations on initial load', async ({ page, makeAxeBuilder }) => {
    await page.goto('/login')
    const results = await makeAxeBuilder().analyze()
    expect(results.violations).toEqual([])
  })

  test('error banner is announced to screen readers via role=alert', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Form error banner uses role="alert" — screen readers announce immediately
    const alert = page.getByRole('alert')
    await expect(alert).toBeVisible()
  })

  test('form fields have associated labels', async ({ page }) => {
    await page.goto('/login')

    // getByLabel confirms label-input association (for/id or aria-labelledby)
    await expect(page.getByLabel('Email address')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
  })

  test('submit button is keyboard-focusable and activatable', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#login-email').fill('user@example.fi')
    await page.locator('#login-password').fill('password')

    // Tab to submit and press Enter
    await page.keyboard.press('Tab')  // → password toggle button
    await page.keyboard.press('Tab')  // → submit button
    await page.keyboard.press('Enter')

    // Should trigger submit — check URL change (stub behaviour)
    await expect(page).toHaveURL('/dashboard')
  })

  test('has no axe violations on signup page', async ({ page, makeAxeBuilder }) => {
    await page.goto('/signup')
    const results = await makeAxeBuilder().analyze()
    expect(results.violations).toEqual([])
  })

  test('password strength status is announced to screen readers', async ({ page }) => {
    await page.goto('/signup')
    await page.locator('#signup-password').fill('P@ssw0rd!2024')

    // role="status" — polite live region — announces strength changes
    await expect(page.getByRole('status')).toHaveAttribute(
      'aria-label', 'Password strength: Strong',
    )
  })

})
```

---

## 7. Writing Performance Tests

Playwright provides built-in tools for measuring load times, collecting traces, and checking JavaScript coverage. Use these for catch regressions in bundle size and time-to-interactive.

### 7.1 Load time assertions

```typescript
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

    // Wait for the heading (largest contentful paint candidate)
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
```

### 7.2 Navigation Performance API

```typescript
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

  console.log('Timing:', timing)  // Logged in the report

  expect(timing.ttfb).toBeLessThan(500)               // Time to first byte
  expect(timing.domContentLoaded).toBeLessThan(1500)  // DOM interactive
  expect(timing.load).toBeLessThan(3000)              // Full load
})
```

### 7.3 Tracing — capture waterfall for analysis

Enable tracing per-test for deep investigation. Already set in `playwright.config.ts` with `trace: 'on-first-retry'`.

To force a trace for a specific test during investigation:

```typescript
test('capture trace of signup flow', async ({ page, context }) => {
  await context.tracing.start({ screenshots: true, snapshots: true })

  await page.goto('/signup')
  await page.locator('#signup-name').fill('Mikael Virtanen')
  await page.locator('#signup-email').fill('mikael@example.fi')
  await page.locator('#signup-password').fill('P@ssw0rd!')
  await page.getByRole('button', { name: 'Create account' }).click()

  await context.tracing.stop({ path: 'traces/signup-flow.zip' })
})
```

Open the trace with:

```bash
pnpm exec playwright show-trace traces/signup-flow.zip
```

### 7.4 JS Coverage (identify unused code)

```typescript
test('login page JS coverage baseline', async ({ page }) => {
  await page.coverage.startJSCoverage()
  await page.goto('/login')
  await page.getByRole('button', { name: 'Sign in' }).click()
  const coverage = await page.coverage.stopJSCoverage()

  const totalBytes = coverage.reduce((sum, e) => sum + e.text.length, 0)
  const usedBytes  = coverage.reduce((sum, e) =>
    sum + e.ranges.reduce((s, r) => s + r.end - r.start, 0), 0)

  const usageRatio = usedBytes / totalBytes
  console.log(`JS coverage: ${(usageRatio * 100).toFixed(1)}%`)

  // Fail if less than 60% of loaded JS is actually executed
  expect(usageRatio).toBeGreaterThan(0.6)
})
```

---

## 8. Running, Debugging & Reports

### 8.1 Common commands

```bash
# Run all E2E tests
pnpm --filter @oppi/web test:e2e

# Run a specific file
pnpm --filter @oppi/web test:e2e -- tests/e2e/auth/login.spec.ts

# Run tests matching a pattern (test title)
pnpm --filter @oppi/web test:e2e -- --grep "validation"

# Run a single browser only
pnpm --filter @oppi/web test:e2e -- --project=chromium

# Run mobile tests only
pnpm --filter @oppi/web test:e2e -- --project=mobile-chrome --project=mobile-safari

# Run in headed mode (see the browser)
pnpm --filter @oppi/web test:e2e:headed

# Run with retries disabled (faster local feedback)
pnpm --filter @oppi/web test:e2e -- --retries=0
```

### 8.2 Debug mode

Pauses execution and opens the Playwright Inspector:

```bash
pnpm --filter @oppi/web test:e2e:debug -- tests/e2e/auth/login.spec.ts
```

Inside Inspector:
- Click **Step over** (F10) to advance line by line.
- Click **Pick locator** to generate selectors for any element.
- The browser stays open — interact with it manually.

Add `await page.pause()` anywhere in a test to pause at that exact point:

```typescript
test('debug this specific step', async ({ page }) => {
  await page.goto('/login')
  await page.pause()  // ← Inspector opens here
  await page.locator('#login-email').fill('user@example.fi')
})
```

### 8.3 UI Mode (recommended for local development)

```bash
pnpm --filter @oppi/web test:e2e:ui
```

UI Mode opens a browser-based interface with:
- Sidebar showing all tests and their status.
- Timeline of each test step.
- Screenshots and DOM snapshots at every action.
- Filter by browser, file, or test name.
- Watch mode — reruns tests when files change.

### 8.4 Reports

After a test run, open the HTML report:

```bash
pnpm exec playwright show-report apps/web/playwright-report
```

The report includes:
- Pass/fail/flaky status per test and project.
- Screenshots captured on failure.
- Video recordings (`retain-on-failure` — configured in `playwright.config.ts`).
- Traces (downloadable zip — open with `show-trace`).

### 8.5 CI integration

Set `PLAYWRIGHT_BASE_URL` to the deployed preview URL:

```bash
# Example: GitHub Actions
PLAYWRIGHT_BASE_URL=https://preview.oppi.app pnpm --filter @oppi/web test:e2e
```

Recommended CI flags:
```bash
pnpm exec playwright test --reporter=github  # Annotates PRs with failures
```

### 8.6 Updating browser binaries

After upgrading `@playwright/test`:

```bash
pnpm exec playwright install
```

### 8.7 Quick reference — selector strategy

Prefer selectors in this order (most to least resilient):

| Priority | Selector | Example |
|---|---|---|
| 1 | Role + name | `getByRole('button', { name: 'Sign in' })` |
| 2 | Label | `getByLabel('Email address')` |
| 3 | Text | `getByText('Create one free')` |
| 4 | `id` attribute | `locator('#login-email')` |
| 5 | `data-testid` | `locator('[data-testid="submit"]')` |
| Last resort | CSS class | `locator('[class*="submitButton"]')` |

The Oppi components use explicit `id` attributes on form fields (`#login-email`, `#login-password`, `#signup-name`, `#signup-email`, `#signup-password`) — use these directly.
