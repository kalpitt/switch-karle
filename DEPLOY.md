# Deploying Switch Karle

> **Canonical URL: https://kalpit.me/switch-karle/** (GitHub Pages, live since
> 2026-07-20, renamed from `chhalaang` same day). Mirror:
> https://chhalaang.tiwari-kalpit.workers.dev/ (Cloudflare Pages, deployed
> first, still on the old project name — kept running as a fallback).

## Primary: kalpit.me/switch-karle (GitHub Pages)

kalpit.me is the custom domain of the `kalpitt.github.io` user site, so any
public repo of Kalpit's with GitHub Pages enabled auto-serves at
`kalpit.me/<repo>` (the saavdhan pattern). The Astro build sets `site` +
`base: '/switch-karle'` once in `astro.config.mjs` (via `site.config.mjs`).
The Workers root-URL mirror will 404 assets until the domain cutover flips
`base` to `/`. The GitHub Pages subpath is the canonical deploy.

Owner steps to activate (already done for this repo):
1. Make this repo public (required for free-plan Pages).
2. GitHub → switch-karle → Settings → Pages → Source: **GitHub Actions**.
3. Push to main (or Actions → "Deploy to GitHub Pages (kalpit.me/switch-karle)" → Run workflow).
   `.github/workflows/pages.yml` builds, tests, and deploys.
4. Verify https://kalpit.me/switch-karle/ loads.

The app is a static site: `npm run build` → everything in `dist/`. No server,
no environment variables, no secrets.

## Secondary: Cloudflare Pages mirror

Still live at the old `chhalaang.tiwari-kalpit.workers.dev` project name —
Cloudflare Pages projects aren't renamable via API without a token, so
renaming it (or pointing a fresh `switch-karle.<subdomain>` project at the
same repo, then retiring the old one) is a manual dashboard step whenever
Kalpit wants to do it. Not urgent: it's a fallback mirror, not the canonical
URL.

## Notes

- **GitHub Pages caveat**: project pages serve under `/switch-karle/`. Asset
  URLs are `/switch-karle/_astro/...`. `npm run check:base` fails the build
  if any prerendered HTML points outside that prefix. Don't reintroduce
  root-absolute `/assets/...` paths.
- The service worker is Workbox `generateSW` (precache-all HTML, **no** SPA
  navigateFallback). Offline reload of `/decoder/` must render the decoder,
  never the home grid. `@vite-pwa/astro` defaults fallback to `base` if we
  forget to set `navigateFallback: undefined` — the smoke check greps for
  `createHandlerBoundToURL` so that cannot land silently.
- Analytics: none, by design — no client-side tracker; "nothing is uploaded"
  is a product promise. For traffic numbers on the **canonical URL**, use
  GitHub repo Insights → Traffic (visits/uniques/referrers, 14-day rolling,
  no script, no cookies — works because the canonical URL is served straight
  from GitHub Pages). The earlier note here about using Cloudflare's
  server-side analytics was wrong for the canonical URL: `kalpit.me`'s
  nameservers are on Porkbun, not Cloudflare, and resolve straight to GitHub
  Pages' IPs — so no Cloudflare edge ever sees that traffic. Cloudflare zone
  analytics would only ever cover the Workers mirror, which real visitors
  won't be using.
