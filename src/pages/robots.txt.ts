import type { APIRoute } from 'astro'

function siteRoot(): string {
  const site = (import.meta.env.SITE || 'https://kalpit.me').replace(/\/$/, '')
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
