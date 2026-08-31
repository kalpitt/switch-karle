# Architecture — Switch Karle

This describes the **repo as it is on `main`**, not a product roadmap.
Direction lives in `ROADMAP.md`. Do not add a second strategy document here.

## Shape

Astro static site, React islands, Tailwind 4 tokens in `src/index.css`. One
`site` + `base` in `site.config.mjs` / `astro.config.mjs`. Today:

- `site`: `https://kalpit.me`
- `base`: `/switch-karle`

Cutover to `https://switchkarle.fyi` with `base: '/'` is a later commit. The
domain is bought and its DNS points at Cloudflare; Kalpit is holding the final
connection until the site is complete and users are still zero, so the base
change costs nothing. No 301 from the old URL. See `ROADMAP.md` — the domain
question is settled and must not be re-opened.

```
src/
  engine/          pure TS — never imports react (purity.test.ts)
  tools/<slug>/    one island per tool (form + result)
  tracker/         the application board: types, store, undo snapshot
  components/ui.tsx  shared primitives only — do not restyle per tool
  data/tools.ts    registry: grid, routes, sitemap, cmdk palette
  prompts/         text the user hands to their own AI — English literals,
                   not i18n keys, because they are content and not UI chrome
  lib/storage.ts   switchkarle.<tool>.v<N>
  lib/             also: today, formatDate, langPath — anything that reads the
                   clock or the URL and so cannot live in engine/
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
their own AI tab; user exports JSON; user downloads a share image.

Local-first is the **default**, not the boundary — that changed on 2026-08-30.
User data may leave the device only to deliver a feature the user explicitly
turned on, only to a destination Kalpit controls, and only while it stays on.
Nothing today does. No third-party analytics. No IndexedDB. No salary in URLs.

## Shoulder-surfing: Notes mode removed 2026-08-30, replacement in backlog

Notes mode was a nav toggle that renamed the site to "Notes", set the tab title
to "Notes", greyed the accent colours, and hid four elements marked
`stealth-hide`: the tagline, the privacy badge, the home kicker, and the
example board.

It was removed because it did not do the job it implied. The tracker itself
stayed fully visible: real company names, LPA chips, stage words like "Offer"
and "Decided", and after the stage doorways shipped, tool names including
"Resignation letter". The URL still read `switch-karle`, and the nav still read
"Decoder". A disguise that leaves the incriminating half on screen is worse than
none, because someone may rely on it.

The four elements that were marked, i.e. the ones that name the job switch
outright in chrome rather than in user data, are recorded above in case that
list is useful again. It is not the list a real version would need.

**What a real version looks like, when it is built.** The requirement Kalpit set
is a browser-level panic switch: one keypress or one browser button, no
in-page menu, screen clear immediately. Design notes for whoever picks it up:

- The trigger must not be a control on the page. Reaching for a nav button is
  the tell. A global key handler, or a browser extension or bookmarklet, keeps
  the hand movement ambiguous.
- Cover the data, not the branding. Company names, salary figures, and stage
  labels are what gives it away; the site name is the least of it.
- Restoring must need a deliberate act, so a glance at a covered screen cannot
  uncover it.
- The tab title, the favicon, and the URL are all part of the surface. A
  same-origin static site cannot change its own URL, which is the honest ceiling
  on how far an in-page version can go and part of why the extension route is
  the real answer.

Until that ships, the site makes no shoulder-surfing claim anywhere in copy.

## The board, and filling it from a mailbox

The application tracker is the home page and the spine of the product. Three
pieces, in dependency order.

**`src/tracker/store.ts`** owns everything that persists. `save()` returns a
boolean rather than throwing, because a board that shows unsaved work as saved
is the worst failure this app has. `load()` validates every entry it reads, not
just the array shape — an application carrying a stage the board cannot render
used to crash the page on load, and because the entry was already persisted,
every refresh crashed again. Restore splits into `parseBackup` (validate),
`restoreAll` (replace) and `mergeBackup` (add without removing), so the UI can
describe a backup before acting on it. Both snapshot first and one undo restores
the exact prior board. Merge deliberately leaves the saved Decoder offer alone:
the button says it keeps everything, and silently replacing that offer would
make the sentence false.

**`src/engine/ingest.ts`** turns a pasted payload into candidate cards. Pure,
so `today` is a parameter. Deduplication keys on normalised company **plus**
role — company alone merged three genuinely different jobs at one consultancy.
Normalisation keeps letters, numbers and combining marks in any script; letters
alone turned every Devanagari name into the empty string and dropped real
applications as duplicates. Dates are parsed strictly and never guessed:
`14/07/2026` is refused, because day-first and month-first are
indistinguishable and a wrong guess writes a wrong date into someone's record.
An empty string or a null means absent, not unreadable. Rows reading as closed
are flagged, never dropped — there is no rejected stage and inventing one is a
product decision.

**`src/prompts/sweep.ts`** is the prompt the user runs in their own
Gmail-connected AI. English literal, not i18n keys, matching
`src/prompts/templates.ts`: it is content handed to a third party, not UI
chrome. Its shape is set by measurement, not taste — a 60-day window because
recall was about 66% at one month and 26% at a year, five separate searches
because one sender filter missed roughly a quarter of real applications, and an
explicit instruction not to count, because these assistants cannot count items
in a mailbox and will confidently guess.

**`src/engine/coverage.ts`** answers how far behind the board is. It reports
when the last sweep ran and how far back it reached, and nothing more. **No
percentage, no score, no progress bar** — the app does not know what it missed,
and claiming a number here would be worse than saying nothing. The UI shows the
gap in days and, always, the sentence saying job boards cap what they put in a
confirmation email.

Nothing in any of this makes a network call. The user pastes, and that is the
whole transfer.

## Statutory constants

Ship with goldens. A constant's status lives beside its code:

- `CANDIDATE` — plausible, unverified; UI flags it where it matters.
- `VERIFIED: <date> | Source: <primary URL> §<n> | FY:` — checked against the
  named Act, notification, or official PDF. Never from a blog or another AI.
- Flip a status only with the primary source in hand. Do not AI-fix numbers.

| Item | Where | Status |
| --- | --- | --- |
| Rebate citation s.156 ITA 2025 (was s.157/"Act 2026"); s.157 = arrears only | `src/engine/tax.ts`, i18n how-computed strings | **VERIFIED 2026-08-23** (ITA 2025 PDF) |
| SD + PT deduction §19 · 80C cap §123 · new regime §202 | `src/engine/tax.ts`, `src/engine/salary.ts` comments | VERIFIED 2026-08-23 (ITA 2025 PDF) |
| FY 2026-27 slabs, rebate amounts, cess, surcharge | `src/engine/tax.ts` | Golden-tested; last verified 2026-07-20 |
| Gratuity: eligibility §2A, payable years §4(2), ₹20L cap §4(3), 190/240-day rule | `src/engine/gratuity.ts` | VERIFIED 2026-08-23 (PGA 1972 PDF + S.O. 1420(E)) |
| Punjab State Development Tax ₹2,400 | `src/engine/professionalTax.ts` | VERIFIED 2026-08-23 (PSDT Act 2018); other listed states stay ₹0 + `PT_AMOUNT_UNVERIFIED` by design |
| EPF 12% / ₹15,000 wage ceiling | `src/engine/salary.ts` | Candidate |
| Gratuity accrual 4.81% of basic | `src/engine/salary.ts` | Candidate |
| HRA exemption three limbs (Rule 2A) | `src/engine/salary.ts` `hraExemptionAnnual` | Candidate |
| Joining-bonus tax delta (gross-repay convention) | `src/engine/clawback.ts` | Candidate; contractual |
| ESOP perquisite at exercise | `src/engine/esop.ts` | Candidate; CA R3 |
| PF premature withdrawal TDS (s.192A / s.392(7)) | `src/engine/epf.ts` | Candidate; **no TDS rupee computed** — trap flagged, transfer recommended |
| Relocation PT table | `src/engine/professionalTax.ts`, `src/engine/relocation.ts` | Incomplete by design (unverified states → ₹0) |
| Decoder in-hand (uses the engine) | `/decoder/` | Shipped; inherits row statuses above |

Rules-last-verified chip: `src/data/rules.ts` → footer. Stale engine should look stale.

## Gates

Local and CI: `test` · `typecheck` · `lint` · `build` · `check:base` · `check:seo` · `check:csp`.
Never merge to `main` without Kalpit — `main` is production.
