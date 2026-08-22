# Switch Karle — full handoff for the building agent

Written 2026-08-22 by a Claude (Fable 5) strategy session, for whichever
agent builds next. Self-contained: everything you need is in this file plus
the repo itself. Read this top to bottom before writing code.

---

## 1. Mission and direction (settled, do not re-litigate)

Switch Karle is a free, open-source, 100% client-side toolkit for the Indian
job switch, live at https://kalpit.me/switch-karle/. Owner: Kalpit
(non-developer product owner shipping through AI agents — see §9).

**The direction, settled 2026-08-22 after two course corrections:**

- Build the **"iLovePDF of job switching in India"** — where that comparison
  means the *breadth and quality of micro-tools*, NOT distribution.
- Two purposes, in order: (1) a product Kalpit uses in his own job hunt,
  (2) a public showcase of what he can ship. The repo is already public and
  the app is already reachable; "distribution parked" means no promotion, no
  SEO campaign, no domain purchase, no analytics — not secrecy.
- **Distribution comes later, deliberately.** Do not propose SEO pages,
  share-card campaigns, domains, or analytics. The thinking for that phase
  is already written down (§8) so it survives; it is parked.
- History you must not trip over: on 2026-08-18 Kalpit killed a
  "distribution is the whole game" framing and deleted branches pushing it.
  On 2026-08-22 he defined the current build-first direction. If you find
  old docs or plans mentioning "Chhalaang portal" or distribution-first
  strategy, they are superseded.

**The strategic bet:** every tool is one URL that answers one painful,
India-specific question in under a minute — no account, no server, offer
data never leaves the device. The tax engine, the red-flag knowledge base,
and the professional Hindi register are the assets everything builds on.

## 2. What exists today (verified 2026-08-22)

Stack: Vite + React + TypeScript (strict), vitest, PWA (manifest +
`public/sw.js`), no backend, no analytics, MIT license.

- **Decoder** — CTC structure in, truth out: in-hand under both tax regimes
  (FY 2026-27 rules), cheaper regime recommended, every number explained.
- **Red-flag scanner** (`src/engine/redFlags.ts`) — 90-day notice, bonds,
  inflated variable, gratuity-in-CTC, illiquid ESOPs, clawbacks; each flag
  carries context + one concrete negotiation line.
- **Truth card** (`src/components/ShareCard.tsx`) — shareable image.
- **Tracker** (`src/components/Tracker.tsx`, 471 lines, + `src/tracker/`) —
  kanban pipeline, India-native fields (CTC discussed, notice/buyout, F&F),
  localStorage with JSON export/import.
- **Prompt Studio** — BYO-AI prompts (user pastes into ChatGPT/Claude),
  including offer-letter → Decoder auto-fill (`src/prompts/offerImport.ts`).
- **i18n** — full EN/HI (`src/i18n/`), flat string dictionaries, `useT()`
  hook, language persisted locally. Register rule: professional Indian
  workplace Hindi; domain terms (CTC, PF, HRA, ESOP, notice period) stay in
  English script.

**Engine API** (`src/engine/`, pure TS, no React imports — keep it that way):

- `decodeOffer(input: OfferInput): SalaryBreakdown` (`salary.ts`) — the main
  entry. `OfferInput` covers basic/HRA/special/variable/EPF options/gratuity/
  ESOP grants/joining bonus/bond/state.
- `computeTax(taxable, regime): TaxBreakdown` (`tax.ts`) — slabs, rebate
  with marginal relief, surcharge tiers, 4% cess, per-regime standard
  deduction.
- `professionalTax.ts` (state-wise, approximate), `format.ts` (₹ and lakh
  formatting), `redFlags.ts`.
- **`engine.test.ts` (135 lines) is golden-case tests against hand-computed
  numbers. This is the law.** Any engine change must keep them green; any
  new engine function needs the same style of hand-verified golden cases.

**Deploy** (`DEPLOY.md`): GitHub Pages via `.github/workflows/pages.yml`
(builds, tests, deploys on push to main). Path-relative build (`base: './'`
in `vite.config.ts`) so one artifact serves both at the kalpit.me subpath
and the Cloudflare mirror root. **Merging to main = deploying.**

Commands: `npm install`, `npm run dev`, `npx vitest run`, `npm run build`.

## 3. Hard rules (never violate)

