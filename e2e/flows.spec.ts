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
  // The dates follow the answers live; the work week is asked because, for
  // this join date, it changes the gratuity date.
  await page.getByRole('button', { name: /^I work five days a week/ }).click()
  await expect(page.getByText(/^Your gratuity is safe from /)).toBeVisible()
  await page.getByRole('button', { name: 'Pick my resign date' }).click()
  await page.getByRole('button', { name: /^Resign on / }).first().click()
  await expect(page.getByRole('heading', { name: 'Your plan' })).toBeVisible()
}

test('home: three questions lead to dated steps that are still there after a reload', async ({ page }) => {
  await answerThreeQuestions(page)
  await expect(page.getByText(/^Resign on /)).toBeVisible()
  await page.reload()
  await expect(page.getByText(/^Resign on /)).toBeVisible()
  await expect(page.locator('main input[type="date"]')).toHaveCount(0)
})

test('home: the example dates are on screen before anything is typed, and change as you answer', async ({ page }) => {
  await open(page, '/')
  await expect(page.getByRole('heading', { level: 1, name: 'Find the safest day to resign.' })).toBeVisible()
  // Six-day reading: fourth anniversary Monday 12 January 2026, plus 240
  // Monday-to-Saturday working days = 40 weeks, ending Saturday 17 October.
  await expect(page.getByText(/^Your gratuity was already safe on 17 October 2026/)).toBeVisible()
  await expect(page.getByText(/^Your hike lands in May 2027\./)).toBeVisible()
  // Both readings behind Ravi: the week would change nothing, so it is not asked.
  await expect(page.getByRole('button', { name: /^I work five days a week/ })).toHaveCount(0)

  await page.getByLabel('Which month does the hike actually reach your account?').selectOption({ label: 'Not sure, skip' })
  await expect(page.getByText(/^Your hike lands/)).toHaveCount(0)
})

test('home: a press with something missing says what, and the week is asked only when it matters', async ({ page }) => {
  await open(page, '/')
  await page.locator('main input[type="number"]').fill('')
  await page.getByRole('button', { name: 'Pick my resign date' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Enter your notice in days, at least 1.' })).toBeVisible()
  await expect(page.locator('main input[type="number"]')).toBeFocused()

  await page.locator('main input[type="number"]').fill('60')
  await page.locator('main input[type="date"]').fill('2023-04-10')
  await page.getByRole('button', { name: 'Pick my resign date' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Tap your work week to go on.' })).toBeVisible()
  await expect(page.getByRole('button', { name: /^I work five days a week/ })).toBeFocused()

  await page.getByRole('button', { name: /^I work six days a week/ }).click()
  await page.getByRole('button', { name: 'Pick my resign date' }).click()
  await expect(page.getByRole('heading', { name: 'When do you want to resign?' })).toBeFocused()
})

test('home: "what this is worth" answers in rupees inside the recap', async ({ page }) => {
  await open(page, '/')
  await page.getByRole('button', { name: 'Pick my resign date' }).click()
  await expect(page.getByText('Loses nothing')).toBeVisible()
  await page.getByRole('button', { name: 'Resign on 1 June 2027' }).click()
  await expect(page.getByRole('heading', { name: 'Your plan' })).toBeFocused()
  // No tool list under the recap (IA-17).
  await expect(page.getByText(/^All \d+ tools/)).toHaveCount(0)

  await page.getByRole('button', { name: 'See what your gratuity is worth' }).click()
  await page.getByLabel('Monthly basic + DA').fill('72000')
  // 15/26 × ₹72,000 × 6 payable years (5 years 7 months to 29 August 2027).
  await expect(
    page.getByText('With a last working day of 29 August 2027, your gratuity comes to at least ₹2,49,231.'),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open the full gratuity calculator' })).toHaveAttribute('href', '/gratuity/')
})

test('home: the recap shows the first actions, and a start-applying date already gone says so', async ({ page }) => {
  await open(page, '/')
  await page.getByRole('button', { name: 'Pick my resign date' }).click()
  const own = page.locator('[data-trade="own-date"]')
  await own.locator('input[type="date"]').fill('2026-11-20')
  await own.getByRole('button', { name: 'Resign on 20 November 2026' }).click()
  await expect(page.getByRole('heading', { name: 'Your plan' })).toBeFocused()
  // N5: the action list is on the first visit, not only after a reload.
  await expect(page.getByRole('heading', { name: 'Your first ten actions' })).toBeVisible()
  // UX-07: on 90 days' notice the start-applying date is long gone.
  await expect(page.getByText(/^Start applying now\. .* has already passed\.$/)).toBeVisible()
  await expect(page.getByText(/^Start applying by /)).toHaveCount(0)
})

test('home in Hindi: the same door, headline first', async ({ page }) => {
  await open(page, '/hi/')
  await expect(page.getByRole('heading', { level: 1, name: 'Resign करने का सबसे safe दिन ढूँढें।' })).toBeVisible()
  await page.getByRole('button', { name: 'मेरी resign date चुनें' }).click()
  await expect(page.getByRole('heading', { name: 'आप कब resign करना चाहते हैं?' })).toBeVisible()
})

test('decoder: changing the CTC changes the in-hand figure, and the bar matches its percent', async ({ page }) => {
  await open(page, '/decoder/')
  const figure = page.getByText(/actually pays$/).locator('xpath=following-sibling::p[1]')
  const before = await figure.innerText()
  expect(before).toMatch(/₹/)

  await page.getByLabel('Total CTC').fill('4000000')
  await expect(figure).not.toHaveText(before)

  const { barPct, textPct } = await page.evaluate(() => {
    const rect = document.querySelector('main svg rect[data-seg="in-hand"]')!
    const svg = rect.closest('svg')!
    const label = svg.nextElementSibling!.querySelector('span')!.textContent!
    return {
      barPct: (rect.getBoundingClientRect().width / svg.getBoundingClientRect().width) * 100,
      textPct: parseFloat(label),
    }
  })
  expect(Math.abs(barPct - textPct)).toBeLessThan(1.5)
})

test('decoder: "Use my numbers" puts the cursor in a field the visitor can see', async ({ page }) => {
  await open(page, '/decoder/')
  await page.getByRole('button', { name: /^Use my numbers/ }).first().click()
  const focused = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el) return null
    return { tag: el.tagName, visible: el.getClientRects().length > 0 && !el.closest('details:not([open])') }
  })
  expect(focused?.tag).toMatch(/^(INPUT|SELECT|TEXTAREA)$/)
  expect(focused?.visible).toBe(true)
})

test('a missing Hindi page is in Hindi, and its other-language button goes to the English home', async ({ page }) => {
  await page.goto('/hi/no-such-page/')
  await expect(page.getByRole('heading', { level: 1, name: 'यह page मौजूद नहीं है।' })).toBeVisible()
  const english = page.getByRole('link', { name: 'English home' })
  await expect(english).toHaveAttribute('href', '/')
  await expect(page.getByRole('link', { name: 'होम page पर जाएं' })).toHaveAttribute('href', '/hi/')
})

test('language toggle keeps you on the same tool', async ({ page }) => {
  await open(page, '/gratuity/')
  await page.getByRole('link', { name: 'हिन्दी (Hindi)' }).click()
  await expect(page).toHaveURL(/^http:\/\/[^/]+\/hi\/gratuity\/$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi')
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0)
  await page.getByRole('link', { name: 'English' }).click()
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
  await page.getByRole('button', { name: /^I work five days a week/ }).click()
  await expect(notice).toBeVisible()
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(notice).toBeHidden()
})
