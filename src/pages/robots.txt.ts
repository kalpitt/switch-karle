import type { APIRoute } from 'astro'
import { SITE } from '../../site.config.mjs'

function siteRoot(): string {
  const site = (import.meta.env.SITE || SITE).replace(/\/$/, '')
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  return `${site}${base}`
}

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /

Sitemap: ${siteRoot()}/sitemap.xml
`
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
