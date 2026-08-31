#!/usr/bin/env node
/**
 * Content-Security-Policy gate. Run after `npm run build`.
 *
 * Every prerendered HTML route must carry a meta CSP element with all required
 * directives, script hashing, no unsafe-inline/unsafe-eval, connect-src 'self',
 * and no off-origin subresources (scripts, stylesheets, images).
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')

if (!existsSync(dist)) {
  console.error('check-csp: dist/ not found. Run `npm run build` first.')
  process.exit(1)
}

let failed = false

const REQUIRED_DIRECTIVES = [
  'default-src',
  'script-src',
  'style-src',
  'connect-src',
  'img-src',
  'font-src',
  'base-uri',
  'form-action',
  'object-src',
]

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
  console.error('check-csp: FAIL — no HTML in dist/')
  process.exit(1)
}

function getAttr(tag, attr) {
  const re = new RegExp(`\\b${attr}\\s*=\\s*(?:(["'])([\\s\\S]*?)\\1|([^\\s>]+))`, 'i')
  const match = tag.match(re)
  if (!match) return null
  return match[2] !== undefined ? match[2] : match[3]
}

function getCspContent(html) {
  const metaTags = html.match(/<meta\s+[^>]*>/gi) || []
  for (const tag of metaTags) {
    const httpEquiv = getAttr(tag, 'http-equiv')
    if (httpEquiv && httpEquiv.toLowerCase() === 'content-security-policy') {
      return getAttr(tag, 'content')
    }
  }
  return null
}

function parseDirectives(cspString) {
  const directives = new Map()
  const parts = cspString.split(';').map((s) => s.trim()).filter(Boolean)
  for (const part of parts) {
    const tokens = part.split(/\s+/).filter(Boolean)
    if (tokens.length > 0) {
      const name = tokens[0].toLowerCase()
      const values = tokens.slice(1)
      directives.set(name, values)
    }
  }
  return directives
}

function isOffOrigin(url) {
  if (!url) return false
  return /^(?:https?:|\/\/)/i.test(url)
}

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8')
  const rel = relative(dist, file)

  const csp = getCspContent(html)
  if (csp === null) {
    console.error(`check-csp: FAIL — ${rel} missing Content-Security-Policy meta element`)
    failed = true
  } else {
    const directives = parseDirectives(csp)

    for (const dir of REQUIRED_DIRECTIVES) {
      if (!directives.has(dir)) {
        console.error(`check-csp: FAIL — ${rel} missing required CSP directive "${dir}"`)
        failed = true
      }
    }

    if (directives.has('script-src')) {
      const scriptSrc = directives.get('script-src')
      if (scriptSrc.some((v) => /unsafe-inline/i.test(v))) {
        console.error(`check-csp: FAIL — ${rel} script-src contains 'unsafe-inline'`)
        failed = true
      }
      if (scriptSrc.some((v) => /unsafe-eval/i.test(v))) {
        console.error(`check-csp: FAIL — ${rel} script-src contains 'unsafe-eval'`)
        failed = true
      }
      const hasSha256 = scriptSrc.some((v) => /'sha256-[A-Za-z0-9+/=]+'/i.test(v))
      if (!hasSha256) {
        console.error(`check-csp: FAIL — ${rel} script-src missing sha256 hash`)
        failed = true
      }
    }

    if (directives.has('connect-src')) {
      const connectSrc = directives.get('connect-src')
      const joined = connectSrc.join(' ')
      if (joined !== "'self'") {
        console.error(`check-csp: FAIL — ${rel} connect-src is "${joined}", expected exactly "'self'"`)
        failed = true
      }
    }

    if (directives.has('default-src')) {
      const defaultSrc = directives.get('default-src')
      if (defaultSrc.some((v) => v.includes('*'))) {
        console.error(`check-csp: FAIL — ${rel} default-src contains wildcard '*'`)
        failed = true
      }
    }

    if (directives.has('object-src')) {
      const objectSrc = directives.get('object-src')
      if (objectSrc.some((v) => v.includes('*'))) {
        console.error(`check-csp: FAIL — ${rel} object-src contains wildcard '*'`)
        failed = true
      }
    }
  }

  // Check for off-origin subresources: <script src>, <link rel="stylesheet" href>, <img src>
  const scriptTags = html.match(/<script\b[^>]*>/gi) || []
  for (const tag of scriptTags) {
    const src = getAttr(tag, 'src')
    if (src && isOffOrigin(src)) {
      console.error(`check-csp: FAIL — ${rel} off-origin script: ${src}`)
      failed = true
    }
  }

  const linkTags = html.match(/<link\b[^>]*>/gi) || []
  for (const tag of linkTags) {
    const relAttr = getAttr(tag, 'rel')
    if (relAttr && /\bstylesheet\b/i.test(relAttr)) {
      const href = getAttr(tag, 'href')
      if (href && isOffOrigin(href)) {
        console.error(`check-csp: FAIL — ${rel} off-origin stylesheet: ${href}`)
        failed = true
      }
    }
  }

  const imgTags = html.match(/<img\b[^>]*>/gi) || []
  for (const tag of imgTags) {
    const src = getAttr(tag, 'src')
    if (src && isOffOrigin(src)) {
      console.error(`check-csp: FAIL — ${rel} off-origin image: ${src}`)
      failed = true
    }
  }
}

if (failed) process.exit(1)
console.log(`check-csp: OK — ${htmlFiles.length} HTML routes, CSP meta verified, no off-origin subresources.`)
