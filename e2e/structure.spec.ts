/// <reference lib="dom" />
// Batch 6 structure: the two-place nav, the all-tools page, and the one What to
// say page. Since 2026-11-07 the situations have no addresses of their own: a
// link picks one in the page through the hash, in English and in Hindi.
import { expect, test, type Page } from '@playwright/test'

async function open(page: Page, path: string) {
  await page.goto(path)
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0)
}

const nav = (page: Page) => page.getByRole('navigation', { name: 'Main' })

test('the nav has home and all tools, and marks the page you are on', async ({ page }) => {
  await open(page, '/')
  await expect(nav(page).getByRole('link')).toHaveText(['Home', 'All tools'])
  await expect(nav(page).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
  await nav(page).getByRole('link', { name: 'All tools' }).click()
  await expect(page).toHaveURL(/^http:\/\/[^/]+\/tools\/$/)
  await expect(nav(page).getByRole('link', { name: 'All tools' })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('button', { name: 'Search tools' })).toBeVisible()
})

test('the nav speaks Hindi on Hindi pages', async ({ page }) => {
  await open(page, '/hi/gratuity/')
  await expect(page.getByRole('navigation', { name: 'मुख्य' }).getByRole('link')).toHaveText(['होम', 'सारे tools'])
  await page.getByRole('navigation', { name: 'मुख्य' }).getByRole('link', { name: 'सारे tools' }).click()
  await expect(page).toHaveURL(/^http:\/\/[^/]+\/hi\/tools\/$/)
})

test('the nav fits a 320px phone without sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  for (const path of ['/', '/hi/', '/hi/what-to-say/']) {
    await open(page, path)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow, path).toBeLessThanOrEqual(1)
    for (const link of await nav(page).or(page.getByRole('navigation', { name: 'मुख्य' })).getByRole('link').all()) {
      expect((await link.boundingBox())!.height, path).toBeGreaterThanOrEqual(44)
    }
  }
})

test('/tools/ lists the five steps, each lead first, and What to say once per step it has a situation in', async ({ page }) => {
  await open(page, '/tools/')
  await expect(page.locator('h1')).toHaveText('All tools, by step')
  await expect(page.locator('main h2')).toHaveText(['Thinking of leaving', 'Applying or interviewing', 'I have an offer', 'Notice period and exit', 'Joining a new job'])
  await expect(page.locator('main')).not.toContainText('Stage 1')
  for (const id of ['leaving', 'applying', 'offer', 'notice', 'joining']) {
    await expect(page.locator(`section:has(h2#${id}) li`).first().locator('a')).toContainText('Start here')
  }
  await expect(page.locator('section:has(h2#leaving) a[data-entry="resign-date"]')).toHaveAttribute('href', '/resign-date/')
  const wts = page.locator('a[data-entry="what-to-say"]')
  await expect(wts).toHaveCount(3)
  await expect(wts.nth(0)).toHaveAttribute('href', '/what-to-say/#expected-ctc')
  await expect(wts.nth(0)).toContainText('What to say to recruiters and interviewers')
  await expect(wts.nth(1)).toHaveAttribute('href', '/what-to-say/#decline-accepted')
  await expect(wts.nth(1)).toContainText('What to say about an offer')
  await expect(wts.nth(2)).toHaveAttribute('href', '/what-to-say/#manager-script')
  await expect(wts.nth(2)).toContainText('What to say when you resign and leave')
  // The plain names (COPY-05), linking to the unchanged addresses.
  await expect(page.locator('a[data-entry="decoder"]')).toContainText('In-hand salary calculator')
  await expect(page.locator('a[data-entry="decoder"]')).toHaveAttribute('href', '/decoder/')
  await expect(page.locator('a[data-entry="tracker"]')).toHaveAttribute('href', '/tracker/')
  await expect(page.locator('a[data-entry="prompts"]')).toHaveAttribute('href', '/prompts/')
})

