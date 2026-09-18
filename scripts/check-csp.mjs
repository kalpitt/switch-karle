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

export const REQUIRED_DIRECTIVES = [
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

export function stripHtmlComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '')
}

export function getAttr(tag, attr) {
  const re = new RegExp(`(?:^|\\s)${attr}\\s*=\\s*(?:(["'])([\\s\\S]*?)\\1|([^\\s>]+))`, 'i')
  const match = tag.match(re)
  if (!match) return null
  return match[2] !== undefined ? match[2] : match[3]
}

export function getCspContent(html) {
  const cleanHtml = stripHtmlComments(html)
  const metaTags = cleanHtml.match(/<meta\s+[^>]*>/gi) || []
  for (const tag of metaTags) {
    const httpEquiv = getAttr(tag, 'http-equiv')
    if (httpEquiv && httpEquiv.trim().toLowerCase() === 'content-security-policy') {
      return getAttr(tag, 'content')
    }
  }
  return null
}

export function parseDirectives(cspString) {
  const directives = new Map()
  const parts = cspString.split(';').map((s) => s.trim()).filter(Boolean)
  for (const part of parts) {
    const tokens = part.split(/\s+/).filter(Boolean)
    if (tokens.length > 0) {
      const name = tokens[0].toLowerCase()
      const values = tokens.slice(1)
      if (directives.has(name)) {
        directives.get(name).push(...values)
      } else {
        directives.set(name, values)
      }
    }
  }
  return directives
}

export function isOffOrigin(url) {
  if (!url) return false
  const trimmed = url.trim()
  return /^(?:https?:|\/\/)/i.test(trimmed)
}

export function checkCspHtml(html, rel = 'page.html') {
  const errors = []
  const csp = getCspContent(html)
  if (csp === null) {
    errors.push(`check-csp: FAIL — ${rel} missing Content-Security-Policy meta element`)
  } else {
    const directives = parseDirectives(csp)

    for (const dir of REQUIRED_DIRECTIVES) {
      if (!directives.has(dir) || directives.get(dir).length === 0) {
        errors.push(`check-csp: FAIL — ${rel} missing required CSP directive "${dir}"`)
      }
    }

    if (directives.has('script-src')) {
      const scriptSrc = directives.get('script-src')
      if (scriptSrc.some((v) => /unsafe-inline/i.test(v))) {
        errors.push(`check-csp: FAIL — ${rel} script-src contains 'unsafe-inline'`)
      }
      if (scriptSrc.some((v) => /unsafe-eval/i.test(v))) {
        errors.push(`check-csp: FAIL — ${rel} script-src contains 'unsafe-eval'`)
      }
      const hasSha256 = scriptSrc.some((v) => /'sha256-[A-Za-z0-9+/=]+'/i.test(v))
      if (!hasSha256) {
        errors.push(`check-csp: FAIL — ${rel} script-src missing sha256 hash`)
      }
    }

    if (directives.has('style-src')) {
      const styleSrc = directives.get('style-src')
      if (styleSrc.some((v) => /unsafe-inline/i.test(v))) {
        errors.push(`check-csp: FAIL — ${rel} style-src contains 'unsafe-inline'`)
      }
      if (styleSrc.some((v) => /unsafe-eval/i.test(v))) {
        errors.push(`check-csp: FAIL — ${rel} style-src contains 'unsafe-eval'`)
      }
    }

    if (directives.has('connect-src')) {
      const connectSrc = directives.get('connect-src')
      const joined = connectSrc.join(' ')
      if (joined !== "'self'") {
        errors.push(`check-csp: FAIL — ${rel} connect-src is "${joined}", expected exactly "'self'"`)
      }
    }

    if (directives.has('default-src')) {
      const defaultSrc = directives.get('default-src')
      if (defaultSrc.some((v) => v.includes('*'))) {
        errors.push(`check-csp: FAIL — ${rel} default-src contains wildcard '*'`)
      }
      if (defaultSrc.some((v) => /unsafe-inline/i.test(v))) {
        errors.push(`check-csp: FAIL — ${rel} default-src contains 'unsafe-inline'`)
      }
      if (defaultSrc.some((v) => /unsafe-eval/i.test(v))) {
        errors.push(`check-csp: FAIL — ${rel} default-src contains 'unsafe-eval'`)
      }
    }

    if (directives.has('object-src')) {
      const objectSrc = directives.get('object-src')
      if (objectSrc.some((v) => v.includes('*'))) {
        errors.push(`check-csp: FAIL — ${rel} object-src contains wildcard '*'`)
      }
    }
  }

  // Check for off-origin subresources: <script src>, <link rel="stylesheet" href>, <img src>
  const cleanHtml = stripHtmlComments(html)
  const scriptTags = cleanHtml.match(/<script\b[^>]*>/gi) || []
  for (const tag of scriptTags) {
    const src = getAttr(tag, 'src')
    if (src && isOffOrigin(src)) {
      errors.push(`check-csp: FAIL — ${rel} off-origin script: ${src}`)
    }
  }

  const linkTags = cleanHtml.match(/<link\b[^>]*>/gi) || []
  for (const tag of linkTags) {
    const relAttr = getAttr(tag, 'rel')
    if (relAttr && /\bstylesheet\b/i.test(relAttr)) {
      const href = getAttr(tag, 'href')
      if (href && isOffOrigin(href)) {
        errors.push(`check-csp: FAIL — ${rel} off-origin stylesheet: ${href}`)
      }
    }
  }

  const imgTags = cleanHtml.match(/<img\b[^>]*>/gi) || []
  for (const tag of imgTags) {
    const src = getAttr(tag, 'src')
    if (src && isOffOrigin(src)) {
      errors.push(`check-csp: FAIL — ${rel} off-origin image: ${src}`)
    }
  }

  return { ok: errors.length === 0, errors }
}

export function runCspCheck(options = {}) {
  const distDir = options.dist || dist

  if (!existsSync(distDir)) {
    console.error('check-csp: dist/ not found. Run `npm run build` first.')
    return false
  }

  const htmlFiles = walk(distDir, (p) => p.endsWith('.html'))
  if (htmlFiles.length === 0) {
    console.error('check-csp: FAIL — no HTML in dist/')
    return false
  }

  let failed = false
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8')
    const rel = relative(distDir, file)
    const { ok, errors } = checkCspHtml(html, rel)
    if (!ok) {
      for (const err of errors) console.error(err)
      failed = true
    }
  }

  if (failed) return false
  console.log(`check-csp: OK — ${htmlFiles.length} HTML routes, CSP meta verified, no off-origin subresources.`)
  return true
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isMain) {
  if (!runCspCheck()) {
    process.exit(1)
  }
}
