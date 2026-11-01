/// <reference lib="dom" />
// The pages about the site, in both languages: each renders its own heading in
// its own language, and every page's footer links to all four. A statutory
// tool shows its receipt and the privacy line above its first money field.
import { expect, test } from '@playwright/test'

const PAGES = [
  { slug: 'about', en: 'About Switch Karle', hi: 'Switch Karle के बारे में', text: 'Kalpit Tiwari' },
  { slug: 'sources', en: 'How we check numbers', hi: 'हम numbers कैसे check करते हैं', text: 's.156' },
  { slug: 'privacy', en: 'Privacy', hi: 'Privacy', text: 'switchkarle' },
  { slug: 'terms', en: 'Terms', hi: 'शर्तें', text: 'MIT licence' },
]

for (const p of PAGES) {
  for (const lang of ['en', 'hi'] as const) {
    const path = lang === 'hi' ? `/hi/${p.slug}/` : `/${p.slug}/`
    test(`${path} renders in ${lang === 'hi' ? 'Hindi' : 'English'}`, async ({ page }) => {
      const res = await page.goto(path)
      expect(res?.status()).toBe(200)
      await expect(page.locator('html')).toHaveAttribute('lang', lang)
      await expect(page.locator('h1')).toHaveText(lang === 'hi' ? p.hi : p.en)
      await expect(page.locator(`[data-info="${p.slug}"]`)).toContainText(p.text)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${path}$`))
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/)
      // The language switch leads to this page's twin, not home.
      const other = lang === 'hi' ? `/${p.slug}/` : `/hi/${p.slug}/`
      await expect(page.locator(`header a[hreflang="${lang === 'hi' ? 'en' : 'hi'}"]`)).toHaveAttribute('href', other)
    })
  }
}

test('every footer links to the four pages and the source code', async ({ page }) => {
  await page.goto('/gratuity/')
  const footer = page.locator('footer').last()
  for (const slug of ['about', 'sources', 'privacy', 'terms']) {
    await expect(footer.locator(`a[href="/${slug}/"]`).first()).toBeVisible()
  }
  await expect(footer.locator('a[href="https://github.com/kalpitt/switch-karle"]')).toBeVisible()
  await expect(footer.locator('a[href="/sources/"]').first()).toContainText('Sources checked')
})

test('a statutory verdict carries its receipt, and the form says what happens to what you type', async ({ page }) => {
  await page.goto('/hi/gratuity/')
  const receipt = page.locator('[data-receipt]')
  await expect(receipt).toContainText('Code on Social Security, 2020')
  await expect(receipt).toContainText('lawyer')
  await expect(receipt.locator('a[href="/hi/sources/"]')).toBeVisible()
  await expect(page.locator('[data-privacy-line]')).toContainText('browser में save')
  await page.locator('[data-privacy-line] button').click()
  await expect(page.getByRole('dialog')).toBeVisible()
})
