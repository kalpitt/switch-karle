# AGENTS.md — Switch Karle

A free, open-source toolkit for the Indian job switch. Astro 7 static site with
React 19 islands, TypeScript, a pure-TypeScript tax engine, PWA. Live at
`switchkarle.fyi`. Local-first: as of 2026-08-30 there is still no
backend and no analytics, but that is now a default rather than a boundary — see
`PRIVACY.md`. Owner: **Kalpit** — he owns product decisions, you own technical
execution. He is a non-developer, so lead with one plain-English line before any
technical block.

## Where direction lives

Two files, both owned by Kalpit. **Agents never merge a change to either one.**
Since 2026-11-07 an agent may propose an edit as its own pull request, labelled
as a direction change, and only Kalpit merges it.

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

1. **Never merge to `main` unless every check is green, and never merge
   certain changes at all.** Merging deploys to production. Since 2026-11-13
   an agent may merge its own pull request when `check` and `e2e` have passed
   on its latest commit and it has no conflict, then must watch the deploy and
   its smoke test and revert if either fails. Only Kalpit merges a pull
   request that touches `PRODUCT.md`, `ROADMAP.md` or `PRIVACY.md`, changes
   what data is stored or sent, or changes a statutory number, citation or
   legal claim. No direct push to `main`, no force-push, no branch deletion
   without his say-so.
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

**Statutory numbers.** A constant's status sits beside its code as a
`VERIFIED:` or `CANDIDATE` marker; the living table is in
`docs/ARCHITECTURE.md` ("Statutory constants"), and what the user sees comes
from `src/data/sources.ts`. Change a marker only with the primary source (Act,
notification, circular) in hand, then update its `sources.ts` entry and the
table in the same pull request. Unresolved constants stay `CANDIDATE`.

## How to work here

- **Check before you believe.** Docs, old audit reports and notes from earlier
  sessions describe a past state. Verify against `main` and the open pull
  requests before acting on any of them.
- **One pull request, one purpose.** A change to `PRODUCT.md` or `ROADMAP.md`
  goes in its own pull request, never mixed with code.
- **Record owner decisions the day they are made.** When Kalpit decides
  something, add a dated entry to `docs/DECISIONS.md` in the pull request that
  acts on it. A decision that lives only in a chat or an agent's notes is lost
  to the next session; the 2026-10-31 and 2026-11-07 decisions were, until
  2026-11-13.
- **Update the doc with the code.** A change to routes, storage keys, shared
  records, the service worker or a statutory marker updates
  `docs/ARCHITECTURE.md` in the same pull request. A change to how deploys or
  the smoke test work updates `DEPLOY.md`.
- **Do not add files to the repo root or `docs/`** beyond the ones in the
  table above plus `README.md` and `DEPLOY.md`. Audit reports, plans and
  hand-off notes do not belong in this repo.
- **Questions for Kalpit:** ask once, in plain words, with a recommendation.
  Keep working on whatever does not depend on the answer.

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
npm run test:e2e   # Playwright on the built dist/: every route EN+HI, key flows
```

`test:e2e` needs a build first and a Chromium (`npx playwright install
chromium` once). CI runs it as its own job on every PR.

`test`, `typecheck`, `lint`, `build`, `check:base`, `check:seo`, `check:csp`,
and `test:e2e` must pass before you open a pull request. This list is the one
home for the gates; `.github/workflows/ci.yml` runs the same ones. How a deploy,
the production smoke test and a rollback work: `DEPLOY.md`.

`npm run new-tool <slug>` scaffolds a tool; the loop it follows is in
`docs/ARCHITECTURE.md`.

Every `en.ts` key needs a non-blank Hindi pair (`hi.ts` + `hi-suite.ts`). Do not
delete or blank keys in `hi.ts`. `/hi/<slug>/` twins are first-class; do not
occupy the `hi` slug.

## The one architectural rule

`src/engine/**` is **pure TypeScript, React-free, and golden-case tested.** UI
imports the engine; the engine never imports UI. Every calculation lives there
as a pure function with hand-derived tests written before any component exists. Engines
return ids, never English; the UI maps them through `t()`.
