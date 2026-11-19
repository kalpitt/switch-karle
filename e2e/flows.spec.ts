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

/** Opens the plan and waits until it has read the clock and any saved answers
 * (its button stops saying "Loading…"), so typing is not overwritten by the
 * mount effect. Hydration can finish a moment after Astro marks the island live. */
async function openPlan(page: Page, path = '/resign-date/') {
  await open(page, path)
  await expect(page.locator('[data-tool="plan"] button[aria-busy="false"]').first()).toBeVisible()
}

const savedKeys = (page: Page) =>
  page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('switchkarle.')))

async function answerThreeQuestions(page: Page) {
  await openPlan(page)
  await page.locator('main input[type="date"]').fill('2023-04-10')
  await page.locator('main input[type="number"]').fill('60')
  // The dates follow the answers live; the work week is asked because, for
  // this join date, it changes the gratuity date.
  await page.getByRole('button', { name: /^I work five days a week/ }).click()
  await expect(page.getByText(/^Your gratuity is safe from /)).toBeVisible()
  await page.getByRole('button', { name: 'See my options' }).click()
  await page.getByRole('button', { name: /^Choose / }).first().click()
  await expect(page.getByRole('heading', { name: 'Your plan' })).toBeVisible()
}

/** Ravi's answers (the example's own): joined 12 January 2022, 90 days' notice, hike in May.
 * The fields start empty since the rebuild (2026-11-16), so a test types them. */
async function answerAsRavi(page: Page, path = '/resign-date/') {
  await openPlan(page, path)
  await page.locator('main input[type="date"]').fill('2022-01-12')
  await page.locator('main input[type="number"]').fill('90')
  await page.locator('main select').first().selectOption('5')
}

test('plan: three questions lead to dated steps that are still there after a reload', async ({ page }) => {
  await answerThreeQuestions(page)
  await expect(page.getByText(/^Resign on /)).toBeVisible()
  await page.reload()
  await expect(page.getByText(/^Resign on /)).toBeVisible()
  await expect(page.locator('main input[type="date"]')).toHaveCount(0)
})