1. **No one but the user can ever read their data.** (Reworded 2026-08-22
   from "100% client-side, forever" to permit cross-device sync.) The
   privacy promise is absolute; the no-server part is an implementation
   choice, not the rule. Allowed: local-only storage (default), sync
   through storage the user owns (their GitHub, via PAT in localStorage —
   the pattern Kalpit's personal-os console uses), and — distribution-era
   only — end-to-end encrypted sync where any server stores ciphertext it
   cannot decrypt. Forbidden forever: accounts on our side, any backend
   that can read user data, sending offer/tracker data to any third party.
   AI features stay BYO-prompt (generate text the user pastes into their
   own AI). Only the Tracker has state worth syncing; calculators stay
   stateless.
2. **No analytics, no trackers** — until Kalpit explicitly reopens
   distribution.
3. **Engine purity.** `src/engine/` stays pure TypeScript, React-free,
   golden-case tested. UI imports engine, never the reverse.
4. **Bilingual is not optional.** A tool ships with EN and HI complete, in
   the register described in §2, or it doesn't ship.
5. **Never merge to main yourself.** Branch → PR → Kalpit merges (and main
   auto-deploys, which is exactly why). No force-push, no deleting branches
   without his sign-off.
6. **Numbers carry disclaimers.** Everything is "estimate, not tax/legal
   advice; verify with your CA/finance team" — the existing app does this;
   keep the pattern on every new calculator.
7. **Preserve the path-relative build.** No absolute URLs/paths in code or
   the service worker; test that `npm run build` output works under a
   subpath.

## 4. Quality bar — what "done" means for a tool

Craft over count: **8–10 deep tools beat 17 shallow ones.** A reviewer of
Kalpit's capability will open the README, the engine tests, and one tool.
Ship a tool only when ALL of these hold:

- Answers its one question above the fold, correct numbers, edge cases
  handled *and explained in the UI* (e.g. "why is my buyout on basic, not
  gross?").
- Engine logic is a pure function with hand-computed golden-case tests.
- EN + HI both read natively. Mobile-first layout (most users are on phones).
- Result explains itself line by line — the Decoder's "every number
  explained" pattern is the house style.
- README's tool table updated; the tax/legal reasoning documented beside the
  code (a short `docs/` note or rich code comments where statutory rules
  live).
- Works offline (PWA), works under the subpath, `npx vitest run` and
  `npm run typecheck` green.

Definition of done for the product overall: Kalpit uses it in his own hunt.
He set a **7-evening personal-use test** — build in the order his hunt needs
(§6) so every tool gets one real user before it counts.

## 5. Do this first: per-tool URLs (the one architecture change)

Today the app is one SPA with tabs = one URL. Before building new tools,
restructure so **each tool is its own route, statically prerendered**:
`/decoder`, `/tracker`, `/hike-calculator`, `/notice-buyout`, … with `hi/`
variants (or a lang toggle that rewrites the path).

Why now, even with distribution parked: cheap at 3 tools, expensive to
retrofit under 10; each tool becomes individually linkable/bookmarkable
(personal use benefits too); it is itself showcase material; and it makes
the parked distribution phase a config change instead of a rewrite.

Implementation guidance (decide in-session, propose in the PR):
- Least-change path: React Router + a prerender step over the existing app.
- Cleaner long-term: Astro shell with React islands; `src/engine` untouched.
- Either way: home page becomes a tool directory (the iLovePDF grid);
  keep the PWA working; keep `base: './'` semantics.
- This is the one task worth a frontier-tier model (architecture +
  first-pass UX). Tool implementation after it is Sonnet-tier work.

## 6. Build order and tool specs

### Wave 1 — calculators (engine mostly exists; Kalpit's hunt needs them)

1. **Offer Comparison** — two `OfferInput`s side by side, decoded in-hand vs
   in-hand, differences highlighted, one verdict line. CTC-vs-CTC is
   meaningless when one offer stuffs gratuity + ESOP and the other is cash;
   this shows it. (Was already item 6 on the README roadmap.)
2. **Hike Calculator** — the killer insight: *CTC hike % vs in-hand hike %*.
   "30% hike on paper, 21% in your bank" after variable pay, structure
   games, and slab/surcharge effects. Runs `decodeOffer` twice; mostly UI.
3. **Notice Period Buyout Calculator** — buyout = per-day salary × unserved
   days; the fight is the base: **basic-only vs gross convention** (toggle,
   explain both, note the offer/appointment letter decides). Cover: who
   pays (self vs new-employer reimbursement), leave adjustment against
   notice, and that tax treatment of notice-pay recovery is genuinely
   disputed — present it as such, don't invent certainty.
4. **Gratuity Calculator** — 15/26 × last drawn (basic+DA) × completed
   years; the **"4 years 240 days counts as 5"** judicial rule surfaced
   prominently (it changes real decisions about when to resign).
5. **F&F / Leave Encashment Estimator** — last working month salary + leave
   encashment + gratuity (if eligible) + pro-rata variable (if any) − notice
   recovery − clawbacks. People sign full-and-final blind; nothing good
   exists here.

### Wave 2 — documents and scripts

6. **Resignation Letter Generator** — EN/HI, three tones (standard /
   grateful / strictly formal), notice-date math built in (resignation date
   + notice period → last working day), copy + print/PDF. The
   most-searched document of the journey.
7. **HR Scripts Library** — fill-in-the-variable scripts, each its own URL:
   expected-CTC answer (avoid anchoring low without disqualifying),
   early-release ask, buyout negotiation, declining an accepted offer
   without burning the bridge, counteroffer response, recruiter follow-up.
8. **Counteroffer Evaluator** — current employer matched the number: rupee
   delta + the non-rupee factors, honest framing of why counteroffer
   acceptors often still leave within a year.
9. **BGV Prep Checklist** — a few questions in (employment gaps?
   moonlighting-era dual PF? relieving letter pending?) → personalized
   "what background verification will see and what to prepare". Client-side.

### Tracker cross-device sync (owner-approved 2026-08-22; slot after Wave 1)

Kalpit's use case: update the pipeline on the phone, continue on the laptop.
Two phases, both within hard rule 1 as reworded:

- **Sync-a: painless manual transfer, zero backend.** Export/import already
  exists; add one-tap "send to my other device" (Web Share API file share)
  and/or a QR-code / copy-paste blob — tracker data is tiny. ~An evening.
- **Sync-b: sync through the user's own GitHub.** Private gist or repo,
  written with a PAT the user pastes once (stored in localStorage only,
  never in code — same pattern as Kalpit's personal-os console). Data lives
  in the user's GitHub, no server of ours. Handle merge conflicts simply:
  last-writer-wins with a visible "synced at" stamp is enough at this scale.

E2E-encrypted sync via a Worker (for non-GitHub users) is deliberately
parked with distribution — see below.

### Wave 3 — the unserved transition tools (hardest, most valuable)

10. **Two-Form-16 Tax Shock Estimator** — the April sting: both employers
    applied the standard deduction and full slab benefit, so nearly every
    switcher owes extra tax at filing. Enter both employment stints, see the
    true year liability now. Hits every switcher; nobody frames it as a
    switching problem.
11. **EPF Transfer Wizard** — decision-tree walkthrough (Form 13 online,
    date-of-exit not marked by old employer, UAN name/DOB mismatch
    remedies). Content-heavy, calculator-light.
12. **ESOP Decoder** — vesting schedule math, perquisite tax at exercise on
    FMV, liquidity red flags for private companies.
13. **Fake Offer Scanner** — heuristics on an offer letter: deposit/fee
    asks (the #1 scam tell), free-mail or lookalike domains, pointers to
    EPFO establishment search and MCA company lookup for self-verification.

### Wave 4 — deepen, don't widen

Joining-bonus clawback cost, probation/bond clause scanner (extend
`redFlags.ts`), more states' professional tax, annual FY update of the tax
engine every February (the engine is FY-stamped).

### Parked with distribution — do NOT build now

Per-LPA in-hand pages ("15 LPA in hand"), hike-matrix pSEO pages, new
share-card variants, domain purchase, analytics, FAQ JSON-LD/SEO work, and
E2E-encrypted sync infrastructure (a Cloudflare Worker storing ciphertext
only, passphrase-derived key — for lay users without GitHub; free tier
likely suffices, anything beyond is a money gate).

## 7. Domain knowledge — the insight behind the tools

The full journey audit (10 phases, deciding → post-switch) is distilled
here; these are the India-specific truths the tools encode:

- People know their CTC, not their structure; every real question is an
  in-hand question. The regime choice (new vs old) changes answers, so
  every calculator shows both or recommends one, like the Decoder does.
- Recruiter funnel anchors on three questions — current CTC, expected CTC,
  notice period — asked in the first call; the answers decide the final
  offer more than the interviews do. Hence the scripts library.
- 60–90 day notice periods shape everything: switch timelines, buyout
  money, offer expiry pressure, and the counteroffer window.
- Exit money is opaque by design: F&F arithmetic, gratuity eligibility
  (esp. 4y240d), leave encashment, notice recovery. Candidates sign blind.
- The two-Form-16 tax hit is universal, invisible until July, and no
  incumbent frames it as a job-switch problem.
- EPF transfer is where switches go to die administratively (date-of-exit
  unmarked, KYC mismatches); a calm walkthrough beats any calculator.
- Fake offer letters (deposit asks) are epidemic at the fresher/mid level.
- Incumbents (ClearTax, Groww, AmbitionBox) own generic salary/tax
  calculators. The differentiation is the *switching frame* (hike truth,
  buyout, F&F, two-Form-16) plus privacy plus Hindi — not beating them at
  "income tax calculator".

**Accuracy discipline:** statutory numbers in this file (₹ thresholds,
exemption caps, slab details) are strategy-grade, from model memory — the
**source of truth is `engine.test.ts` and current FY rules you verify**
at build time. When a tool needs a statutory rule the engine doesn't yet
encode (leave-encashment exemption caps, gratuity caps, perquisite
valuation), verify against current official sources before hard-coding, and
record the source beside the code. Never ship a number you can't trace.

## 8. Distribution phase (parked — context only, so it's not re-invented)

When Kalpit reopens it, the plan already agreed: own domain (money gate,
his call), Cloudflare Web Analytics (cookieless, keeps the privacy promise
honest), prerendered pSEO pages generated from the engine at build time
(per-LPA, hike-matrix, per-script URLs; Hindi doubles the surface with
near-zero competition), FAQ JSON-LD, share cards for brag-shaped (hike) and
warn-shaped (red flags) outputs, tool-to-tool chaining across the 3–6 month
journey. Expect 6–12 months for SEO to compound. Until he says go: none of
this.

## 9. Working with Kalpit

- Bright, fast-learning, first-time developer. **One plain-English line
  before any technical block.** Explain developer terms on first use. Flag
  mistake-prone steps before they happen.
- He owns product decisions; you own technical execution. Disagree
  directly, once, without garnish. No praise padding.
- Chat replies: short sentences, verdicts in **bold**, ≤1 page; anything
  longer goes to a file he can open. Never drop risk flags or bad news to
  hit a length.
- Approval gates — ask before, and only before: merging to main, anything
  public-facing beyond what's already live, deleting things, spending money.
  Everything else: proceed, then report.
- Workflow: branch → PR → he merges. Name what only he can do (merge,
  GitHub settings) instead of pretending to do it.
- Model routing he expects: frontier tier for the §5 architecture call and
  first-pass tool UX; Sonnet-tier for implementation against specs;
  never a bulk-tier model for app code.

## 10. Pitfalls (learned the hard way)

- Don't reopen distribution "just a little" (a tweet, a share button, an
  analytics snippet). It's a decision he owns.
- Don't refactor the tracker or Decoder while adding tools — surgical
  changes; the tracker is his daily personal tool.
- Don't break the service worker or path-relative build; test the built
  `dist/` under a subpath before PR.
- Don't let Hindi lag English "to be filled later" — that's how bilingual
  products rot.
- Don't trust any AI's statutory tax claims (including this file's) without
  verification; golden cases or it didn't happen.
- Leave records: the owner's ecosystem expects sessions to end with work
  either PR'd or explicitly parked, never sitting uncommitted.

## 11. Suggested first session

1. Read `README.md`, `DEPLOY.md`, `src/engine/types.ts`, `engine.test.ts`.
2. Propose the routing/prerender architecture (§5) as a short plan; get
   Kalpit's nod on the approach (it's the highest-regret-if-wrong call).
3. Implement it: existing three tabs become `/decoder`, `/tracker`,
   `/prompts` + a home grid. PR it.
4. Next sessions: one Wave-1 tool per session/week, in §6 order, each to
   the §4 bar. Report escalations and surprises plainly.
