/** Prefix `path` with the configured Astro base (`/switch-karle/` today). */
export function withBase(path = ''): string {
  const base = import.meta.env.BASE_URL || '/'
  const clean = path.replace(/^\/+/, '').replace(/\/+$/, '')
  if (!clean) return base.endsWith('/') ? base : `${base}/`
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${clean}/`
}

export function hostLabel(site: string, base: string): string {
  const host = site.replace(/^[a-zA-Z]+:\/\//, '').replace(/\/+$/, '')
  const path = base.replace(/^\/+/, '').replace(/\/+$/, '')
  if (!host) return path
  if (!path) return host
  return `${host}/${path}`
}

export function shareFooterLabel(): string {
  const origin = (import.meta.env.SITE as string | undefined) || (typeof window === 'undefined' ? '' : window.location.origin)
  const base = import.meta.env.BASE_URL || '/'
  return hostLabel(origin, base)
}
