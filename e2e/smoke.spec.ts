/// <reference lib="dom" />
// Every page in the sitemap, in both languages: it loads, hydrates without a
// page error or a console error (CSP violations are console errors), names
// itself with an <h1>, and does not scroll sideways on a phone.
import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

const sitemap = readFileSync(new URL('../dist/sitemap.xml', import.meta.url), 'utf8')
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname)

test('the sitemap lists both languages', () => {
  expect(routes).toContain('/')
  expect(routes).toContain('/hi/')
  expect(routes.length).toBeGreaterThan(20)
})

for (const route of routes) {
  test(`renders ${route}`, async ({ page }) => {
    const problems: string[] = []
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
    page.on('console', (m) => {
      if (m.type() === 'error') problems.push(`console.error: ${m.text()}`)
    })

    const response = await page.goto(route)
    expect(response?.status(), 'HTTP status').toBe(200)
    // Hydrated: Astro drops the `ssr` attribute once an island is live.
    await expect(page.locator('astro-island[ssr]')).toHaveCount(0)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).not.toBeEmpty()

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow, 'horizontal scroll in px').toBeLessThanOrEqual(1)
    expect(problems).toEqual([])
  })
}
