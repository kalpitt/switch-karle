import type { Lang } from '../i18n'
import { withBase } from './base'

/** True when the URL is a Hindi twin (`…/hi/` or `…/hi/slug/`). */
export function isHiPath(pathname: string, base: string): boolean {
  const prefix = base.endsWith('/') ? base : `${base}/`
  const rest = pathname.startsWith(prefix)
    ? pathname.slice(prefix.length)
    : pathname.replace(/^\//, '')
  const trimmed = rest.replace(/^\/+|\/+$/g, '')
  return trimmed === 'hi' || trimmed.startsWith('hi/')
}

/** English twin of a pathname that may already be EN or HI. */
export function englishPath(pathname: string, base: string): string {
  const prefix = base.endsWith('/') ? base : `${base}/`
  const rest = pathname.startsWith(prefix)
    ? pathname.slice(prefix.length)
    : pathname.replace(/^\//, '')
  let trimmed = rest.replace(/^\/+|\/+$/g, '')
  if (trimmed === 'hi') trimmed = ''
  else if (trimmed.startsWith('hi/')) trimmed = trimmed.slice(3)
  return trimmed ? `${prefix}${trimmed}/` : prefix
}

/** Hindi twin. */
export function hindiPath(pathname: string, base: string): string {
  const prefix = base.endsWith('/') ? base : `${base}/`
  const en = englishPath(pathname, base)
  const rest = en.startsWith(prefix) ? en.slice(prefix.length) : en
  const trimmed = rest.replace(/^\/+|\/+$/g, '')
  return trimmed ? `${prefix}hi/${trimmed}/` : `${prefix}hi/`
}

export function withLang(lang: Lang, slug = ''): string {
  if (lang === 'hi') return withBase(slug ? `hi/${slug}` : 'hi')
  return withBase(slug)
}
