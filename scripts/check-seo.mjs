#!/usr/bin/env node
/**
 * Head-contract + no-analytics gate. Run after `npm run build`.
 *
 * Every prerendered HTML route must have canonical + OG + twitter card.
 * dist/ must not contain analytics snippets. sitemap.xml must list every
 * registry slug. Generated ≠ submitted — this script does not talk to Google.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BASE, SITE } from '../site.config.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const toolsSrc = resolve(root, 'src/data/tools.ts')

// \bga\(...) is deliberately narrowed to known Universal Analytics command
// literals (ga('create', ...), ga('send', ...), etc.) rather than any call to
// a two-letter `ga` — that bare pattern matched React's own minified
// transition-event helper (`function ga(l){...}`) in the real build output,
// which is not analytics. See scripts/check-seo.test.ts for the cases this
// still has to catch.
const UA_COMMANDS = 'create|send|set|require|remove|provide|rename|get|ready'
export const ANALYTICS = new RegExp(
  String.raw`googletagmanager|google-analytics|gtag\s*(?:\?\.)?\s*\(|\bga\s*(?:\?\.)?\s*\(\s*['"](?:${UA_COMMANDS})['"]|\bplausible\b|\bumami\b|\bfathom\b|clarity\.ms|\bclarity\s*(?:\?\.)?\s*\(`,
  'i',
)

export const HEAD_REQUIREMENTS = [
  ['canonical', /<link\s+rel="canonical"\s+href="https?:\/\//],
  ['og:title', /<meta\s+property="og:title"\s+content="[^"]+/],
  ['og:description', /<meta\s+property="og:description"\s+content="[^"]+/],
  ['og:url', /<meta\s+property="og:url"\s+content="https?:\/\//],
  ['og:image', /<meta\s+property="og:image"\s+content="https?:\/\//],
  ['twitter:card', /<meta\s+name="twitter:card"\s+content="summary_large_image"/],
  ['hreflang-hi', /<link[^>]+hreflang="hi"/],
  ['hreflang-en', /<link[^>]+hreflang="en"/],
]

export function checkAnalytics(text, rel = 'file') {
  const errors = []
  if (ANALYTICS.test(text)) {
    errors.push(`check-seo: FAIL — analytics snippet in ${rel}`)
  }
  return { ok: errors.length === 0, errors }
}

export function checkHtmlHead(html, rel = 'page.html', titles = new Map()) {
  const errors = []
  for (const [name, re] of HEAD_REQUIREMENTS) {
    if (!re.test(html)) {
      errors.push(`check-seo: FAIL — ${rel} missing ${name}`)
    }
  }
  const rawTitle = html.match(/<title>([^<]*)<\/title>/)?.[1]
  const normalizedTitle = rawTitle ? rawTitle.trim().replace(/\s+/g, ' ').toLowerCase() : ''
  if (!rawTitle || !normalizedTitle) {
    errors.push(`check-seo: FAIL — ${rel} missing <title>`)
  } else if (titles.has(normalizedTitle)) {
    errors.push(`check-seo: FAIL — duplicate title "${rawTitle}" on ${rel} and ${titles.get(normalizedTitle)}`)
  } else {
    titles.set(normalizedTitle, rel)
  }
  return { ok: errors.length === 0, errors }
}

export function checkSitemap(sitemap, slugs, base = BASE, site = SITE) {
  const errors = []
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
  const origin = `${site}${cleanBase}`
  if (!sitemap.includes(`<loc>${origin}/</loc>`)) {
    errors.push(`check-seo: FAIL — sitemap missing home ${origin}/`)
  }
  if (!sitemap.includes(`<loc>${origin}/hi/</loc>`)) {
    errors.push(`check-seo: FAIL — sitemap missing Hindi home ${origin}/hi/`)
  }
  for (const slug of slugs) {
    const loc = `${origin}/${slug}/`
    if (!sitemap.includes(`<loc>${loc}</loc>`)) {
      errors.push(`check-seo: FAIL — sitemap missing ${loc}`)
    }
    const hiLoc = `${origin}/hi/${slug}/`
    if (!sitemap.includes(`<loc>${hiLoc}</loc>`)) {
      errors.push(`check-seo: FAIL — sitemap missing ${hiLoc}`)
    }
  }
  if (/sitemapindex/i.test(sitemap)) {
    errors.push('check-seo: FAIL — sitemap-index is not allowed')
  }
  return { ok: errors.length === 0, errors }
}

export function checkRobots(robots) {
  const errors = []
  // Anchored to the start of a line on purpose: `Disallow: /` contains the
  // substring `allow: /`, so an unanchored test passed a robots.txt that
  // blocked the entire site — the one thing this check exists to catch.
  if (!/^\s*User-agent:\s*\*/im.test(robots) || !/^\s*Allow:\s*\//im.test(robots)) {
    errors.push('check-seo: FAIL — robots.txt must allow all')
  }
  return { ok: errors.length === 0, errors }
}

