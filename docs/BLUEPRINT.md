# Switch Karle — Product Blueprint

> **Direction of record, 2026-08-22 (owner):** Switch Karle is a personal product,
> built for Kalpit's own job switch and as a showcase of dev craft. The
> "iLovePDF of job switching" comparison is about **quality, polish, and breadth
> of micro-tools** — not distribution. Distribution is deferred, not cancelled.
> This blueprint covers the journey audit, the tool suite map, and the
> architecture that keeps adding tools cheap.
>
> A parallel earlier draft lives on `claude/expansion-strategy`
> (`docs/AGENT-HANDOFF.md`). It is untouched; reconciliation between the two
> takes is an owner call.

## 1. What Switch Karle is

One line: **a suite of instant micro-tools that decode every money moment and
painful step of an Indian job switch — entirely on-device.**

It is not: a job board, a LinkedIn/Naukri competitor, a SaaS platform with
accounts, or a resume builder.

The iLovePDF lesson worth keeping is a *quality* lesson, not a growth one.
Their moat: each tool does exactly one job, answers in seconds, asks for
nothing (no signup, no upload anxiety), and works on any device. Switch Karle
already embodies this; the bar below makes it explicit so tool #15 ships as
tight as tool #1.

## 2. The quality bar — every tool, every time

1. **One screen, one job.** Input → answer on the same view, value within ~10
   seconds of opening the tab. No wizards, no "create account to continue".
2. **Every number explained.** A plain-language line under each figure — the
   Decoder's existing promise, extended to all calculators. Explanations are
   part of the engine's output objects, not a UI afterthought.
3. **India-native defaults.** 60/90-day notices, CTC conventions (variable %,
   employer-PF-in-CTC), state professional tax, FY labels (2026–27), gratuity
   and leave rules pre-loaded.
4. **Engine before UI.** Pure TypeScript functions in `src/engine/<tool>.ts`
   with golden-case tests before any component exists. Same discipline as
   `engine.test.ts`.
5. **EN + HI from day one.** Namespaced keys per tool; professional workplace
   register; domain terms (CTC, PF, HRA, ESOP) stay in English per existing
   convention.
6. **Offline-capable, private by construction.** PWA precache stays valid;
   state in namespaced localStorage (`switchkarle.<tool>.vN`) with JSON
   export/import wherever there is meaningful state.
7. **Nothing leaves the device.** No server calls, no accounts, no AI API
   calls — BYO-AI prompt generation instead, wired to the user's own data.
8. **If the output is worth showing someone, one tap shares it.** Image card
   (existing `html-to-image` pattern) or copy-ready text block.

Rule 8 doubles as the future growth loop: share artifacts built now cost
nothing extra and are the viral surface if distribution ever unparks.

## 3. Journey & gap audit

Eight phases of an Indian job switch. For each: what the candidate actually
experiences, what exists today, and the verdict.

### P1 — Trigger ("should I switch?")
Appraisal disappointment, peer salary envy, market-scrolling at midnight.
Landscape: AmbitionBox/Glassdoor benchmarks are noisy and self-reported;
CTC→in-hand calculators are a commodity owned by ClearTax/Groww/ETMoney/
AmbitionBox — generic finance-site framing, zero offer context.
**Verdict:** don't fight the commodity query. Win on honest math framed for
the decision: hike measured in-hand vs in-hand, not CTC vs CTC.

### P2 — Getting discovered
Naukri profile freshness, recruiter keyword filters, referrals.
Landscape: resume builders are saturated (Zety, Canva, Novoresume, dozens of
Indian clones); profiles are owned by Naukri/LinkedIn themselves.
**Verdict:** skip. Commodity, off-brand, no engine underneath.

### P3 — Interview loop
Scheduling around a 60–90 day notice job, the notice-period disclosure
dilemma, juggling pipelines.
Landscape: pipeline trackers exist but none India-native.
**Verdict:** Tracker already covers this. Add only the disclosure-scripts gap.

### P4 — Offer decode & negotiate ← current strength
The offer email arrives; CTC looks big; reality doesn't match.
Landscape: generic calculators stop at gross/net. Nobody scans offer terms,
models variable risk, or prices ESOPs honestly.
**Verdict:** deepest moat. Decoder + red-flag scanner + truth card shipped;
comparison and the remaining economics gaps are Wave 1 below.

