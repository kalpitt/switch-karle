#!/usr/bin/env node
/**
 * Guards the path-relative build.
 *
 * `vite.config.ts` sets `base: './'` so one `dist/` serves from a domain root
 * AND from a subpath (kalpit.me/switch-karle/). An absolute `/assets/...`
 * reference breaks the subpath deploy silently: the HTML loads, the scripts
 * 404, and the page renders blank. Nobody notices until a user reports it.
 *
 * Retire this check once the custom domain lands and `base` becomes '/'.
 * Until then it runs in CI after `npm run build`.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const indexHtml = resolve(root, 'dist/index.html')

if (!existsSync(indexHtml)) {
  console.error('check-relative-build: dist/index.html not found. Run `npm run build` first.')
  process.exit(1)
}

const html = readFileSync(indexHtml, 'utf8')

// src="/x" or href="/x", excluding protocol-relative "//host" and absolute URLs.
const absolute = [...html.matchAll(/\b(?:src|href)="(\/(?!\/)[^"]*)"/g)].map((m) => m[1])

if (absolute.length > 0) {
  console.error('check-relative-build: FAIL — dist/index.html has root-absolute references:')
  for (const ref of absolute) console.error(`  ${ref}`)
  console.error('\nThese break the subpath deploy. Keep `base` relative in vite.config.ts,')
  console.error('or retire this check deliberately when the app moves to its own domain.')
  process.exit(1)
}

console.log('check-relative-build: OK — no root-absolute references in dist/index.html.')
