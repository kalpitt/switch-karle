import type { APIRoute } from 'astro'
import { TOOLS } from '../data/tools'

function siteRoot(): string {
  const site = (import.meta.env.SITE || 'https://kalpit.me').replace(/\/$/, '')
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  return `${site}${base}`
}

/** English + Hindi twins. Do not introduce a sitemap-index. */
export const GET: APIRoute = () => {
  const root = siteRoot()
  const en = [`${root}/`, ...TOOLS.map((t) => `${root}/${t.slug}/`)]
  const hi = [`${root}/hi/`, ...TOOLS.map((t) => `${root}/hi/${t.slug}/`)]
  const locs = [...en, ...hi]
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locs.map((loc) => `  <url><loc>${loc}</loc></url>`).join('\n')}
</urlset>
`
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
