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

if (!existsSync(dist)) {
  console.error('check-seo: dist/ not found. Run `npm run build` first.')
  process.exit(1)
}

const ANALYTICS = /googletagmanager|google-analytics|gtag\(|\bplausible\b|\bumami\b|\bfathom\b/i
let failed = false

function walk(dir, pred) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(p, pred))
    else if (pred(p)) out.push(p)
  }
  return out
}

const htmlFiles = walk(dist, (p) => p.endsWith('.html'))
if (htmlFiles.length === 0) {
  console.error('check-seo: FAIL — no HTML in dist/')
  process.exit(1)
}

const titles = new Map()

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8')
  const rel = relative(dist, file)
  const need = [
    ['canonical', /<link\s+rel="canonical"\s+href="https?:\/\//],
    ['og:title', /<meta\s+property="og:title"\s+content="[^"]+/],
    ['og:description', /<meta\s+property="og:description"\s+content="[^"]+/],
    ['og:url', /<meta\s+property="og:url"\s+content="https?:\/\//],
    ['og:image', /<meta\s+property="og:image"\s+content="https?:\/\//],
    ['twitter:card', /<meta\s+name="twitter:card"\s+content="summary_large_image"/],
    ['hreflang-hi', /<link[^>]+hreflang="hi"/],
    ['hreflang-en', /<link[^>]+hreflang="en"/],
  ]
  for (const [name, re] of need) {
    if (!re.test(html)) {
      console.error(`check-seo: FAIL — ${rel} missing ${name}`)
      failed = true
    }
  }
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]
  if (!title) {
    console.error(`check-seo: FAIL — ${rel} missing <title>`)
    failed = true
  } else if (titles.has(title)) {
    console.error(`check-seo: FAIL — duplicate title "${title}" on ${rel} and ${titles.get(title)}`)
    failed = true
  } else {
    titles.set(title, rel)
  }
}

const sniffFiles = walk(dist, (p) => /\.(html|js|json|xml|txt|webmanifest)$/.test(p))
for (const file of sniffFiles) {
  const text = readFileSync(file, 'utf8')
  if (ANALYTICS.test(text)) {
    console.error(`check-seo: FAIL — analytics snippet in ${relative(dist, file)}`)
    failed = true
  }
}

const sitemapPath = join(dist, 'sitemap.xml')
if (!existsSync(sitemapPath)) {
  console.error('check-seo: FAIL — dist/sitemap.xml missing')
  failed = true
} else {
  const sitemap = readFileSync(sitemapPath, 'utf8')
  const slugs = [...readFileSync(toolsSrc, 'utf8').matchAll(/slug:\s*'([a-z0-9-]+)'/g)].map((m) => m[1])
  const base = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE
  const origin = `${SITE}${base}`
  if (!sitemap.includes(`<loc>${origin}/</loc>`)) {
    console.error(`check-seo: FAIL — sitemap missing home ${origin}/`)
    failed = true
  }
  if (!sitemap.includes(`<loc>${origin}/hi/</loc>`)) {
    console.error(`check-seo: FAIL — sitemap missing Hindi home ${origin}/hi/`)
    failed = true
  }
  for (const slug of slugs) {
    const loc = `${origin}/${slug}/`
    if (!sitemap.includes(`<loc>${loc}</loc>`)) {
      console.error(`check-seo: FAIL — sitemap missing ${loc}`)
      failed = true
    }
    const hiLoc = `${origin}/hi/${slug}/`
    if (!sitemap.includes(`<loc>${hiLoc}</loc>`)) {
      console.error(`check-seo: FAIL — sitemap missing ${hiLoc}`)
      failed = true
    }
  }
  if (/sitemapindex/i.test(sitemap)) {
    console.error('check-seo: FAIL — sitemap-index is not allowed')
    failed = true
  }
}

const robotsPath = join(dist, 'robots.txt')
if (!existsSync(robotsPath)) {
  console.error('check-seo: FAIL — dist/robots.txt missing')
  failed = true
} else {
  const robots = readFileSync(robotsPath, 'utf8')
  if (!/User-agent:\s*\*/i.test(robots) || !/Allow:\s*\//i.test(robots)) {
    console.error('check-seo: FAIL — robots.txt must allow all')
    failed = true
  }
}

const home = readFileSync(join(dist, 'index.html'), 'utf8')
if (!home.includes('application/ld+json') || !home.includes('WebApplication')) {
  console.error('check-seo: FAIL — home is missing WebApplication JSON-LD')
  failed = true
}

if (failed) process.exit(1)
console.log(`check-seo: OK — ${htmlFiles.length} HTML routes, sitemap + robots, no analytics.`)
