# Deploying Chhalaang

> **Deployed 2026-07-20**: live at https://chhalaang.tiwari-kalpit.workers.dev/
> via Cloudflare (Workers & Pages, Git-connected build: `npm run build` → `dist`).
> The repo was still private at deploy time — Cloudflare's GitHub App handles
> private-repo access fine.

The app is a static site: `npm run build` → everything in `dist/`. No server,
no environment variables, no secrets. Recommended host: **Cloudflare Pages**
(root-path URLs, so the service worker and manifest work unchanged).

## Launch checklist (owner steps, ~10 minutes)

1. **Make the repo public** — GitHub → Settings → General → Danger Zone →
   Change visibility. (The code contains no secrets; verified.)
2. **Cloudflare Pages** — dash.cloudflare.com → Workers & Pages → Create →
   Pages → Connect to Git → pick `kalpitt/chhalaang`:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - No environment variables needed.
3. First deploy gives `<project>.pages.dev`. Optional: add a custom domain
   (e.g. `chhalaang.app`) under the project's Custom Domains tab.
4. **Smoke-test the deployed URL**: all three tabs, the share-card download,
   install-to-home-screen on a phone, then toggle airplane mode and reload —
   the app should still open (service worker).
5. Update the README badge/link and the share card URL if a custom domain
   was chosen (see `src/components/ShareCard.tsx` footer).

## Notes

- **GitHub Pages caveat**: project pages serve under `/chhalaang/`, but the
  manifest, icons and service worker use root paths (`/sw.js`, `/icon.svg`).
  Use Cloudflare Pages (or any root-domain host) unless you want to rework
  those paths to be relative.
- The service worker caches aggressively. After deploying a change, bump
  `VERSION` in `public/sw.js` if you need clients to refetch immediately.
- Analytics: none, by design. If you ever want traffic numbers, use
  Cloudflare's server-side analytics (free, no cookies, no script) — never a
  client-side tracker; "nothing is uploaded" is a product promise.
