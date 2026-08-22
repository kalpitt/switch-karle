# SwitchKarle expansion strategy — "iLovePDF of job switching in India"

Date: 2026-08-22 (revised same day). Status: **PROPOSAL — adopted when Kalpit
merges this PR.**

> **Scope, clarified by Kalpit 2026-08-22.** The "iLovePDF" comparison means
> breadth and quality of micro-tools, NOT distribution. Goal: an amazing
> product built for his own use and as a showcase of dev capability.
> Distribution comes later, deliberately. This is consistent with the
> 2026-08-18 direction (personal hunt OS, distribution off the table) —
> it extends it with a build-out intent. The 7-evening personal-use gate
> stays. Everything distribution-shaped in this doc (§4) is parked, not
> deleted, so nothing has to be re-invented when that day comes.

## 1. What exists today

Decoder (CTC → in-hand, both regimes, FY 2026-27), red-flag scanner,
shareable truth card, application tracker, BYO-AI Prompt Studio, PWA,
full Hindi. All client-side, no server, no analytics. Live at
`kalpit.me/switch-karle` (a subpath, not a domain).

The tax engine, red-flag knowledge base, and Hindi register are the real
assets. The "iLovePDF" thesis fits them: iLovePDF wins because every tool is
one URL that exactly answers one high-volume query, loads instantly, needs no
account, and finishes the job in under a minute. SwitchKarle's tools already
behave that way — but they're hidden inside one SPA at one URL, which is the
single biggest structural blocker (see §5).

## 2. Journey audit — the Indian job switch, end to end

Ten phases. **Bold** = friction point with no good tool anywhere today.

### A. Deciding to switch (often April–June, post-appraisal)
- "My appraisal was 8%, market is 30% — what's staying actually costing me?"
  **No calculator anywhere frames appraisal-vs-switch as a rupee number.**
- Not knowing one's own current in-hand structure (people know CTC, not
  break-up) — Decoder partially covers this.
- Notice period reality check: 60–90 days means "start now for a Diwali switch".

### B. Getting ready
- Current-CTC documentation: last 3 salary slips, Form 16, increment letter —
  recruiters ask for all of it. **No checklist tool.**
- Resume/ATS and Naukri-profile keyword work — crowded space, weak fit for us
  (better served by Prompt Studio prompts than a hosted tool).

### C. Applying and the recruiter funnel
- The three questions every recruiter opens with: current CTC, expected CTC,
  notice period. **Anchoring here decides the final offer; nobody helps
  candidates script these answers.** ("Expected CTC" phrasing that neither
  lowballs nor disqualifies.)
- Recruiter WhatsApp/call dynamics, ghosting, applying via referral.

### D. Interviewing
- Scheduling rounds around a WFO job; multiple parallel pipelines — the
  tracker covers this. Interview prep itself: crowded, not our game.

### E. Offer stage — SwitchKarle's home turf
- Decode the offer — done.
- **Compare two offers in-hand-to-in-hand** (already roadmap item 6). The
  comparison Indians actually need: CTC-vs-CTC is meaningless when one offer
  stuffs gratuity+ESOP and the other is cash-heavy.
- **Hike truth: "30% CTC hike" can be a 18% in-hand hike** after variable pay,
  regime change, and structure games. Huge unmet calculation.
- Joining bonus clawback terms, service bonds — red-flag scanner covers
  detection; **no calculator shows the rupee cost of leaving early**.
- **Fake-offer scam check** — fake offer letters with "refundable deposit"
  asks are epidemic. Verify employer via EPFO establishment search / MCA
  lookup. (Direct DNA overlap with Saavdhan.)
- ESOP decode: vesting, exercise-time perquisite tax on FMV, liquidity odds.

