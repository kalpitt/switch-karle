# Deploying Switch Karle

> **Canonical URL: https://switchkarle.fyi/** (GitHub Pages, custom domain,
> since 2026-10-31).

## How a deploy happens

Merging to `main` deploys. `.github/workflows/pages.yml` ("Deploy to GitHub
Pages (switchkarle.fyi)") runs on every push to `main`: it re-runs every check
from `ci.yml` (lint, typecheck, tests, build, `check:base`, `check:seo`,
`check:csp`, the private-path scan), uploads `dist/` and deploys it. Then its
`smoke` job opens the live site (see below). It can also be started by hand:
Actions → "Deploy to GitHub Pages (switchkarle.fyi)" → Run workflow.

The app is a static site: `npm run build` → everything in `dist/`. No server,
no environment variables, no secrets.

Settings that make this work (already done):
1. The repo is public (required for free-plan Pages).
2. Settings → Pages → Source: **GitHub Actions**; Custom domain:
   `switchkarle.fyi`, Enforce HTTPS on.
3. DNS for `switchkarle.fyi` is on Cloudflare in "DNS only" mode (grey cloud):
   the apex A records point at GitHub Pages, `www` is a CNAME to
   `kalpitt.github.io`. Cloudflare answers DNS only; page requests go straight
   to GitHub.

`site.config.mjs` holds `SITE = 'https://switchkarle.fyi'` and `BASE = '/'`.
`astro.config.mjs` and `scripts/check-base-build.mjs` both read it.

## Knowing when production breaks

`scripts/smoke-prod.mjs` opens the live site in a fresh headless browser and
fails if any of these is wrong:

- `robots.txt`, `sitemap.xml` and the manifest return 200; a missing page
  returns 404.
- Every page in the live sitemap (both languages) returns 200, hydrates with
  no page error and no console error (a blocked style or script is a console
  error), and has an `<h1>`.
- The home page's three questions lead to the next step; the Decoder shows a ₹
  figure and its bar is not drawn 100% full.
- The service worker installs and activates, and `/gratuity/`, never opened
  before, still loads with the network off.

It runs twice over:

- **After every deploy**, as the `smoke` job in `pages.yml`. If it fails,
  GitHub emails whoever pushed to `main` (the person who merged).
- **Every day at 09:00 IST**, from `.github/workflows/smoke.yml`, so a
  certificate, DNS or GitHub Pages problem shows up even when nothing was
  merged. When a scheduled run fails, GitHub emails the person who last
  changed that workflow's `cron` line, which is whoever merged it.

For the email to arrive, GitHub → Settings → Notifications → Actions must have
email on for failed workflows (the default). GitHub pauses scheduled workflows
after 60 days with no repository activity and says so on the Actions tab;
re-enable it there.

The smoke test sends ordinary page requests from an empty browser. No user
data exists in it and nothing is posted anywhere. Run it yourself with
`node scripts/smoke-prod.mjs` (or pass another origin, such as a local
server, as the first argument).

## Rollback

If a deploy breaks the site:

- **Fastest (about 3 minutes):** Actions → "Deploy to GitHub Pages
  (switchkarle.fyi)" → open the last green run *before* the bad one → "Re-run
  all jobs". A re-run builds the commit that run was for, so the old version
  goes live again. `main` still holds the bad change, so do the next step too.
- **Permanent:** open the merged pull request on GitHub → "Revert" → merge the
  revert pull request. That deploys `main` without the change.

Visitors pick up a rollback the same way they pick up any deploy: on their
next visit the page says "A new version is ready. Reload".

## Notes

- The service worker is Workbox `generateSW` (precache-all HTML, **no** SPA
  navigateFallback). Offline reload of `/decoder/` must render the decoder,
  never the home page. `@vite-pwa/astro` defaults the fallback to `base` if
  `navigateFallback: undefined` is ever dropped; `check:base` greps `sw.js`
  for `createHandlerBoundToURL` so that cannot land silently. It also fails if
  any precached URL has no file in `dist/`: one such URL (`404/`) stopped the
  service worker installing at all until 2026-10-31.
- After a deploy, a returning visitor's service worker updates in the
  background and the page shows "A new version is ready. Reload" rather than
  reloading itself.
- Analytics: none, by design (`PRIVACY.md`). GitHub repo Insights → Traffic
  counts visits to the repository on github.com, not visits to the site.
- The old address `kalpit.me/switch-karle/` now answers with a 301 to
  `https://switchkarle.fyi/`. GitHub does this by itself once a repo has a
  custom domain; nothing in this repo sets it up. Saved data does not move
  with it: browser storage belongs to an origin, so someone who used the old
  address starts empty here unless they bring a backup file (footer → "Back up
  or restore").
- The Cloudflare Pages project `chhalaang.tiwari-kalpit.workers.dev`, a mirror
  from before the cutover, returned 404 on 2026-10-31. It is not a fallback.
  Whether to delete it is Kalpit's call.