### P5 — Resignation
The conversation everyone dreads, then the letter.
Landscape: ~10 thin resignation-letter generator sites (workrightsindia,
edesy.in, apnatool.in, vurzel.com, tooln.in, esparx.in…) prove demand; all are
disconnected one-offs with no context about your actual offer, LWD math, or
the harder conversation with the manager.
**Verdict:** table-stakes letter generator differentiated by wiring (tracker
data, LWD auto-math, tones) plus what nobody builds: the talk script and
counter-offer defense.

### P6 — Serving notice / buyout economics
Three months in limbo; new employer wants you sooner; someone must pay for
that.
Landscape: **nobody owns this anywhere.** Buyout amounts are negotiated blind;
leave encashment math surprises people; handover docs are ad-hoc.
**Verdict:** the most under-served *money* moment of the whole journey. High
dogfood value — this is where Kalpit is right now.

### P7 — Exit formalities
Full & final settlement, relieving letter chase, PF transfer, insurance gap.
Landscape: scattered blog advice; EPF portal pain is legendary (employer-name
seed mismatches, rejected claims); F&F shortfalls go unnoticed because nobody
recomputes entitlements.
**Verdict:** paperwork corridor with real money leaking through it. The F&F
checker is a flagship nobody else has.

### P8 — Landing at the new place
Background verification, document hunts, fresh tax declarations.
Landscape: checklist blog posts; nothing interactive.
**Verdict:** small, cheap, high-relief tools. Good cadence fillers.

## 4. Tool suite map

Complexity: S = one session incl. tests; M = 1–2 sessions; L = multi-session.
"Exists" items are shipped today.

