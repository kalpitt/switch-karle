// Cold-read screenshots. Usage: node shoot.cjs <base-url> <out-dir>
// CommonJS on purpose: require('playwright') resolves the pre-installed copy from any folder.
// Phone 390x844. Pages that do not exist yet are skipped with a note.
const { chromium } = require('playwright')
const { mkdirSync } = require('node:fs')

main().catch((e) => { console.error(e); process.exit(1) })

async function main() {

const [base = 'http://localhost:4321', out = './coldread'] = process.argv.slice(2)
const root = base.replace(/\/$/, '')
for (const d of ['home', 'home-hi', 'plan']) mkdirSync(`${out}/${d}`, { recursive: true })

const wordsOnScreen = () => {
  // Words a person can see on the first screen, site header included.
  // Skips <option> lists, screen-reader-only text and anything hidden.
  const vh = innerHeight
  let n = 0
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  while (w.nextNode()) {
    const el = w.currentNode.parentElement
    const text = w.currentNode.textContent.trim()
    if (!text || !el || el.closest('option') || el.closest('.sr-only')) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0 || r.top >= vh || r.bottom <= 0 || r.left >= innerWidth || r.right <= 0) continue
    n += text.split(/\s+/).length
  }
  return n
}

const browser = await chromium.launch()
async function page() {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'en-IN',
  })
  return ctx.newPage()
}
async function open(p, path) {
  const res = await p.goto(root + path, { waitUntil: 'networkidle' })
  await p.waitForTimeout(600)
  return res && res.status() < 400
}
async function scrollShots(p, dir, max = 4) {
  const total = await p.evaluate(() => document.documentElement.scrollHeight)
  const n = Math.min(max, Math.ceil(total / 844))
  for (let i = 0; i < n; i++) {
    await p.evaluate((y) => scrollTo(0, y), i * 844)
    await p.waitForTimeout(200)
    await p.screenshot({ path: `${dir}/${String(i + 1).padStart(2, '0')}.png` })
  }
}

// Flow A: home, English and Hindi.
for (const [path, dir] of [['/', 'home'], ['/hi/', 'home-hi']]) {
  const p = await page()
  if (await open(p, path)) {
    console.log(`${path} first-screen words: ${await p.evaluate(wordsOnScreen)}`)
    console.log(`${path} step cards fully visible on the first screen: ${await p.evaluate(() => [...document.querySelectorAll('a[href*="/start/"]')].filter((a) => { const r = a.getBoundingClientRect(); return r.height > 0 && r.top >= 0 && r.bottom <= innerHeight }).length)} (must be 5)`)
    await scrollShots(p, `${out}/${dir}`)
  } else console.log(`SKIPPED ${path}`)
  await p.context().close()
}

// Flow B: the plan. Uses /resign-date/ when it exists, else the home page (the old door).
{
  const p = await page()
  const path = (await open(p, '/resign-date/')) ? '/resign-date/' : '/'
  if (path === '/') await open(p, '/')
  console.log(`plan flow shot from ${path}`)
  await p.screenshot({ path: `${out}/plan/01-before.png` })
  await p.evaluate(() => scrollTo(0, 844)); await p.waitForTimeout(200)
  await p.screenshot({ path: `${out}/plan/02-before-scrolled.png` })
  // Fill the three answers if the fields are empty, then press the one dark button.
  const date = p.locator('input[type=date]').first()
  if ((await date.count()) && !(await date.inputValue())) await date.fill('2022-01-12')
  const num = p.locator('input[type=number], input[inputmode=numeric]').first()
  if ((await num.count()) && !(await num.inputValue())) await num.fill('90')
  const btn = p.getByRole('button', { name: /see my options|see my dates|pick my resign date/i })
  if (await btn.count()) {
    await btn.first().click(); await p.waitForTimeout(1000)
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(200)
    await p.screenshot({ path: `${out}/plan/03-after.png` })
    await p.evaluate(() => scrollTo(0, 844)); await p.waitForTimeout(200)
    await p.screenshot({ path: `${out}/plan/04-after-scrolled.png` })
  } else console.log('plan flow: could not find the button; update shoot.cjs to match its new name')
  await p.context().close()
}

// Flow C: the five step pages, first screen only.
for (const id of ['leaving', 'applying', 'offer', 'notice', 'joining']) {
  const p = await page()
  if (await open(p, `/start/${id}/`)) {
    mkdirSync(`${out}/step-${id}`, { recursive: true })
    console.log(`/start/${id}/ first-screen words: ${await p.evaluate(wordsOnScreen)}`)
    await p.screenshot({ path: `${out}/step-${id}/01.png` })
  } else console.log(`SKIPPED /start/${id}/`)
  await p.context().close()
}
await browser.close()
}
