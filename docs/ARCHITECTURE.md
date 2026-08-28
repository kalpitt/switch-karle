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
  i18n/            en.ts canonical; hi.ts + hi-suite.ts full EN→HI parity
  layouts/Base.astro  head contract, hreflang en/hi/x-default, PWA register
  pages/[tool].astro + pages/hi/[tool].astro  EN and Hindi twins
```

Every interactive tool is: **golden tests (first) → pure engine function → island
wired to `VerdictBanner` + `Disclaimer` → registry row → `en.ts` keys**. The
catch-all picks up the slug. `node scripts/new-tool.mjs <slug>` scaffolds that
loop (and patches `ToolIslands.astro` with one static import — Astro cannot hydrate a
variable component).

## Head contract

Every prerendered HTML route has a unique `<title>`, meta description, canonical,
OG title/description/url/image (1200×630 at `public/og/default.png`),
`twitter:card=summary_large_image`, and `hreflang` en + hi + x-default. Hindi
titles use `— स्विच कर ले` so they do not collide with English. Home adds JSON-LD
`WebApplication`. `/hi/` twins live at `src/pages/hi/`.

`sitemap.xml` and `robots.txt` are generated from the registry (EN + HI locs).
Allow-all. Generated ≠ submitted. No sitemap-index. No analytics scripts —
`check-seo.mjs` greps `dist/` for `googletagmanager|gtag|plausible|umami|fathom`.

## PWA

`@vite-pwa/astro` Workbox `generateSW`, precache-all HTML, **`navigateFallback`
explicitly unset**. The plugin's default fallback is `base` (home). Offline
reload of `/decoder/` must be the decoder. `check-base` greps `dist/sw.js` for
`createHandlerBoundToURL` and requires each shipped tool HTML in the precache.

## i18n

`en.ts` is canonical. `hi.ts` is the frozen chrome (no-regression via
`hi-freeze.json`). `hi-suite.ts` fills every remaining English key. Combined
Hindi must be 1:1 with English. Language follows the URL: `/hi/<slug>/` vs
`/<slug>/`. The EN/HI toggle navigates to the sibling path.

## Privacy

See `PRIVACY.md`. Sanctioned data leaving the device: user pastes a prompt into
their own AI tab; user exports JSON; user downloads a share image. App-initiated
network calls carrying user data are prohibited. No IndexedDB. No salary in URLs.

## Statutory constants

Ship with goldens. A constant's status lives beside its code:

- `CANDIDATE` — plausible, unverified; UI flags it where it matters.
- `VERIFIED: <date> | Source: <primary URL> §<n> | FY:` — checked against the
  named Act, notification, or official PDF. Never from a blog or another AI.
- Flip a status only with the primary source in hand. Do not AI-fix numbers.

| Item | Where | Status |
| --- | --- | --- |
| Rebate citation s.156 ITA 2025 (was s.157/"Act 2026"); s.157 = arrears only | `src/engine/tax.ts`, i18n how-computed strings | **VERIFIED 2026-08-23** (ITA 2025 PDF) |
| SD + PT deduction §19 · 80C cap §123 · new regime §202 | `src/engine/tax.ts`, `salary.ts` comments | VERIFIED 2026-08-23 (ITA 2025 PDF) |
| FY 2026-27 slabs, rebate amounts, cess, surcharge | `src/engine/tax.ts` | Golden-tested; last verified 2026-07-20 |
| Gratuity: eligibility §2A, payable years §4(2), ₹20L cap §4(3), 190/240-day rule | `src/engine/gratuity.ts` | VERIFIED 2026-08-23 (PGA 1972 PDF + S.O. 1420(E)) |
| Punjab State Development Tax ₹2,400 | `src/engine/professionalTax.ts` | VERIFIED 2026-08-23 (PSDT Act 2018); other listed states stay ₹0 + `PT_AMOUNT_UNVERIFIED` by design |
| EPF 12% / ₹15,000 wage ceiling | `src/engine/salary.ts` | Candidate |
| Gratuity accrual 4.81% of basic | `src/engine/salary.ts` | Candidate |
| HRA exemption three limbs (Rule 2A) | `src/engine/salary.ts` `hraExemptionAnnual` | Candidate |
| Joining-bonus tax delta (gross-repay convention) | `src/engine/clawback.ts` | Candidate; contractual |
| ESOP perquisite at exercise | `src/engine/esop.ts` | Candidate; CA R3 |
| PF premature withdrawal TDS (s.192A / s.392(7)) | `src/engine/epf.ts` | Candidate; **no TDS rupee computed** — trap flagged, transfer recommended |
| Relocation PT table | `professionalTax.ts`, `relocation.ts` | Incomplete by design (unverified states → ₹0) |
| Decoder in-hand (uses the engine) | `/decoder/` | Shipped; inherits row statuses above |

Rules-last-verified chip: `src/data/rules.ts` → footer. Stale engine should look stale.

## Gates

Local and CI: `test` · `typecheck` · `lint` · `build` · `check:base` · `check:seo`.
Never merge `build/suite` to `main` without Kalpit — `main` is production.
