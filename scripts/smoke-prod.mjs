// Production smoke test: opens the live site the way a visitor would and fails
// loudly if anything is broken. Run by .github/workflows/pages.yml after every
// deploy and by .github/workflows/smoke.yml once a day; a failed run makes
// GitHub email the owner.
//
//   node scripts/smoke-prod.mjs [origin]      (default https://switchkarle.fyi)
//
// It sends ordinary page requests from a fresh browser and nothing else: no
// user data exists in that browser, and nothing is posted anywhere.
import { chromium } from '@playwright/test'

const origin = (process.argv[2] || 'https://switchkarle.fyi').replace(/\/$/, '')
const failures = []
const fail = (msg) => {
  failures.push(msg)
  console.log(`  FAIL ${msg}`)
}

const browser = await chromium.launch()

// 1. The plain files a crawler or a browser asks for.
{
  const ctx = await browser.newContext()
  for (const [path, want] of [['/robots.txt', 200], ['/sitemap.xml', 200], ['/manifest.webmanifest', 200], ['/no-such-page/', 404]]) {
    const res = await ctx.request.get(origin + path, { maxRedirects: 0 })
    if (res.status() !== want) fail(`${path} returned ${res.status()}, expected ${want}`)
  }
  await ctx.close()
}

// 2. Every page in the live sitemap: 200, no page error, no console error
//    (a CSP violation is a console error), and an <h1>.
const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text()
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
if (pages.length < 20) fail(`sitemap lists only ${pages.length} pages`)
{
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } })
  const queue = [...pages]
  const worker = async () => {
    const page = await ctx.newPage()
    const problems = []
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
    page.on('console', (m) => m.type() === 'error' && problems.push(`console.error: ${m.text().slice(0, 160)}`))
    for (let path = queue.shift(); path; path = queue.shift()) {
      problems.length = 0
      try {
        const res = await page.goto(origin + path, { waitUntil: 'load', timeout: 30_000 })
        if (res?.status() !== 200) problems.push(`HTTP ${res?.status()}`)
        await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'), null, { timeout: 15_000 })
        const h1 = (await page.locator('h1').first().textContent({ timeout: 5_000 }))?.trim()
        if (!h1) problems.push('no <h1>')
      } catch (e) {
        problems.push(String(e.message).split('\n')[0])
      }
      if (problems.length) fail(`${path}: ${problems.join(' | ')}`)
    }
    await page.close()
  }
  await Promise.all([worker(), worker(), worker(), worker()])
  await ctx.close()
}

// 3. The two journeys that would embarrass us most.
{
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  try {
    // Home: the three questions produce dates.
    await page.goto(`${origin}/`)
    await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'))
    await page.locator('main input[type="date"]').fill('2023-04-10')
    await page.locator('main input[type="number"]').fill('60')
    await page.locator('main button', { hasText: 'See my dates' }).click()
    await page.locator('main button').first().waitFor({ timeout: 5_000 })
  } catch (e) {
    fail(`home flow: ${String(e.message).split('\n')[0]}`)
  }
  try {
    // Decoder: a rupee figure, and a bar that is not drawn 100% full.
    await page.goto(`${origin}/decoder/`)
    await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'))
    const { rupee, ratio } = await page.evaluate(() => {
      const rect = document.querySelector('main svg rect')
      const svg = rect?.closest('svg')
      return {
        rupee: /₹\s?[\d,]+/.test(document.querySelector('main')?.textContent ?? ''),
        ratio: rect && svg ? rect.getBoundingClientRect().width / svg.getBoundingClientRect().width : null,
      }
    })
    if (!rupee) fail('decoder shows no ₹ figure')
    if (ratio == null || ratio <= 0 || ratio >= 0.99) fail(`decoder bar is ${ratio == null ? 'missing' : `${Math.round(ratio * 100)}% full`}`)
  } catch (e) {
    fail(`decoder: ${String(e.message).split('\n')[0]}`)
  }
  await ctx.close()
}

// 4. The offline app: the service worker installs and activates, and a page
//    never opened before still loads with the network off.
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  try {
    await page.goto(`${origin}/`)
    const state = await page.evaluate(async () => {
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((resolve) => setTimeout(() => resolve(null), 45_000)),
      ])
      const sw = reg?.active
      if (!sw) return 'none'
      if (sw.state === 'activating') {
        await new Promise((resolve) => {
          sw.addEventListener('statechange', resolve)
          setTimeout(resolve, 30_000)
        })
      }
      return sw.state
    })
    if (state !== 'activated') {
      fail(`service worker state is "${state}", expected "activated"`)
    } else {
      await ctx.setOffline(true)
      await page.goto(`${origin}/gratuity/`, { timeout: 15_000 })
      const h1 = (await page.locator('h1').first().textContent({ timeout: 5_000 }))?.trim()
      if (!h1) fail('offline: /gratuity/ rendered no <h1>')
    }
  } catch (e) {
    fail(`offline: ${String(e.message).split('\n')[0]}`)
  }
  await ctx.close()
}

await browser.close()
if (failures.length) {
  console.log(`\nsmoke: ${failures.length} problem(s) on ${origin}`)
  process.exit(1)
}
console.log(`smoke: OK — ${pages.length} pages, home and decoder flows, offline app, on ${origin}`)
