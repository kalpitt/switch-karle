# AGENTS.md — Switch Karle

A free, open-source, on-device toolkit for the Indian job switch. React 19 +
TypeScript, a pure-TypeScript tax engine, PWA, no backend and no analytics by
design. Owner: **Kalpit** — he owns product decisions, you own technical
execution. He is a non-developer, so lead with one plain-English line before any
technical block.

## The plan is not in this repo

**Canonical plan: §A of**
`personal-os/context/handoffs/2026-08-22-switch-karle-master-roadmap-v2.md`
— on Kalpit's machine at `/Users/kalpit/Documents/GitHub/personal-os/`. Raw
source material sits beside it in `2026-08-22-switch-karle-source-doc-salvage.md`.

`personal-os` is a **separate private repo**. If you cannot read it, **stop and
ask Kalpit.** Do not invent direction from what you find in this repo.

Three earlier strategy documents (`docs/AGENT-HANDOFF.md`, `docs/BLUEPRINT.md`,
`docs/HUNT_OS_STRATEGY_BLUEPRINT.md`) were superseded and deleted from git in
August 2026. **Any document claiming to be the plan is stale unless it is §A.**
All three also referenced paths and npm scripts that never existed — verify
against the code before believing any document, including this one.

## Never do these five things

1. **Never merge to `main`.** Branch → PR → Kalpit merges. Merging deploys to
   production. No force-push, no branch deletion without his say-so.
2. **Never let user data leave the device except by the user's own action.**
   See `PRIVACY.md`. This is the product, not a preference.
3. **Never ship a statutory number or legal claim untraced to a primary
   source.** Not from memory, not from another AI, not from a tax blog.
4. **Never ship a tool in English only.** EN and HI both, or it does not ship.
5. **Never start distribution activity** — no promotion, no Search Console, no
   analytics, no SEO submission. Building *so distribution is easy later* is
   required; *doing* it is not authorised.

**Live landmine.** `src/engine/tax.ts` and `src/i18n/en.ts` cite the new-regime
rebate as "s.157 of the Income-tax Act 2026". It is probably wrong — five
secondary sources say Section 156 of the Act 2025. The computed values are
correct and golden-tested, so this is a citation defect, not a math defect.
**Do not fix it.** It is waiting on a chartered accountant's review, not on an
AI's opinion. The same holds for every other statutory constant in the engine.

## Commands

```bash
npm install
npm run dev        # Astro dev server
npm test           # vitest — engine goldens, i18n freeze, purity
npm run typecheck  # tsc -b --noEmit
npm run lint       # oxlint
npm run build      # astro build
npm run check:base # asset URLs under the configured base
npm run check:seo  # canonical + OG; no analytics in dist/
```

`test`, `typecheck`, `lint`, `build`, `check:base`, and `check:seo` must pass
before you push to `build/suite`. Merging to `main` deploys — only Kalpit does
that.

On `build/suite`, new tools are English-only until the Hindi pass. Do not delete
or blank keys in `hi.ts`. Do not add `/hi/` routes yet.

## The one architectural rule

`src/engine/**` is **pure TypeScript, React-free, and golden-case tested.** UI
imports the engine; the engine never imports UI. Every calculation lives there
as a pure function with hand-derived tests written before any component exists.
