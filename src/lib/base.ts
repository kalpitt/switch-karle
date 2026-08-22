/** Prefix `path` with the configured Astro base (`/switch-karle/` today). */
export function withBase(path = ''): string {
  const base = import.meta.env.BASE_URL || '/'
  const clean = path.replace(/^\/+/, '').replace(/\/+$/, '')
  if (!clean) return base.endsWith('/') ? base : `${base}/`
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${clean}/`
}