export function checkHomeJsonLd(home) {
  const errors = []
  if (!home.includes('application/ld+json') || !home.includes('WebApplication')) {
    errors.push('check-seo: FAIL — home is missing WebApplication JSON-LD')
  }
  return { ok: errors.length === 0, errors }
}

function walk(dir, pred) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(p, pred))
    else if (pred(p)) out.push(p)
  }
  return out
}

export function runSeoCheck(options = {}) {
  const distDir = options.dist || dist
  const toolsPath = options.toolsSrc || toolsSrc
  const base = options.base !== undefined ? options.base : BASE
  const site = options.site !== undefined ? options.site : SITE

  if (!existsSync(distDir)) {
    console.error('check-seo: dist/ not found. Run `npm run build` first.')
    return false
  }

  let failed = false
  const htmlFiles = walk(distDir, (p) => p.endsWith('.html'))
  if (htmlFiles.length === 0) {
    console.error('check-seo: FAIL — no HTML in dist/')
    return false
  }

  const titles = new Map()
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8')
    const rel = relative(distDir, file)
    const { ok, errors } = checkHtmlHead(html, rel, titles)
    if (!ok) {
      for (const err of errors) console.error(err)
      failed = true
    }
  }

  const sniffFiles = walk(distDir, (p) => /\.(html|js|json|xml|txt|webmanifest)$/.test(p))
  for (const file of sniffFiles) {
    const text = readFileSync(file, 'utf8')
    const rel = relative(distDir, file)
    const { ok, errors } = checkAnalytics(text, rel)
    if (!ok) {
      for (const err of errors) console.error(err)
      failed = true
    }
  }

  const sitemapPath = join(distDir, 'sitemap.xml')
  if (!existsSync(sitemapPath)) {
    console.error('check-seo: FAIL — dist/sitemap.xml missing')
    failed = true
  } else {
    const sitemap = readFileSync(sitemapPath, 'utf8')
    const slugs = [...readFileSync(toolsPath, 'utf8').matchAll(/slug:\s*'([a-z0-9-]+)'/g)].map((m) => m[1])
    const { ok, errors } = checkSitemap(sitemap, slugs, base, site)
    if (!ok) {
      for (const err of errors) console.error(err)
      failed = true
    }
  }

  const robotsPath = join(distDir, 'robots.txt')
  if (!existsSync(robotsPath)) {
    console.error('check-seo: FAIL — dist/robots.txt missing')
    failed = true
  } else {
    const robots = readFileSync(robotsPath, 'utf8')
    const { ok, errors } = checkRobots(robots)
    if (!ok) {
      for (const err of errors) console.error(err)
      failed = true
    }
  }

  const homePath = join(distDir, 'index.html')
  if (!existsSync(homePath)) {
    console.error('check-seo: FAIL — dist/index.html missing')
    failed = true
  } else {
    const home = readFileSync(homePath, 'utf8')
    const { ok, errors } = checkHomeJsonLd(home)
    if (!ok) {
      for (const err of errors) console.error(err)
      failed = true
    }
  }

  if (failed) return false
  console.log(`check-seo: OK — ${htmlFiles.length} HTML routes, sitemap + robots, no analytics.`)
  return true
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isMain) {
  if (!runSeoCheck()) {
    process.exit(1)
  }
}