| # | Tool | Job-to-be-done | Complexity |
|---|------|----------------|-----------|
| ✅ | Decoder + breakdowns | CTC → true in-hand, both regimes, cheaper regime flagged | done |
| ✅ | Red-flag scanner | 90-day notices, bonds, clawbacks, inflated variable → negotiation lines | done |
| ✅ | Truth card | Shareable image of what the offer really pays | done |
| ✅ | Tracker | Application pipeline, India-native fields | done |
| ✅ | Prompt Studio | BYO-AI prompts wired to tracker data | done |
| 1 | **Offer Comparison** | Two offers side-by-side in in-hand truth; delta table; verdict line (README roadmap #6) | M |
| 2 | Real Hike Calculator | Current vs new measured in-hand-to-in-hand; exposes "30% hike" that is 12% in hand | S |
| 3 | Variable Pay Reality Check | 0%/50%/100% payout scenarios; fixed-vs-at-risk split | S |
| 4 | Joining Bonus Clawback Check | Clawback window vs tenure plan → effective bonus value | S |
| 5 | ESOP Reality Check | Grant/strike/FMV/exercise cost; liquidation-overhang honesty | M–L |
| 6 | Relocation Equivalence | ₹X in Bangalore ↔ ₹Y in Pune/Indore via rent, PT, tax deltas | M |
| 7 | Manager Conversation Script | The talk before the letter; presets (friendly boss, counter-risk, toxic shop) | S |
| 8 | Resignation Letter Generator | Tracker-aware fields, LWD auto-math, tones, copy/print | S |
| 9 | Counter-Offer Defense Pack | Evaluate the counter; response scripts; walk-away framework | S |
| 10 | Leave Encashment Calculator | Balance × daily rate; 26-day basis nuance; §10(10AA) note | S |
| 11 | Handover Doc Generator | Structured KT doc → markdown/copy | S |
| 12 | Notice Period Survival Tracker | Dates + checklist: F&F submission, assets, insurance end, PF marks | M |
| 13 | **F&F Settlement Checker** | Payslip line items vs recomputed entitlements → shortfall flags + dispute draft | L |
| 14 | Gratuity Calculator | 4y+240d eligibility, 15/26 formula | S |
| 15 | EPF/UAN Transfer Guide | Interactive checklist: UAN activation, seed mismatch fixes, rejection reasons, progress state | M |
| 16 | Relieving Letter Chaser | Escalation ladder emails (day 7/14/30) | S |
| 17 | Insurance Gap Planner | Group cover ends on LWD → bridge timeline + floater cost factors | S |
| 18 | BGC Document Checklist | By company type (IT services/GCC/startup/MNC); address-proof pitfalls | S |
| 19 | Tax Declaration Planner | New-co declarations: regime choice with real numbers, HRA plan, proof calendar | M |

**Explicitly not building:** resume builders/ATS scorers, cover letters, job
aggregators, LinkedIn automation, interview-question banks, AI chatbot
wrappers. All commodity, all off-brand, none need a tested engine.

## 5. Build order & cadence

- **Foundation first (one session): registry-lite refactor.** Typed registry
  drives the nav/tabs; adding a tool becomes a config entry. No router — see
  §6. Doing this before Wave 1 means no retrofit across 19 tools later.
- **Then one tool per session**, ordered by live dogfood pain: build what the
  hunt needs that week. Default sequence when pain is silent: Wave 1 order
  (comparison → hike → buyout economics via #2/#3/#10) → P6/P7 tools.
- Every session: engine golden tests → UI → EN/HI strings → PR. Quality-bar
  checklist pasted into the PR description.
- Waves 2–4 tools are small by design; they keep shipping rhythm visible and
  the showcase honest.

## 6. Architecture strategy

**Client-side purity stays.** No server is not just privacy positioning — it
removes the entire ops/cost/compliance surface for a solo builder and forces
tools into testable pure functions. Keep it even when features tempt otherwise
(see open questions).

- **Tool registry (`src/tools/registry.ts`).** One typed array:
  `{ id, titleKey, icon?, component }`. `App.tsx` renders nav buttons and
  content from it. Tab state keeps localStorage persistence. When distribution
  unparks, each id graduates to a route/slug with zero structural change.
- **Engine layer.** Pure functions, no React imports, golden cases per tool
  (`<tool>.test.ts` against hand-computed values). Result objects carry
  explanation strings keyed for i18n.
- **Shared UI primitives.** Extend `components/ui.tsx` (inputs, cards, result
  rows) rather than per-tool styling drift. Tailwind tokens stay canonical.
- **State.** Namespaced localStorage keys, versioned suffix (`.vN`), JSON
  export/import for anything stateful (Tracker pattern generalizes).
- **i18n.** `en.ts`/`hi.ts` gain a namespace per tool; i18n test extends to
  fail on missing keys.
- **PWA.** Precache list grows per tool automatically via the Vite build;
  verify offline after each addition.
- **Share artifacts.** Generalize `ShareCard.tsx` into a `shareImage(node)`
  util any tool can call.

**Open questions (parked, decide when they bite):**
- Analytics: currently none. If measurement is ever needed, cookieless
  Cloudflare Web Analytics is the only stance compatible with the privacy line.
- Cross-device sync: localStorage binds data to one device. Any sync feature
  implies an account/backend — contradicts purity. Defer until the pain is
  personal and real.
- Monetization: nothing now. If ever, freemium on exports/history — same
  backend contradiction as sync; revisit together.

## 7. Parked — distribution appendix (research preserved)

Kept here so none of today's findings is lost when distribution day comes.

**Market facts (Aug 2026 research):**
- iLovePDF: ~250M visits/month, ~76% organic, freemium ($4/mo tier + ads),
  ~16-person team. **India is its #1 country (~22% of traffic).** Model: one
  tool = one URL targeting one exact query ("pdf to word", 7M+ monthly volume).
- Indian micro-tool SEO demonstrably works: resignation-letter generators rank
  as standalone pages across ~10 small sites.
- Commodity queries ("salary calculator india") are owned by high-authority
  fintech domains — unwinnable head-on; long-tail intent
  ("90-day notice period buyout calculator") is where a niche brand wins.

**Loops designed in now, for free:** per-tool slugs in the registry, shareable
output cards (quality-bar rule 8), BYO-AI prompts (unique differentiator).

**Prerequisites when unparked (in order):** dedicated domain (subpath on
kalpit.me splits link equity) → router + static prerender per tool → sitemap +
per-page meta/OG → cookieless analytics → programmatic pages computed from the
engines (pre-computed "₹X LPA → in-hand" tables, state PT pages) → embeddable
calculator widgets for backlinks.
