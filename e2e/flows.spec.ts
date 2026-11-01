/// <reference lib="dom" />
// The handful of journeys that matter most, run in a real browser against the
// built site. If one of these breaks, a visitor would notice.
import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'

// Dates on the home page are worked out from today. A fixed clock keeps the
// flow the same on every run.
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-31T09:00:00+05:30') })
})

/** Opens a page and waits until its island is live, so a click is not lost on
 * the server-rendered HTML before React has attached its handlers. */
async function open(page: Page, path: string) {
  await page.goto(path)
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0)
}

const savedKeys = (page: Page) =>
  page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('switchkarle.')))

async function answerThreeQuestions(page: Page) {
  await open(page, '/')
  await page.locator('main input[type="date"]').fill('2023-04-10')
  await page.locator('main input[type="number"]').fill('60')
  await page.getByRole('button', { name: 'See my dates' }).click()
  // Five-day or six-day week, then the date, then the recap.
  await page.locator('main button').first().click()
  await page.getByRole('button', { name: 'Next: pick a date' }).click()
  await page.getByRole('button', { name: 'Use this date' }).first().click()
  await expect(page.getByRole('heading', { name: 'Your dates.' })).toBeVisible()
}

test('home: three questions lead to dated steps that are still there after a reload', async ({ page }) => {
  await answerThreeQuestions(page)
  await expect(page.getByText(/^Resign on /)).toBeVisible()
  await page.reload()
  await expect(page.getByText(/^Resign on /)).toBeVisible()
  await expect(page.locator('main input[type="date"]')).toHaveCount(0)
})

test('decoder: changing the CTC changes the in-hand figure, and the bar matches its percent', async ({ page }) => {
  await open(page, '/decoder/')
  const figure = page.getByText(/actually pays$/).locator('xpath=following-sibling::p[1]')
  const before = await figure.innerText()
  expect(before).toMatch(/₹/)

  await page.getByLabel('Total CTC').fill('4000000')
  await expect(figure).not.toHaveText(before)

  const { barPct, textPct } = await page.evaluate(() => {
    const rect = document.querySelector('main svg rect.fill-leaf')!
    const svg = rect.closest('svg')!
    const label = svg.nextElementSibling!.querySelector('span')!.textContent!
    return {
      barPct: (rect.getBoundingClientRect().width / svg.getBoundingClientRect().width) * 100,
      textPct: parseFloat(label),
    }
  })
  expect(Math.abs(barPct - textPct)).toBeLessThan(1.5)
})

test('language toggle keeps you on the same tool', async ({ page }) => {
  await open(page, '/gratuity/')
  await page.getByRole('button', { name: 'हिं' }).click()
  await expect(page).toHaveURL(/^http:\/\/[^/]+\/hi\/gratuity\/$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi')
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0)
  await page.getByRole('button', { name: 'EN' }).click()
  await expect(page).toHaveURL(/^http:\/\/[^/]+\/gratuity\/$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
})

test('erase removes everything the site saved', async ({ page }) => {
  await answerThreeQuestions(page)
  expect((await savedKeys(page)).length).toBeGreaterThan(0)
  await page.getByRole('button', { name: 'Erase saved data' }).click()
  await page.getByRole('button', { name: 'Erase everything' }).click()
  await expect(page.getByText(/^Erased\./)).toBeVisible()
  expect(await savedKeys(page)).toEqual([])
})

test('backup file restores everything into an empty browser', async ({ page }) => {
  await answerThreeQuestions(page)
  const before = (await savedKeys(page)).sort()

  await page.getByRole('button', { name: 'Back up or restore' }).click()
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download backup file' }).click(),
  ])
  const file = await download.path()
  expect(JSON.parse(readFileSync(file, 'utf8')).version).toBe(2)

  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0)
  await page.getByRole('button', { name: 'Back up or restore' }).click()
  await page.locator('[role="dialog"] input[type="file"]').setInputFiles(file)
  await page.getByRole('button', { name: 'Restore', exact: true }).click()
  await expect(page.getByText(/^Restored \d+ saved items?\./)).toBeVisible()
  expect((await savedKeys(page)).sort()).toEqual(before)

  await page.getByRole('button', { name: 'Done' }).click()
  await expect(page.getByText(/^Resign on /)).toBeVisible()
})

test('a browser that cannot save is told so once', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('blocked', 'QuotaExceededError')
    }
  })
  await open(page, '/')
  const notice = page.getByText(/isn’t keeping your answers/)
  await expect(notice).toBeHidden()
  await page.locator('main input[type="number"]').fill('45')
  await page.locator('main input[type="date"]').fill('2023-04-10')
  await page.getByRole('button', { name: 'See my dates' }).click()
  await expect(notice).toBeVisible()
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(notice).toBeHidden()
})
