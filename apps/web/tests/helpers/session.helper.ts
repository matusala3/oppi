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
