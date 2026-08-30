# AGENTS.md — Switch Karle

A free, open-source toolkit for the Indian job switch. React 19 + TypeScript, a
pure-TypeScript tax engine, PWA. Local-first: as of 2026-08-30 there is still no
backend and no analytics, but that is now a default rather than a boundary — see
`PRIVACY.md`. Owner: **Kalpit** — he owns product decisions, you own technical
execution. He is a non-developer, so lead with one plain-English line before any
technical block.

## Where direction lives

**`ROADMAP.md` in this repo.** Now, Next, Later, and what is settled. Read it
before you start and answer "what's next" from it. Kalpit owns it: agents never
edit it, they propose changes in a handoff and he applies them.

Its **Settled** section is not advisory. Those questions were decided, and some
have already been re-raised more than once. Re-opening one wastes his time.

The *reasoning* behind the roadmap is Kalpit's own and not all of it is public.
This repo is public; his notes are not. So when the roadmap does not answer a
question, **ask him rather than inventing direction** from what you find here.

Three earlier strategy documents (`docs/AGENT-HANDOFF.md`, `docs/BLUEPRINT.md`,
`docs/HUNT_OS_STRATEGY_BLUEPRINT.md`) were superseded and deleted from git in
August 2026. **Any document claiming to be product direction is stale unless it
is `ROADMAP.md`.** What lives here instead: `docs/ARCHITECTURE.md` (living
technical truth) and `docs/MASTER_IMPROVEMENT_PLAN.md` on the
`docs/master-implementation-plan` branch (executed quality-cycle record —
history and parked items, not direction). Do not add a second strategy
document. Partial restatements drift, and drifting duplicates once produced
three contradicting roadmaps in a single day.

All docs are subordinate to the code: verify against the repo before believing
any of them, including this one.

## Never do these five things

1. **Never merge to `main`.** Branch → PR → Kalpit merges. Merging deploys to
   production. No force-push, no branch deletion without his say-so.
2. **Never move user data without the user having turned on a named feature
   that needs it, and never sell or share it with anyone.** See `PRIVACY.md`
   for the full test. The absolutist version of this rule — nothing leaves the
   device, ever — was retired 2026-08-30; local-first is now the default rather
   than the boundary.
3. **Never ship a statutory number or legal claim untraced to a primary
   source.** Not from memory, not from another AI, not from a tax blog.
4. **Never ship a tool in English only.** EN and HI both, or it does not ship.
5. **Never start distribution activity** — no promotion, no Search Console, no
   analytics, no SEO submission. Building *so distribution is easy later* is
   required; *doing* it is not authorised.

**Statutory citations (synced 2026-08-23).** The old s.157/"Act 2026" rebate
defect is fixed on `quality/suite-pass` against the official Income-tax Act,
2025 PDF — see the `VERIFIED:` markers in `src/engine/tax.ts`. Standing rule
unchanged: never touch a statutory number, citation, or legal claim without a
primary source (Act / notification / circular), never a blog or another AI.
Unresolved constants stay marked `CANDIDATE` and wait for a human chartered
accountant. Living status table: `docs/ARCHITECTURE.md`.

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

Every `en.ts` key needs a non-blank Hindi pair (`hi.ts` + `hi-suite.ts`). Do not
delete or blank keys in `hi.ts`. `/hi/<slug>/` twins are first-class; do not
occupy the `hi` slug.

## The one architectural rule

`src/engine/**` is **pure TypeScript, React-free, and golden-case tested.** UI
imports the engine; the engine never imports UI. Every calculation lives there
as a pure function with hand-derived tests written before any component exists.
