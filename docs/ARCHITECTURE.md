# Architecture — Switch Karle (as migrated)

This describes the **repo as it is on `build/suite`**, not a product roadmap.
Direction lives in personal-os (`context/handoffs/2026-08-22-switch-karle-master-roadmap-v2.md` §A, plus the 2026-08-23 owner amendments). Do not add a second strategy document here.

## Shape

Astro static site, React islands, Tailwind 4 tokens in `src/index.css`. One
`site` + `base` in `site.config.mjs` / `astro.config.mjs`. Today:

- `site`: `https://kalpit.me`
- `base`: `/switch-karle`

Cutover to `https://switchkarle.fyi` with `base: '/'` is a later commit, after
the domain serves. No 301 from the old URL.

```
src/
  engine/          pure TS — never imports react (purity.test.ts)
  tools/<slug>/    one island per tool (form + result)
  components/ui.tsx  shared primitives only — do not restyle per tool
  data/tools.ts    registry: grid, routes, sitemap, cmdk palette
  lib/storage.ts   switchkarle.<tool>.v<N>
  i18n/            en.ts canonical; hi.ts frozen no-regression until Hindi pass
  layouts/Base.astro  head contract, PWA register
  pages/[tool].astro  catch-all from the registry (EN only)
```

Every interactive tool is: **golden tests (first) → pure engine function → island
wired to `VerdictBanner` + `Disclaimer` → registry row → `en.ts` keys**. The
catch-all picks up the slug. `node scripts/new-tool.mjs <slug>` scaffolds that
loop (and patches `[tool].astro` with one static import — Astro cannot hydrate a
variable component).

## Head contract

Every prerendered HTML route has a unique `<title>`, meta description, canonical,
OG title/description/url/image (1200×630 at `public/og/default.png`), and
`twitter:card=summary_large_image`. Home adds JSON-LD `WebApplication`.
`hreflang` hi and `/hi/` routes wait for the Hindi pass; until then `en` +
`x-default` point at the English URL.

`sitemap.xml` and `robots.txt` are generated from the registry. Allow-all.
Generated ≠ submitted. No sitemap-index. No analytics scripts — `check-seo.mjs`
greps `dist/` for `googletagmanager|gtag|plausible|umami|fathom`.

## PWA

`@vite-pwa/astro` Workbox `generateSW`, precache-all HTML, **`navigateFallback`
explicitly unset**. The plugin's default fallback is `base` (home). Offline
reload of `/decoder/` must be the decoder. `check-base` greps `dist/sw.js` for
`createHandlerBoundToURL` and requires each shipped tool HTML in the precache.

## i18n

Existing Decoder / Tracker / Prompts chrome stays bilingual (`hi.ts`). New tools
add `en.ts` only; Hindi mode falls back to English. `src/i18n/hi-freeze.json` is
the no-regression list. The Hindi pass fills the delta, adds `/hi/<slug>`, and
flips the test back to full EN→HI parity.

## Privacy

See `PRIVACY.md`. Sanctioned data leaving the device: user pastes a prompt into
their own AI tab; user exports JSON; user downloads a share image. App-initiated
network calls carrying user data are prohibited. No IndexedDB. No salary in URLs.

## Provisional statutory list

Ship on `build/suite` with goldens + `CANDIDATE:` comments + gate (d). Do not
invent a `VERIFIED:` marker — that waits on the CA's written answers. Flip
status in a reconciliation commit when those arrive. **Do not AI-fix the
citation landmine.**

| Item | Where | Status |
| --- | --- | --- |
| New-regime rebate citation (s.157 / Act 2026 vs s.156 / Act 2025) | `src/engine/tax.ts`, `src/i18n/en.ts` | **Landmine — waiting on CA R1. Computed values golden-tested.** |
| FY 2026-27 slabs, rebate amounts, cess, surcharge, standard deduction | `src/engine/tax.ts` | Candidate; last verified 2026-07-20 |
| EPF 12% / ₹15,000 wage ceiling | `src/engine/salary.ts` | Candidate |
| Gratuity accrual 4.81% of basic | `src/engine/salary.ts` | Candidate |
| HRA exemption (s.10(13A) / Rule 2A three limbs) | `src/engine/salary.ts` `hraExemptionAnnual` | Candidate |
| Joining-bonus tax delta (not TDS) | `src/engine/clawback.ts` | Candidate; gross-repay is contractual |
| ESOP perquisite at exercise | `src/engine/esop.ts` | Candidate; sale / startup TDS deferral not modelled |
| PF premature withdrawal (s.192A / s.392(7) recollection) | `src/engine/epf.ts` | Candidate; **no TDS rupee computed** — trap is flagged, CA R3 |
| Relocation HRA metro limb + PT | `src/engine/relocation.ts`, `professionalTax.ts` | Candidate; PT table incomplete |
| State professional tax table | `src/engine/professionalTax.ts` | Incomplete (`other` → ₹0; unlisted states levy PT) |
| Decoder in-hand (uses the engine) | `/decoder/` | Shipped on production; still provisional pending R1 |

Rules-last-verified chip: `src/data/rules.ts` → footer. Stale engine should look stale.

## Gates

Local and CI: `test` · `typecheck` · `lint` · `build` · `check:base` · `check:seo`.
Never merge `build/suite` to `main` without Kalpit — `main` is production.
