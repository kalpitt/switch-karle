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

test('the nav has your plan and all tools, and marks the page you are on', async ({ page }) => {
  await open(page, '/')
  await expect(nav(page).getByRole('link')).toHaveText(['Your plan', 'All tools'])
  await expect(nav(page).getByRole('link', { name: 'Your plan' })).toHaveAttribute('aria-current', 'page')
  await nav(page).getByRole('link', { name: 'All tools' }).click()
  await expect(page).toHaveURL(/^http:\/\/[^/]+\/tools\/$/)
  await expect(nav(page).getByRole('link', { name: 'All tools' })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('button', { name: 'Search tools' })).toBeVisible()
})

test('the nav speaks Hindi on Hindi pages', async ({ page }) => {
  await open(page, '/hi/gratuity/')
  await expect(page.getByRole('navigation', { name: 'मुख्य' }).getByRole('link')).toHaveText(['आपका plan', 'सारे tools'])
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

test('/tools/ lists every stage and shows What to say once per stage it has a situation in', async ({ page }) => {
  await open(page, '/tools/')
  await expect(page.locator('h1')).toHaveText('All tools, by stage')
  await expect(page.locator('main h2')).toHaveCount(7)
  await expect(page.locator('main h2').first()).toContainText('I’m done here')
  const wts = page.locator('a[data-entry="what-to-say"]')
  await expect(wts).toHaveCount(3)
  await expect(wts.nth(0)).toHaveAttribute('href', '/what-to-say/#expected-ctc')
  await expect(wts.nth(1)).toHaveAttribute('href', '/what-to-say/#decline-accepted')
  await expect(wts.nth(2)).toHaveAttribute('href', '/what-to-say/#manager-script')
  // The plain names (COPY-05), linking to the unchanged addresses.
  await expect(page.locator('a[data-entry="decoder"]')).toContainText('In-hand salary calculator')
  await expect(page.locator('a[data-entry="decoder"]')).toHaveAttribute('href', '/decoder/')
  await expect(page.locator('a[data-entry="tracker"]')).toHaveAttribute('href', '/tracker/')
  await expect(page.locator('a[data-entry="prompts"]')).toHaveAttribute('href', '/prompts/')
})

test('/hi/tools/ is the Hindi list, linking to Hindi pages', async ({ page }) => {
  await open(page, '/hi/tools/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi')
  await expect(page.locator('a[data-entry="decoder"]')).toHaveAttribute('href', '/hi/decoder/')
  await expect(page.locator('a[data-entry="what-to-say"]').first()).toContainText('क्या कहें')
})

test('the home page links to the full list instead of keeping its own', async ({ page }) => {
  await open(page, '/')
  await expect(page.locator('a[data-all-tools]')).toHaveAttribute('href', '/tools/')
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

  await page.getByRole('link', { name: 'हिन्दी (Hindi)' }).click()
  await expect(page).toHaveURL(/^http:\/\/[^/]+\/hi\/what-to-say\/#buyout-ask$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi')
  await expect(page.locator('main h2')).toHaveText('Notice buyout का email')
})

test('in Hindi, क्या कहें opens on the situation the address names', async ({ page }) => {
  await open(page, '/hi/what-to-say/#decline-accepted')
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi')
  await expect(page.locator('h1')).toHaveText('क्या कहें')
  await expect(page.getByRole('link', { name: 'हाँ के बाद मना करने का email' })).toHaveAttribute('aria-current', 'page')
  await expect(page.locator('main h2')).toHaveText('हाँ के बाद मना करने का email')
  await expect(page).toHaveTitle('हाँ के बाद मना करने का email — Switch Karle')
  // Backed out of an accepted offer: Next goes back to the plan.
  await expect(page.locator('a[data-next-step="plan"]')).toHaveAttribute('href', '/hi/')
})

test('the situations have no pages of their own any more', async ({ page }) => {
  for (const path of ['/expected-ctc/', '/buyout-ask/', '/hi/manager-script/', '/hi/decline-accepted/']) {
    const res = await page.goto(path)
    expect(res?.status(), path).toBe(404)
  }
})
