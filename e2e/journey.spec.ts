/// <reference lib="dom" />
// One thread through the switch: the home plan's dates reach the tools, and
// every result points at one next tool, in English and in Hindi.
import { expect, test, type Page } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-31T09:00:00+05:30') })
})

async function open(page: Page, path: string) {
  await page.goto(path)
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0)
}

/** What the home plan saves once the questions are answered and a date is picked. */
async function seedPlan(page: Page, extra: Record<string, unknown> = {}) {
  await page.addInitScript((more) => {
    localStorage.setItem('switchkarle.current-job.v1', JSON.stringify({ joinDate: '2022-01-12', noticePeriodDays: 60 }))
    localStorage.setItem('switchkarle.plan.v1', JSON.stringify({ resignDate: '2027-06-01' }))
    for (const [key, value] of Object.entries(more)) localStorage.setItem(key, JSON.stringify(value))
  }, extra)
}

test('gratuity opens on the plan’s join date and last working day, and says so', async ({ page }) => {
  await seedPlan(page)
  await open(page, '/gratuity/')
  await expect(page.getByLabel('Join date', { exact: true })).toHaveValue('2022-01-12')
  // 1 June 2027 + 60 days, counting the resignation day as day one.
  await expect(page.getByLabel('Last working day', { exact: true })).toHaveValue('2027-07-30')
  await expect(page.locator('[data-plan-dates]')).toContainText('From your plan: join date 12 January 2022')
  await expect(page.locator('[data-plan-dates]')).toContainText('last working day 30 July 2027')
  // The day-one count is our reading, and the receipt keeps saying so.
  await expect(page.locator('[data-receipt]')).toContainText('Convention, not law: Last working day')

  // Changing a date in the tool makes it the person's own: the line stops claiming it.
  await page.getByLabel('Last working day', { exact: true }).fill('2027-09-15')
  await expect(page.locator('[data-plan-dates]')).not.toContainText('last working day')
})

test('gratuity in Hindi shows the plan’s dates too', async ({ page }) => {
  await seedPlan(page)
  await open(page, '/hi/gratuity/')
  await expect(page.locator('main input[type="date"]').first()).toHaveValue('2022-01-12')
  await expect(page.locator('[data-plan-dates]')).toContainText('आपके plan से')
})

test('with the plan dates and a saved basic + DA and work week, gratuity is their answer, not an example', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'switchkarle.current-job.v1',
      JSON.stringify({ joinDate: '2022-01-12', noticePeriodDays: 60, monthlyBasicDA: 80000, workWeekDays: 5 }),
    )
    localStorage.setItem('switchkarle.plan.v1', JSON.stringify({ resignDate: '2027-06-01' }))
  })
  await open(page, '/gratuity/')
  await expect(page.locator('[data-plan-dates]')).toBeVisible()
  await expect(page.locator('[data-result-hero]').getByText('Example', { exact: true })).toHaveCount(0)
})

test('with only the plan dates, the pay is still the worked example and says so', async ({ page }) => {
  await seedPlan(page)
  await open(page, '/gratuity/')
  await expect(page.locator('[data-result-hero]').getByText('Example', { exact: true })).toBeVisible()
  await expect(page.locator('[data-result-hero]')).toContainText('Dates from your plan.')
})

test('without a plan, gratuity keeps its sample answer', async ({ page }) => {
  await open(page, '/gratuity/')
  await expect(page.getByLabel('Join date', { exact: true })).toHaveValue('2021-08-01')
  await expect(page.locator('[data-plan-dates]')).toHaveCount(0)
})

test('a date typed into the tool wins over the plan', async ({ page }) => {
  await seedPlan(page, {
    'switchkarle.gratuity.v1': {
      lastDrawnBasicDA: 90000,
      joinDate: '2020-03-01',
      exitDate: '2026-12-31',
      coveredByAct: true,
      workWeekDays: 6,
    },
  })
  await open(page, '/gratuity/')
  await expect(page.getByLabel('Join date', { exact: true })).toHaveValue('2020-03-01')
  await expect(page.locator('[data-plan-dates]')).toHaveCount(0)
})

test('the resignation letter and notice tracker start on the plan’s resign date', async ({ page }) => {
  await seedPlan(page)
  await open(page, '/resignation-letter/')
  await expect(page.locator('main input[type="date"]').first()).toHaveValue('2027-06-01')
  await expect(page.locator('[data-plan-dates]')).toContainText('resignation date 1 June 2027')
  await open(page, '/notice-tracker/')
  await expect(page.getByLabel('Resignation date', { exact: true })).toHaveValue('2027-06-01')
  await expect(page.locator('[data-plan-dates]')).toBeVisible()
})

test('the Next link walks to the next tool, in English and in Hindi', async ({ page }) => {
  await open(page, '/gratuity/')
  const next = page.locator('a[data-next-step]')
  await expect(next).toHaveCount(1)
  await expect(next).toContainText('Next')
  await next.click()
  await expect(page).toHaveURL(/^http:\/\/[^/]+\/leave-encashment\/$/)

  await open(page, '/hi/gratuity/')
  await expect(page.locator('a[data-next-step]')).toContainText('अगला क़दम')
  await page.locator('a[data-next-step]').click()
  await expect(page).toHaveURL(/^http:\/\/[^/]+\/hi\/leave-encashment\/$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi')
})

test('a Next link into a later stage names that stage', async ({ page }) => {
  await open(page, '/clause-library/')
  await expect(page.locator('a[data-next-step="tracker"]')).toContainText('Next stage: Looking, quietly')
})

test('the last tool of the journey leads back to the plan', async ({ page }) => {
  await open(page, '/hi/form16-shock/')
  await page.locator('a[data-next-step="plan"]').click()
  await expect(page).toHaveURL(/^http:\/\/[^/]+\/hi\/$/)
})