test('plan: before anything is typed the only dates are one boxed example line; yours follow your answers', async ({ page }) => {
  await open(page, '/resign-date/')
  await expect(page.getByRole('heading', { level: 1, name: 'Find the safest day to resign.' })).toBeVisible()
  // The fields start empty, and the example is one line worked out from today, never worded as yours.
  await expect(page.locator('main input[type="date"]')).toHaveValue('')
  await expect(page.locator('main input[type="number"]')).toHaveValue('')
  await expect(page.locator('[data-example-line]')).toHaveText(
    'ExampleJoined 12 January 2022, 90 days’ notice, hike in May. Earliest safe day to resign: 1 June 2027.',
  )
  await expect(page.getByText(/^Your gratuity/)).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Your dates' })).toHaveCount(0)
  // The privacy line sits above the first field (R7).
  await expect(page.locator('main [data-privacy-line]')).toBeVisible()

  await answerAsRavi(page)
  await expect(page.locator('[data-example-line]')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Your dates' })).toBeVisible()
  // Six-day reading: fourth anniversary Monday 12 January 2026, plus 240
  // Monday-to-Saturday working days = 40 weeks, ending Saturday 17 October.
  await expect(page.getByText(/^Your gratuity was already safe on 17 October 2026/)).toBeVisible()
  await expect(page.getByText(/^Your hike lands in May 2027\./)).toBeVisible()
  // Both readings behind Ravi: the week would change nothing, so it is not asked.
  await expect(page.getByRole('button', { name: /^I work five days a week/ })).toHaveCount(0)

  await page.getByLabel('Which month will your current job credit your hike?').selectOption({ label: 'No hike at current job, skip' })
  await expect(page.getByText(/^Your hike lands/)).toHaveCount(0)
})

test('plan: a press with something missing says what, and the week is asked only when it matters', async ({ page }) => {
  await openPlan(page)
  await page.locator('main input[type="date"]').fill('2022-01-12')
  await page.getByRole('button', { name: 'See my options' }).click()
  // Focus moves to the field, which reads its error once through its description (N12).
  await expect(page.getByText('Enter your notice in days, at least 1.')).toBeVisible()
  await expect(page.locator('main input[type="number"]')).toBeFocused()
  await expect(page.locator('main input[type="number"]')).toHaveAccessibleDescription(/Enter your notice in days, at least 1\./)
  await expect(page.getByRole('alert').filter({ hasText: 'Enter your notice in days, at least 1.' })).toHaveCount(0)

  await page.locator('main input[type="number"]').fill('60')
  await page.locator('main input[type="date"]').fill('2023-04-10')
  await page.getByRole('button', { name: 'See my options' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Tap your work week to go on.' })).toBeVisible()
  await expect(page.getByRole('button', { name: /^I work five days a week/ })).toBeFocused()

  await page.getByRole('button', { name: /^I work six days a week/ }).click()
  await page.getByRole('button', { name: 'See my options' }).click()
  // The answer is the heading: the earliest safe day, and what waiting for it keeps (R3).
  await expect(page.getByRole('heading', { name: /^Earliest safe day to resign: / })).toBeFocused()
  await expect(page.getByText('Resign on or after this day and you keep your gratuity.')).toBeVisible()
})

test('plan: the dates screen states the answer, and only the option that loses nothing is dark', async ({ page }) => {
  await answerAsRavi(page)
  await page.getByRole('button', { name: 'See my options' }).click()
  await expect(page.getByRole('heading', { name: 'Earliest safe day to resign: 1 June 2027' })).toBeFocused()
  await expect(page.getByText('Resign on or after this day and you keep your hike.')).toBeVisible()
  await expect(page.locator('[data-trade="keep-what-is-earned"]')).toContainText(
    'If you resign before 1 June 2027, you lose your hike. From 1 June 2027 you lose nothing.',
  )
  // One dark button (R8): the option tagged "Loses nothing".
  const dark = page.locator('[data-trade] button.bg-ink')
  await expect(dark).toHaveCount(1)
  await expect(dark).toHaveText('Choose 1 June 2027')
})

test('plan: a skipped hike is never named in the answer', async ({ page }) => {
  await openPlan(page)
  await page.locator('main input[type="date"]').fill('2023-04-10')
  await page.locator('main input[type="number"]').fill('60')
  await page.getByRole('button', { name: /^I work five days a week/ }).click()
  await page.getByRole('button', { name: 'See my options' }).click()
  await expect(page.getByText('Resign on or after this day and you keep your gratuity.')).toBeVisible()
  await expect(page.getByText(/your hike/)).toHaveCount(0)
})

test('plan: "what this is worth" answers in rupees inside the recap', async ({ page }) => {
  await answerAsRavi(page)
  await page.getByRole('button', { name: 'See my options' }).click()
  await expect(page.getByText('Loses nothing')).toBeVisible()
  await page.getByRole('button', { name: 'Choose 1 June 2027' }).click()
  await expect(page.getByRole('heading', { name: 'Your plan' })).toBeFocused()
  // No tool list under the recap (IA-17).
  await expect(page.getByText(/^All \d+ tools/)).toHaveCount(0)

  await page.getByRole('button', { name: 'See what your gratuity is worth' }).click()
  await page.getByLabel('Monthly basic + DA').fill('72000')
  // 15/26 × ₹72,000 × 6 payable years (5 years 7 months to 29 August 2027).
  const worth = page.locator('[data-worth] [role="status"]')
  await expect(worth).toContainText('Your gratuity with a last working day of 29 August 2027')
  await expect(worth).toContainText('₹2,49,231')
  await expect(worth).toContainText('At least this much.')
  await expect(page.getByRole('link', { name: 'Open the full gratuity calculator' })).toHaveAttribute('href', '/gratuity/')
})

test('plan: the recap shows the first actions, and a start-applying date already gone says so', async ({ page }) => {
  await answerAsRavi(page)
  await page.getByRole('button', { name: 'See my options' }).click()
  const own = page.locator('[data-trade="own-date"]')
  await own.locator('input[type="date"]').fill('2026-11-20')
  await own.getByRole('button', { name: 'Choose 20 November 2026' }).click()
  await expect(page.getByRole('heading', { name: 'Your plan' })).toBeFocused()
  // N5: the action list is on the first visit, not only after a reload.
  await expect(page.getByRole('heading', { name: 'Your first ten actions' })).toBeVisible()
  // UX-07: on 90 days' notice the start-applying date is long gone.
  await expect(page.getByText(/^Start applying now\. .* has already passed\.$/)).toBeVisible()
  await expect(page.getByText(/^Start applying by /)).toHaveCount(0)
})

test('plan: "I want to start looking now" hands focus to the line that replaces it, and announces it', async ({ page }) => {
  await answerAsRavi(page)
  await page.getByRole('button', { name: 'See my options' }).click()
  await page.getByRole('button', { name: 'Choose 1 June 2027' }).click()
  const looking = page.getByRole('button', { name: 'I want to start looking now' })
  await looking.focus()
  await page.keyboard.press('Enter')
  await expect(looking).toHaveCount(0)
  const since = page.getByRole('status').filter({ hasText: /^Looking since 31 October 2026\./ })
  await expect(since).toBeVisible()
  await expect(since).toBeFocused()
})

// Hindi is hidden during the rebuild (2026-11-19): these check that the Hindi page still
// works, by structure. Its words are rewritten in the Hindi pass.
test('plan in Hindi: the start-looking line is announced and focused too', async ({ page }) => {
  await answerAsRavi(page, '/hi/resign-date/')
  await page.locator('[data-tool="plan"] button.w-full').first().click()
  await page.locator('[data-trade]').getByRole('button').first().click()
  await page.getByRole('button', { name: 'मुझे अभी से देखना शुरू करना है' }).click()
  const since = page.getByRole('status').filter({ hasText: /से देख रहे हैं।/ })
  await expect(since).toBeFocused()
})

test('plan: each resign-date option is a named group, and its date field says which option it belongs to', async ({ page }) => {
  await answerAsRavi(page)
  await page.getByRole('button', { name: 'See my options' }).click()
  await expect(page.getByRole('group', { name: /^Leave sooner/ })).toBeVisible()
  await expect(page.getByRole('group', { name: 'I already have a date' })).toBeVisible()
  await expect(page.locator('[data-trade="keep-what-is-earned"] input[type="date"]')).toHaveAccessibleName(
    'Leave sooner Resignation date',
  )
  await expect(page.locator('[data-trade="own-date"] input[type="date"]')).toHaveAccessibleName(
    'I already have a date Resignation date',
  )
})

test('plan in Hindi: the same door, headline first', async ({ page }) => {
  await answerAsRavi(page, '/hi/resign-date/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi')
  await expect(page.locator('h1')).toHaveCount(1)
  await page.locator('[data-tool="plan"] button.w-full').first().click()
  await expect(page.locator('[data-trade]').first()).toBeVisible()
})

// The home page (rebuild, 2026-11-19): what the site is, then which step you are at.
test('home: says what the site is and offers five steps', async ({ page }) => {
  await open(page, '/')
  await expect(page.locator('h1')).toHaveText('Changing jobs? Free tools for every step.')
  await expect(page.locator('[data-privacy-line]')).toContainText('Nothing you type is sent anywhere.')
  await expect(page.getByRole('heading', { level: 2, name: 'Which step are you at?' })).toBeVisible()
  const cards = page.locator('a[data-door-card]')
  await expect(cards).toHaveCount(5)
  await expect(cards.first()).toHaveAttribute('href', '/start/leaving/')
  await expect(cards.first()).toContainText('Thinking of leaving')
  for (const card of await cards.all()) expect((await card.boundingBox())!.height).toBeGreaterThanOrEqual(64)
  await expect(page.getByRole('link', { name: 'Check what you are owed' })).toHaveAttribute('href', '/fnf-checker/')
  await expect(page.locator('a[data-all-tools]')).toHaveAttribute('href', '/tools/')
  await expect(page.locator('a[data-all-tools]')).toHaveText(/^See all \d+ tools$/)
  await expect(page.getByRole('link', { name: 'Why I built this' })).toHaveAttribute('href', '/about/')
  await cards.nth(2).click()
  await expect(page).toHaveURL(/\/start\/offer\/$/)
})

test('home in Hindi: the same five steps, linking to Hindi pages', async ({ page }) => {
  await open(page, '/hi/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi')
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('a[data-door-card]')).toHaveCount(5)
  await expect(page.locator('a[data-door-card]').first()).toHaveAttribute('href', '/hi/start/leaving/')
})

test('home: no form field on the page, and nothing is saved by opening it', async ({ page }) => {
  await open(page, '/')
  await expect(page.locator('main input, main select, main textarea')).toHaveCount(0)
  await expect(page.locator('[data-saved-plan]')).toHaveCount(0)
  expect(await savedKeys(page)).toEqual([])
})

test('home: a saved resign date shows the strip below the cards and links to the plan', async ({ page }) => {
  await answerThreeQuestions(page)
  await open(page, '/')
  const strip = page.locator('[data-saved-plan]')
  await expect(strip).toContainText(/^Your saved plan: resign on \d{1,2} \w+ \d{4}\./)
  await expect(strip.getByRole('link', { name: 'Open your plan' })).toHaveAttribute('href', '/resign-date/')
  const lastCard = (await page.locator('a[data-door-card]').last().boundingBox())!
  expect((await strip.boundingBox())!.y).toBeGreaterThan(lastCard.y)
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

test('decoder on a phone: a thin bar keeps the in-hand figure once the result card scrolls away', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await open(page, '/decoder/')
  const bar = page.locator('[data-sticky-inhand]')
  await expect(bar).toHaveCount(0)
  await page.getByLabel('Total CTC').scrollIntoViewIfNeeded()
  await page.mouse.wheel(0, 3000)
  await expect(bar).toBeVisible()
  await expect(bar).toHaveText(/^In your bank ₹[\d,]+\/month$/)
  // The wheel scroll may still be running once the (now shorter) card has gone,
  // and would carry the page back down: scroll up until it stays up.
  await expect(async () => {
    await page.evaluate(() => window.scrollTo(0, 0))
    await expect(bar).toHaveCount(0, { timeout: 500 })
  }).toPass()

  // Desktop never shows it: the result column stays in view there.
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.mouse.wheel(0, 3000)
  await expect(bar).toBeHidden()
})

test('decoder on a phone in Hindi: the bar speaks Hindi', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await open(page, '/hi/decoder/')
  await page.mouse.wheel(0, 3000)
  await expect(page.locator('[data-sticky-inhand]')).toHaveText(/^आपके bank में ₹[\d,]+\/month$/)
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

// Hindi is hidden until its translation pass (HINDI_ON, 2026-11-19): an English
// page offers no way into Hindi, and a Hindi page reached by its address still
// switches back to the same English tool. When HINDI_ON is true again, restore the
// English-to-Hindi click here.
test('language toggle keeps you on the same tool', async ({ page }) => {
  await open(page, '/hi/gratuity/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi')
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0)
  await page.getByRole('link', { name: 'English' }).click()
  await expect(page).toHaveURL(/^http:\/\/[^/]+\/gratuity\/$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
})

test('while Hindi is hidden, no English page links into Hindi', async ({ page }) => {
  for (const path of ['/', '/tools/', '/gratuity/', '/no-such-page/']) {
    await page.goto(path)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('body a[href^="/hi"]'), path).toHaveCount(0)
  }
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
  await openPlan(page)
  const notice = page.getByText(/isn’t keeping your answers/)
  await expect(notice).toBeHidden()
  await page.locator('main input[type="number"]').fill('45')
  await page.locator('main input[type="date"]').fill('2023-04-10')
  await page.getByRole('button', { name: /^I work five days a week/ }).click()
  await expect(notice).toBeVisible()
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(notice).toBeHidden()
})

test('tracker: keyboard focus follows the form and the card, and each change is announced', async ({ page }) => {
  await open(page, '/tracker/')
  await page.getByRole('button', { name: '+ Add application' }).click()
  await expect(page.getByRole('textbox', { name: 'Company', exact: true })).toBeFocused()
  await page.getByRole('textbox', { name: 'Company', exact: true }).fill('Acme')
  await page.getByRole('textbox', { name: 'Role', exact: true }).fill('Analyst')
  await page.getByRole('button', { name: 'Add application', exact: true }).click()
  await expect(page.getByRole('button', { name: '+ Add application' })).toBeFocused()
  await expect(page.getByRole('status').filter({ hasText: /^Added Acme to / })).toHaveCount(1)

  await page.getByRole('button', { name: 'Move to next stage' }).click()
  await expect(page.getByRole('button', { name: 'Move to next stage' })).toBeFocused()
  await expect(page.getByRole('status').filter({ hasText: /^Moved Acme to / })).toHaveCount(1)
})

test('backup dialog holds focus and gives it back on Escape', async ({ page }) => {
  await open(page, '/')
  const opener = page.getByRole('button', { name: 'Back up or restore' })
  await opener.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.locator(':focus')).toHaveCount(1)
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab')
    await expect(dialog.locator(':focus')).toHaveCount(1)
  }
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(opener).toBeFocused()
})

test('gratuity and F&F: five days a week until the person picks, and the screen says so', async ({ page }) => {
  await open(page, '/gratuity/')
  const week = page.getByRole('switch', { name: /^5-day work week/ })
  await expect(week).toHaveAttribute('aria-checked', 'true')
  await expect(page.getByText('We assume a five-day week. Switch this if you work six days.')).toBeVisible()
  await week.click()
  await expect(week).toHaveAttribute('aria-checked', 'false')
  await expect(page.getByText('We assume a five-day week.', { exact: false })).toHaveCount(0)

  // The pick is shared: the F&F checker now reads six days and stops assuming.
  await open(page, '/fnf-checker/')
  await expect(page.getByRole('switch', { name: /^5-day work week/ })).toHaveAttribute('aria-checked', 'false')
  await expect(page.getByText('We assume a five-day week.', { exact: false })).toHaveCount(0)
})

test('F&F checker in Hindi says the five-day week is assumed', async ({ page }) => {
  await open(page, '/hi/fnf-checker/')
  await expect(page.getByRole('switch', { name: /^5-day work week/ })).toHaveAttribute('aria-checked', 'true')
  await expect(page.getByText('हम 5-day week मानकर चल रहे हैं।', { exact: false })).toBeVisible()
})

test('tool pages on a phone: Next comes after the form, on screen and in reading order (R-07)', async ({ page }) => {
  for (const path of ['/gratuity/', '/decoder/', '/offer-comparison/']) {
    await open(page, path)
    const order = await page.evaluate(() => {
      const next = document.querySelector('a[data-next-step]')!
      const field = document.querySelector('[data-tool] input:not([type="hidden"]), [data-tool] select')!
      return {
        domAfter: Boolean(field.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING),
        below: next.getBoundingClientRect().top > field.getBoundingClientRect().top,
      }
    })
    expect(order, path).toEqual({ domAfter: true, below: true })
  }
})
