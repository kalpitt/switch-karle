# AGENTS.md — Switch Karle

A free, open-source toolkit for the Indian job switch. React 19 + TypeScript, a
pure-TypeScript tax engine, PWA. Local-first: as of 2026-08-30 there is still no
backend and no analytics, but that is now a default rather than a boundary — see
`PRIVACY.md`. Owner: **Kalpit** — he owns product decisions, you own technical
execution. He is a non-developer, so lead with one plain-English line before any
technical block.

## Where direction lives

Two files, both owned by Kalpit. **Agents never edit either one** — propose
changes in a handoff and he applies them.

- **`PRODUCT.md`** — what this is, who it is for, where their journey starts and
  ends, what we do at each stage, and what we refuse to do. Read it first. It
  outranks any inference you could draw from the code.
- **`ROADMAP.md`** — what to build next. Now, Next, Later, and what is settled.
  Answer "what's next" from it.

`ROADMAP.md`'s **Settled** section is not advisory. Those questions were decided,
and some have already been re-raised more than once. Re-opening one wastes his
time.

The *reasoning* behind both is Kalpit's own and not all of it is public. This
repo is public; his notes are not. So when neither file answers a question,
**ask him rather than inventing direction** from what you find here.

### One home per fact

Every fact has exactly one canonical file. Write it there or nowhere. A fact
stated twice will drift, and drifting duplicates once produced three
contradicting roadmaps in a single day.

| Question | File |
|---|---|
| What is this, who is it for, what does it do at each stage | `PRODUCT.md` |
| What do we build next | `ROADMAP.md` |
| How do agents work here | `AGENTS.md` |
| How does the code work | `docs/ARCHITECTURE.md` |
| What was decided, when, and why | `docs/DECISIONS.md` |
| What do we promise about data | `PRIVACY.md` |

**If you are about to write a document explaining what this product should be,
stop.** That document is `PRODUCT.md` and Kalpit owns it. Three strategy
documents were deleted from git in August 2026 for this reason; two more appeared
unbidden in September, one declaring itself "Authoritative Reference Document"
while proposing to reverse decisions only he makes. **Any document claiming to be
product direction is stale unless it is `PRODUCT.md` or `ROADMAP.md`.**

All docs are subordinate to the code: verify against the repo before believing
any of them, including this one. If a document and the code disagree, say so —
do not silently pick one.

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
npm run check:csp  # CSP meta + hashes; no off-origin subresources
```

`test`, `typecheck`, `lint`, `build`, `check:base`, `check:seo`, and `check:csp`
must pass before you open a pull request. Merging to `main` deploys — only
Kalpit does that.

Every `en.ts` key needs a non-blank Hindi pair (`hi.ts` + `hi-suite.ts`). Do not
delete or blank keys in `hi.ts`. `/hi/<slug>/` twins are first-class; do not
occupy the `hi` slug.

## The one architectural rule

`src/engine/**` is **pure TypeScript, React-free, and golden-case tested.** UI
imports the engine; the engine never imports UI. Every calculation lives there
as a pure function with hand-derived tests written before any component exists.