test('/tools/ jump links reach each step and fit a 320px phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await open(page, '/tools/')
  const jump = page.getByRole('navigation', { name: 'Jump to a step' })
  await expect(jump.getByRole('link')).toHaveText(['Leaving', 'Applying', 'Offer', 'Notice', 'Joining'])
  for (const link of await jump.getByRole('link').all()) {
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBe(0)
  await jump.getByRole('link', { name: 'Joining' }).click()
  await expect(page).toHaveURL(/#joining$/)
  // The bar stays on screen and the heading is not hidden under it.
  await expect(jump).toBeInViewport()
  const bar = (await jump.boundingBox())!
  const heading = (await page.locator('h2#joining').boundingBox())!
  expect(heading.y).toBeGreaterThanOrEqual(bar.y + bar.height - 1)
})

test('/hi/tools/ is the Hindi list, linking to Hindi pages', async ({ page }) => {
  await open(page, '/hi/tools/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi')
  await expect(page.locator('a[data-entry="decoder"]')).toHaveAttribute('href', '/hi/decoder/')
  await expect(page.locator('a[data-entry="what-to-say"]').first()).toHaveAttribute('href', '/hi/what-to-say/#expected-ctc')
})

test('the home page links to the full list instead of keeping its own, and the list links back', async ({ page }) => {
  await open(page, '/')
  await expect(page.locator('a[data-all-tools]')).toHaveAttribute('href', '/tools/')
  await open(page, '/tools/')
  await expect(page.locator('a[data-pick-step]')).toHaveText('Not sure where to start? Pick your step')
  await expect(page.locator('a[data-pick-step]')).toHaveAttribute('href', '/')
})

test('search still finds a tool by its old name', async ({ page }) => {
  await open(page, '/')
  await page.getByRole('button', { name: 'Search tools' }).click()
  await page.getByRole('combobox', { name: 'Search tools' }).fill('decoder')
  await expect(page.getByRole('option').first()).toContainText('In-hand salary calculator')
  await page.getByRole('combobox', { name: 'Search tools' }).fill('scripts')
  await expect(page.getByRole('option').first()).toContainText('What to say')
})

test('What to say opens on the picker; picking swaps the situation in place and names it in the hash', async ({ page }) => {
  await open(page, '/what-to-say/')
  await expect(page.locator('h1')).toHaveText('What to say')
  await expect(page.locator('main h2')).toHaveCount(0)
  await expect(page.locator('a[data-next-step]')).toHaveCount(0)

  await page.getByRole('link', { name: /^Expected CTC reply/ }).click()
  await expect(page).toHaveURL(/^http:\/\/[^/]+\/what-to-say\/#expected-ctc$/)
  await expect(page.locator('main h2')).toHaveText('Expected CTC reply')
  await expect(page.getByRole('heading', { name: 'Expected CTC reply' })).toBeFocused()
  await expect(page).toHaveTitle('Expected CTC reply — Switch Karle')
  await expect(page.getByLabel('Role', { exact: true })).toBeVisible()
  await expect(page.locator('a[data-next-step="recruiter-followup"]')).toHaveAttribute('href', '/what-to-say/#recruiter-followup')

  // A Next link to another situation stays on this page and picks it.
  await page.locator('a[data-next-step="recruiter-followup"]').click()
  await expect(page).toHaveURL(/^http:\/\/[^/]+\/what-to-say\/#recruiter-followup$/)
  await expect(page.locator('main h2')).toHaveText('Recruiter follow-up email')
  await expect(page.getByRole('heading', { name: 'Recruiter follow-up email' })).toBeFocused()

  await page.getByRole('link', { name: 'Resignation talk script' }).click()
  await expect(page).toHaveURL(/^http:\/\/[^/]+\/what-to-say\/#manager-script$/)
  await expect(page.getByRole('link', { name: 'Resignation talk script' })).toHaveAttribute('aria-current', 'page')
  await expect(page.locator('main h2')).toHaveText('Resignation talk script')
  await expect(page.locator('a[data-next-step="counter-offer"]')).toBeVisible()

  await page.goBack()
  await expect(page).toHaveURL(/^http:\/\/[^/]+\/what-to-say\/#recruiter-followup$/)
  await expect(page.locator('main h2')).toHaveText('Recruiter follow-up email')
  await page.goBack()
  await page.goBack()
  await expect(page).toHaveURL(/^http:\/\/[^/]+\/what-to-say\/$/)
  await expect(page.locator('main h2')).toHaveCount(0)
})

test('a situation in the address opens What to say with it picked, and the language switch keeps it', async ({ page }) => {
  await open(page, '/what-to-say/#buyout-ask')
  await expect(page.locator('h1')).toHaveText('What to say')
  await expect(page.getByRole('link', { name: 'Notice buyout email' })).toHaveAttribute('aria-current', 'page')
  await expect(page.locator('main h2')).toHaveText('Notice buyout email')
  await expect(page.getByRole('button', { name: /copy/i }).first()).toBeVisible()
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://switchkarle.fyi/what-to-say/')

  // Hindi is hidden (HINDI_ON, 2026-11-19), so the switch is tested from the Hindi side.
  await open(page, '/hi/what-to-say/#buyout-ask')
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi')
  await expect(page.locator('main h2')).toHaveText('Notice buyout का email')
  await page.getByRole('link', { name: 'English' }).click()
  await expect(page).toHaveURL(/^http:\/\/[^/]+\/what-to-say\/#buyout-ask$/)
  await expect(page.locator('main h2')).toHaveText('Notice buyout email')
})

test('in Hindi, क्या कहें opens on the situation the address names', async ({ page }) => {
  await open(page, '/hi/what-to-say/#decline-accepted')
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi')
  await expect(page.locator('h1')).toHaveText('क्या कहें')
  await expect(page.getByRole('link', { name: 'हाँ के बाद मना करने का email' })).toHaveAttribute('aria-current', 'page')
  await expect(page.locator('main h2')).toHaveText('हाँ के बाद मना करने का email')
  await expect(page).toHaveTitle('हाँ के बाद मना करने का email — Switch Karle')
  // Backed out of an accepted offer: Next goes back to the plan.
  await expect(page.locator('a[data-next-step="plan"]')).toHaveAttribute('href', '/hi/resign-date/')
})

test('the situations have no pages of their own any more', async ({ page }) => {
  for (const path of ['/expected-ctc/', '/buyout-ask/', '/hi/manager-script/', '/hi/decline-accepted/']) {
    const res = await page.goto(path)
    expect(res?.status(), path).toBe(404)
  }
})

test('on a phone the answer is first in reading order and has a heading', async ({ page }) => {
  await open(page, '/gratuity/')
  await expect(page.getByRole('heading', { level: 2, name: 'Your result' })).toHaveCount(1)
  // The result heading comes before the form heading in the page, as it does on screen.
  const order = await page.locator('main h2').allTextContents()
  expect(order.indexOf('Your result')).toBeGreaterThanOrEqual(0)
  expect(order.indexOf('Your result')).toBeLessThan(order.indexOf('Your service and pay'))
  await open(page, '/hi/gratuity/')
  await expect(page.getByRole('heading', { level: 2, name: 'आपका नतीजा' })).toHaveCount(1)
})

// The step pages (rebuild, 2026-11-16): one tool to start with, as the only dark
// button, then at most four more, then the way to every tool for this step.
test('a step page leads with one tool and lists the rest', async ({ page }) => {
  await open(page, '/start/offer/')
  await expect(page.locator('h1')).toHaveText('I have an offer')
  await expect(page.getByRole('link', { name: 'Start' })).toHaveAttribute('href', '/decoder/')
  const rows = page.locator('main li a[data-entry]')
  await expect(rows).toHaveCount(4)
  await expect(rows.first()).toHaveAttribute('href', '/real-hike/')
  await expect(rows.first()).toContainText('Offer against your current pay:')
  await expect(page.getByRole('link', { name: 'All tools for this step' })).toHaveAttribute('href', '/tools/#offer')
  await expect(page.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/')
})

test('a step page links a What to say script straight to that script', async ({ page }) => {
  await open(page, '/start/applying/')
  await expect(page.locator('main a[data-entry="expected-ctc"]')).toHaveAttribute('href', '/what-to-say/#expected-ctc')
  await expect(page.locator('main a[data-entry="expected-ctc"]')).toContainText('Asked for your expected CTC:')
  await open(page, '/start/leaving/')
  await expect(page.getByRole('link', { name: 'Start' })).toHaveAttribute('href', '/resign-date/')
  await open(page, '/start/notice/')
  await expect(page.getByRole('link', { name: 'Already resigned or on notice? Go to the notice period checklist.' })).toHaveAttribute(
    'href',
    '/notice-tracker/',
  )
  await expect(page.getByRole('link', { name: 'Laid off or asked to leave? Check what you are owed' })).toHaveAttribute(
    'href',
    '/fnf-checker/',
  )
  // Both ways in come before the card for someone who has not resigned yet.
  const detour = (await page.locator('[data-door-detour]').boundingBox())!
  const card = (await page.locator('[data-door-lead]').boundingBox())!
  expect(detour.y).toBeLessThan(card.y)
})

test('the plan has its own page', async ({ page }) => {
  await open(page, '/resign-date/')
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('[data-tool="resign-date"] input').first()).toBeVisible()
})

// The frame around every tool (rebuild 4.7).
test('a tool names the step it belongs to, one tap from the rest', async ({ page }) => {
  await open(page, '/decoder/')
  const more = page.locator('[data-more-for]')
  await expect(more).toContainText('More for:')
  await expect(more.getByRole('link', { name: 'I have an offer' })).toHaveAttribute('href', '/start/offer/')
  // In two steps' lists: both are named.
  await open(page, '/real-hike/')
  await expect(page.locator('[data-more-for] a')).toHaveText(['Applying or interviewing', 'I have an offer'])
  await open(page, '/resign-date/')
  await expect(page.locator('[data-more-for] a')).toHaveText(['Thinking of leaving'])
  await open(page, '/tools/')
  await expect(page.locator('[data-more-for]')).toHaveCount(0)
})

test('the worked example is a bar across the top of the answer', async ({ page }) => {
  await open(page, '/decoder/')
  const bar = page.locator('[data-result-hero] [data-example-bar]')
  await expect(bar).toBeVisible()
  await expect(bar).toContainText('Example')
  const hero = (await page.locator('[data-result-hero]').boundingBox())!
  const box = (await bar.boundingBox())!
  expect(Math.round(box.width)).toBe(Math.round(hero.width - 2))
})

test('the buyout calculator and the buyout email point at each other', async ({ page }) => {
  await open(page, '/notice-buyout/')
  await expect(page.locator('[data-see-also="buyout-ask"] a')).toHaveAttribute('href', '/what-to-say/#buyout-ask')
  await open(page, '/what-to-say/#buyout-ask')
  await expect(page.locator('[data-see-also="notice-buyout"] a')).toHaveAttribute('href', '/notice-buyout/')
})
