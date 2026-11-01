import type { APIRoute } from 'astro'
import { SITE } from '../../site.config.mjs'
import { TOOLS } from '../data/tools'
import { INFO_PAGES } from '../data/infoPages'

function siteRoot(): string {
  const site = (import.meta.env.SITE || SITE).replace(/\/$/, '')
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  return `${site}${base}`
}

/** English + Hindi twins. Do not introduce a sitemap-index. */
export const GET: APIRoute = () => {
  const root = siteRoot()
  const slugs = [...TOOLS.map((t) => t.slug), ...INFO_PAGES]
  const en = [`${root}/`, ...slugs.map((slug) => `${root}/${slug}/`)]
  const hi = [`${root}/hi/`, ...slugs.map((slug) => `${root}/hi/${slug}/`)]
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