### F. Resignation and notice
- **Resignation letter** — the single most-searched document in this journey.
- **Notice-period buyout math**: basic-vs-gross convention, who pays whom,
  whether new employer reimburses, tax treatment of recovery (the recovered
  amount's taxability is genuinely confusing — even CAs argue).
- Negotiating early release: scripts that work with Indian HR.
- **Counteroffer evaluation**: current employer matches the number — the
  decision framework (why counteroffer acceptors still leave within a year).
- Declining an accepted offer without burning the bridge (common, shameful,
  unscripted).

### G. Exit paperwork
- **F&F settlement estimator**: last salary + leave encashment (tax-exempt to
  ₹25L on retirement/resignation rules) + gratuity (the 4.81%/5-year rule —
  "4 years 240 days" counts) − notice recovery − bonus clawback. People sign
  F&F blind. **Nothing exists here.**
- Relieving letter / experience letter — what they must contain, what to do
  when an employer withholds them.

### H. Transition admin
- **EPF transfer**: UAN, date-of-exit not marked by old employer, name/DOB
  mismatches, Form 13 online flow. Millions of stuck transfers; the queries
  are enormous and the government UX is hostile. A step-by-step wizard
  (client-side, we never touch their data) would rank and help.
- **BGV prep**: employment gaps, moonlighting-era dual PF entries visible in
  UAN history, education verification. People discover problems after the
  offer. A "what will BGV see" checklist is unserved.
- Mediclaim gap between employers (corporate cover ends on LWD, new cover
  starts on DOJ, waiting periods reset).

### I. Joining
- First-payslip sanity check vs the offer (structure switcheroos happen).
- New-employer investment declaration + regime election, done blind in week 1.

### J. Post-switch (the April sting)
- **Two Form 16s → tax due at filing.** Both employers gave the standard
  deduction and full slab benefit; the switcher owes a surprise ₹30k–₹1.5L in
  July. This hits *every single switcher* and no tool targets it. Seasonal
  traffic spike (June–July, ITR season) with zero competition framing it as
  a job-switch problem rather than a generic ITR problem.
- EPF transfer follow-through; gratuity continuity.

## 3. Tool suite — four waves

Principle: every tool is one URL, answer-first, client-side, EN+HI, done to
showcase depth — a tool ships when its numbers are golden-case-tested, both
languages read natively, and the edge cases are explained in the UI, not
before. Build order follows Kalpit's own hunt: tools he will personally hit
get built first and QA'd by real use.

Craft bar over count: **8–10 deep tools beat 17 shallow ones** as a showcase.
Waves 3–4 are a backlog, not a commitment.

### Wave 1 — calculators the engine mostly already powers (and the hunt needs)
1. **Offer Comparison** — README roadmap item 6; two decodes side by side,
   verdict line. First because it's the tool an active hunt hits first.
2. **Hike Calculator** — % hike between two CTCs, and the killer feature:
   *in-hand hike vs CTC hike* ("30% on paper, 21% in your bank"). Reuses the
   engine twice.
3. **Notice Period Buyout Calculator** — basic vs gross convention toggle.
4. **Gratuity Calculator** — with the 4-years-240-days rule explained.
5. **Leave Encashment / F&F Estimator** — the exit-paperwork calculator.

### Wave 2 — documents and scripts (word-of-mouth, WhatsApp-forwardable)
6. **Resignation Letter Generator** — EN/HI, tones (standard / grateful /
   strictly formal), notice-date math built in, .docx/PDF/copy output.
7. **HR Scripts Library** — expected-CTC answer, early-release ask, buyout
   negotiation, offer decline, counteroffer response, follow-up nudges. Static
   content + fill-in variables; each script its own URL.
8. **Counteroffer Evaluator** — number + non-number factors, verdict framing.
9. **BGV Prep Checklist** — generated from a few questions (gaps? moonlighting?
   pending relieving letter?), client-side.

### Wave 3 — the unserved transition tools (hardest, most defensible)
10. **Two-Form-16 Tax Shock Estimator** — enter both employments, see the
    true liability now instead of in July. Hits every switcher.
11. **EPF Transfer Wizard** — decision-tree walkthrough of Form 13, date-of-
    exit, UAN mismatch remedies. Content-heavy, calculator-light.
12. **ESOP Decoder** — vesting math, perquisite tax at exercise, red flags.
13. **Fake Offer Scanner** — heuristics from the offer letter (deposit asks,
    domain mismatch, EPFO establishment lookup pointers). Saavdhan-adjacent.

### Wave 4 — deepen, don't widen
14. Joining-bonus clawback cost calculator (fold into red flags).
15. Probation/bond clause scanner (extend red-flag engine).
16. More states' professional tax; FY updates as an annual ritual.

### Parked with distribution (build only when distribution switches on)
- **In-hand salary LPA pages** (one prerendered page per LPA point) and
  hike-matrix pages — pure programmatic-SEO plays with no personal-use or
  showcase value; trivially generated later from the engine.
- Share-card variants beyond the existing truth card.

Not building: job discovery, resume builder, interview prep, anything needing
accounts or a server. Crowded, off-thesis, or breaks the privacy architecture.

## 4. Growth loops — PARKED until distribution switches on

Kept so the thinking survives; none of this starts now. Only §4-relevant
build decision that matters today: the per-tool-URL architecture in §5, which
makes all of this a config change later instead of a rewrite.

- **Programmatic SEO is the engine.** Tool pages (head terms) + LPA pages +
  hike-matrix pages ("20% hike on 12 LPA") + script pages (long tail). Hindi
  doubles the page count with near-zero competition ("notice period buyout
  kya hota hai"). Prerendered static HTML with the answer above the fold and
  FAQ JSON-LD.
- **Honest constraints, flagged:**
  - `kalpit.me/switch-karle` is a personal-site subpath. Ranking a tool suite
    needs its own domain (~₹800–1,500/yr) — **costs money, your approval
    gate**. Without it, the SEO half of this strategy is theater.
  - SEO compounds over 6–12 months. Nothing here is a fast-traffic plan.
  - There are incumbent in-hand calculators (ClearTax, Groww, AmbitionBox).
    We don't beat them on domain authority; we beat them on the *switching*
    frame (hike truth, buyout, F&F, two-Form-16) where they don't play.
- **Share loops:** truth card exists; add hike card and offer-comparison
  card. Warn-shaped outputs (red-flag report) get forwarded on WhatsApp;
  brag-shaped outputs (hike card) get posted on LinkedIn. Every card carries
  the URL.
- **Repeat use:** the journey is 3–6 months long and the tools chain
  (decode → compare → negotiate → resign → F&F → EPF → ITR). Each tool's
  result page recommends the next phase's tool. The tracker is the retention
  anchor for power users.
- **Measurement:** today there is zero analytics — growth work would be blind.
  Cloudflare Web Analytics is free, cookieless, and doesn't touch user data
  (stays honest to the privacy promise; update the promise's wording to
  "no tracking of your numbers" precisely). Adding it is a config change.

## 5. Tech & execution

- **Keep 100% client-side as the moat.** "Your offer never leaves your
  device" is the differentiation against every incumbent, and it makes each
  new tool nearly free to operate. No accounts, no server, ever.
- **The one architectural change that matters: one URL per tool, prerendered.**
  Today's tabbed SPA gives Google one page. Restructure to routes
  (`/hike-calculator`, `/in-hand-salary/15-lpa`, `/resignation-letter`, hi/
  variants with hreflang), statically prerendered at build time — either
  vite-prerender over the existing React app, or migrate the shell to Astro
  with React islands and keep `src/engine` untouched. Engine stays a pure,
  golden-case-tested TypeScript package shared by all tools; pSEO pages
  compute their numbers at build time so the answer is in the HTML.
- **Repo shape:** one repo, three layers — `engine/` (pure logic + tests),
  `tools/` (one folder per tool page), `content/` (scripts, guides, EN/HI
  strings). No monorepo tooling until it hurts.
- **Cadence:** one Wave-1 tool per week; each is a page + an engine function
  + golden-case tests + EN/HI strings. Sonnet-tier implementation against
  this doc; frontier tier only for tool UX first-passes and the
  Astro/prerender architecture call.
- **The showcase is the repo, not just the app.** A reviewer of dev
  capability reads the README, the engine tests, and one tool's code. Keep
  the README's tool table current, document each tool's tax/legal reasoning
  beside its code, and let the architecture (pure engine, prerendered
  routes, bilingual i18n, client-side privacy) tell the story.
- **Annual ritual:** tax engine is FY-stamped; every February, a "FY update"
  release.

## 6. Proposed roadmap (needs your Class-B approval to become real)

- **Now:** (1) per-tool routing/prerender architecture; (2) Offer
  Comparison; (3) Hike Calculator.
- **Next:** buyout + gratuity calculators, F&F estimator, resignation letter
  generator, HR scripts.
- **Later:** two-Form-16 estimator, EPF wizard, ESOP decoder, fake-offer
  scanner, BGV checklist, counteroffer evaluator.
- **Parked with distribution:** domain, analytics, LPA/pSEO pages, share
  cards, all of §4.
- **Not doing:** job board, resume builder, accounts/server, interview prep.

## 7. Where I push back

1. **"Sheer availability of features" is the wrong finish line for a
   showcase.** iLovePDF impresses through polish and consistency, not count.
   8–10 deep tools, each tested and bilingual, showcase more capability than
   17 shallow ones — and a wall of half-tools would repeat the failure mode
   the 08-18 session caught, inverted.
2. **Keep the 7-evening personal-use gate.** Build Wave 1 in the order your
   own hunt needs it, so every tool gets one real user before it counts as
   done.
3. **Do the per-tool-URL architecture first even though distribution is
   parked.** It's cheap now, expensive to retrofit under 10 tools, is itself
   showcase material, and keeps distribution a config change later.
