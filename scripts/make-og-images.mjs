// Renders the two link-preview ("share") images: public/og/default.png
// (English) and public/og/default-hi.png (Hindi), 1200x630, each under 150 KB.
//
// Run it by hand after the tagline changes: `node scripts/make-og-images.mjs`.
// It is not part of the build, so the build never needs a browser.
//
// The text comes from the dictionaries (app.tagline, app.privacyBadge), so the
// card cannot drift from the site's own words. Latin text uses the Inter file
// the site ships. Devanagari needs a Devanagari font installed on the machine
// (Noto Sans Devanagari is the one the Hindi card was made with); pass its path
// as DEVANAGARI_FONT=/path/to/font.woff2 if it is not a system font.
import { readFileSync, statSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from '@playwright/test'
import sharp from 'sharp'

const root = fileURLToPath(new URL('..', import.meta.url))
const MAX_BYTES = 150 * 1024

/** Reads one `'key': '...'` value out of a dictionary source file. */
function dictValue(file, key) {
  const src = readFileSync(`${root}src/i18n/${file}`, 'utf8')
  const re = new RegExp(`'${key.replace('.', '\\.')}':\\s*'((?:[^'\\\\]|\\\\.)*)'`)
  const m = src.match(re)
  if (!m) throw new Error(`${key} not found in ${file}`)
  return m[1].replace(/\\'/g, "'")
}

const cards = {
  en: {
    tagline: dictValue('en.ts', 'app.tagline'),
    // The badge minus its last clause; the card has room for one line.
    badge: dictValue('en.ts', 'app.privacyBadge').split(',')[0],
  },
  hi: {
    tagline: dictValue('hi.ts', 'app.tagline'),
    badge: dictValue('hi.ts', 'app.privacyBadge').split(',')[0],
  },
}

const inter = pathToFileURL(`${root}node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2`).href
const deva = process.env.DEVANAGARI_FONT ? pathToFileURL(process.env.DEVANAGARI_FONT).href : null

function html(lang, { tagline, badge }) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>
  @font-face { font-family: 'Inter'; src: url('${inter}') format('woff2'); font-weight: 100 900; }
  ${deva ? `@font-face { font-family: 'Deva'; src: url('${deva}') format('woff2'); font-weight: 100 900; unicode-range: U+0900-097F, U+200C-200D, U+A8E0-A8FF; }` : ''}
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; }
  body { background: #faf7f2; color: #1c1917; font-family: 'Inter', ${deva ? "'Deva', " : ''}'Noto Sans Devanagari', sans-serif;
         -webkit-font-smoothing: antialiased; position: relative; overflow: hidden; }
  .wrap { position: absolute; inset: 0; padding: 72px 80px 0; }
  .brand { display: flex; align-items: center; gap: 22px; }
  .brand svg { width: 76px; height: 76px; }
  .word { font-size: 50px; font-weight: 800; letter-spacing: -0.02em; }
  .word span { font-weight: 600; color: #57534e; }
  .tag { margin-top: 60px; font-size: ${lang === 'hi' ? 56 : 64}px; line-height: ${lang === 'hi' ? 1.32 : 1.14};
         font-weight: 800; letter-spacing: ${lang === 'hi' ? '0' : '-0.025em'}; max-width: 1040px; text-wrap: balance; }
  .foot { position: absolute; left: 80px; right: 80px; bottom: 64px; display: flex; align-items: center; justify-content: space-between; }
  .badge { display: inline-flex; align-items: center; gap: 12px; background: #eaf5ea; color: #2f7d32;
           border-radius: 999px; padding: 12px 24px; font-size: 26px; font-weight: 700; }
  .badge i { width: 12px; height: 12px; border-radius: 50%; background: #2f7d32; }
  .url { font-size: 28px; font-weight: 700; color: #57534e; }
  .bar { position: absolute; left: 0; right: 0; bottom: 0; height: 14px; background: #e8590c; }
  </style></head><body><div class="wrap">
    <div class="brand">
      <svg viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#e8590c"/>
        <rect x="96" y="196" width="320" height="120" rx="60" fill="#ffffff" fill-opacity="0.28"/>
        <circle cx="336" cy="256" r="76" fill="#ffffff"/></svg>
      <div class="word">Switch <span>Karle</span></div>
    </div>
    <p class="tag">${esc(tagline)}</p>
  </div>
  <div class="foot"><span class="badge"><i></i>${esc(badge)}</span><span class="url">switchkarle.fyi</span></div>
  <div class="bar"></div></body></html>`
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
for (const [lang, card] of Object.entries(cards)) {
  await page.setContent(html(lang, card), { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  const raw = await page.screenshot({ type: 'png' })
  const out = `${root}public/og/${lang === 'hi' ? 'default-hi' : 'default'}.png`
  await sharp(raw).png({ palette: true, colours: 64, compressionLevel: 9, effort: 10 }).toFile(out)
  const size = statSync(out).size
  console.log(`${out.slice(root.length)}  ${size} bytes`)
  if (size > MAX_BYTES) throw new Error(`${lang} card is ${size} bytes, over ${MAX_BYTES}`)
}
await browser.close()
