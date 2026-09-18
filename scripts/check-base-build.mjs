#!/usr/bin/env node
/**
 * Guards the configured-base build.
 *
 * astro.config.mjs sets site + base once. Asset URLs in dist/ must resolve
 * under that base (today `/switch-karle/`) so the GitHub Pages subpath deploy
 * cannot silently 404. Also asserts the three shipped tools prerendered as
 * their own HTML — not the home shell reused as a navigation fallback.
 *
 * Replace this file's BASE constant if astro.config.mjs `base` changes.
 * Cutover to switchkarle.fyi flips base to `/` and this check still holds
 * (root-absolute `/_astro/...` is then correct).
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BASE } from '../site.config.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')

if (!existsSync(dist)) {
  console.error('check-base-build: dist/ not found. Run `npm run build` first.')
  process.exit(1)
}

const basePrefix = BASE.endsWith('/') ? BASE : `${BASE}/`

const required = [
  'index.html',
  'decoder/index.html',
  'tracker/index.html',
  'prompts/index.html',
  'hi/index.html',
  'hi/decoder/index.html',
]
const missing = required.filter((f) => !existsSync(join(dist, f)))
if (missing.length > 0) {
  console.error('check-base-build: FAIL — missing prerendered pages:')
  for (const f of missing) console.error(`  dist/${f}`)
  process.exit(1)
}

function walkHtml(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkHtml(p))
    else if (entry.name.endsWith('.html')) out.push(p)
  }
  return out
}

const htmlFiles = walkHtml(dist)
let failed = false

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8')
  const rel = relative(dist, file)
  const absolute = [...html.matchAll(/\b(?:src|href)="(\/(?!\/)[^"]*)"/g)].map((m) => m[1])
  // Root-absolute paths that are NOT under the configured base break the subpath deploy.
  const offBase = absolute.filter((ref) => !ref.startsWith(basePrefix))
  if (offBase.length > 0) {
    console.error(`check-base-build: FAIL — ${rel} has URLs outside base ${basePrefix}:`)
    for (const ref of offBase) console.error(`  ${ref}`)
    failed = true
  }
}

const decoderHtml = readFileSync(join(dist, 'decoder/index.html'), 'utf8')
const homeHtml = readFileSync(join(dist, 'index.html'), 'utf8')

if (!decoderHtml.includes('data-tool="decoder"')) {
  console.error('check-base-build: FAIL — dist/decoder/index.html is not the decoder island (missing data-tool="decoder").')
  failed = true
}
if (homeHtml.includes('data-tool="decoder"') && !homeHtml.includes('data-tool="home"')) {
  console.error('check-base-build: FAIL — dist/index.html looks like the decoder, not the home grid.')
  failed = true
}
if (!homeHtml.includes('data-tool="home"')) {
  console.error('check-base-build: FAIL — dist/index.html is not the home grid (missing data-tool="home").')
  failed = true
}
if (decoderHtml === homeHtml) {
  console.error('check-base-build: FAIL — decoder HTML is identical to home; SW fallback would lie.')
  failed = true
}

const swPath = join(dist, 'sw.js')
if (!existsSync(swPath)) {
  console.error('check-base-build: FAIL — dist/sw.js missing (Workbox rewrite did not run).')
  failed = true
} else {
  const sw = readFileSync(swPath, 'utf8')
  if (sw.includes('createHandlerBoundToURL')) {
    console.error(
      'check-base-build: FAIL — service worker has a navigateFallback; offline /decoder would render the home shell.',
    )
    failed = true
  }
  for (const page of ['decoder/index.html', 'tracker/index.html', 'prompts/index.html']) {
    if (!sw.includes(page)) {
      console.error(`check-base-build: FAIL — dist/sw.js does not precache ${page}.`)
      failed = true
    }
  }
}

function walkSource(dir) {
  const out = []
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkSource(p))
    else out.push(p)
  }
  return out
}

/** Text extensions worth scanning. Everything else in public/ is binary. */
const SCANNABLE = /\.(?:ts|tsx|astro|mjs|js|json|webmanifest|css|html|txt|xml|svg|md)$/

function stripComments(content, file) {
  if (!/\.(?:ts|tsx|astro|mjs|js)$/.test(file)) return content
  const withoutBlock = content.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\r\n]/g, ' '))
  // Do not treat `//` inside a URL, a string or an escape as a comment: blanking
  // the rest of such a line would hide a hardcoded path sitting after it.
  return withoutBlock.replace(/(^|[^:"'`\\])\/\/[^\r\n]*/g, (m, p1) => p1 + ' '.repeat(m.length - p1.length))
}

const needle = BASE.endsWith('/') && BASE.length > 1 ? BASE.slice(0, -1) : BASE
if (!needle || needle === '/') {
  // At BASE = '/' there is no path segment to search for, so this scan has
  // nothing to do. Say so out loud rather than exiting 0 in silence: a guard
  // that quietly stops guarding is the failure mode this check exists for.
  console.log('check-base-build: source scan inactive — BASE is "/", no path segment to look for.')
} else {
  const sourceFiles = [...walkSource(join(root, 'src')), ...walkSource(join(root, 'public'))]
  const sourceHits = []

  for (const file of sourceFiles) {
    if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) continue
    // Binary assets (icons, the OG image) are not source and decoding them as
    // UTF-8 would be both pointless and a source of phantom matches.
    if (!SCANNABLE.test(file)) continue
    const raw = readFileSync(file, 'utf8')
    const stripped = stripComments(raw, file)
    const lines = stripped.split(/\r?\n/)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.includes(needle)) {
        const rel = relative(root, file)
        // The repository URL is not a site path.
        if (line.includes('github.com/kalpitt/switch-karle')) continue
        // `shareCard.footer` is frozen in hi-freeze.json and no longer read by
        // any component — ShareCard composes the label from SITE + BASE now.
        // The dead value keeps the literal, so exempt it, but only here.
        if (rel.startsWith('src/i18n/') && line.includes('shareCard.footer')) continue
        sourceHits.push(`${rel}:${i + 1}`)
      }
    }
  }

  if (sourceHits.length > 0) {
    console.error(
      `check-base-build: FAIL — hardcoded base path "${needle}" found in source. Use import.meta.env.BASE_URL or import from site.config.mjs instead:`,
    )
    for (const hit of sourceHits) {
      console.error(`  ${hit}`)
    }
    failed = true
  }
}

if (failed) process.exit(1)

console.log(
  `check-base-build: OK — ${htmlFiles.length} HTML files, assets under ${basePrefix}, decoder ≠ home.`,
)
