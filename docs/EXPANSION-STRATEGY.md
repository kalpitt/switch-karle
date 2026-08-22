# SwitchKarle expansion strategy — "iLovePDF of job switching in India"

Date: 2026-08-22. Status: **PROPOSAL — not adopted until Kalpit merges this PR.**

> **Decision gate.** On 2026-08-18 Kalpit directed: Switch Karle is a personal
> hunt OS, distribution off the table (personal-os handoff
> `2026-08-18-switch-karle-personal-use.md`, ROADMAP line Class-A deleted,
> Chhalaang portal plan stamped SUPERSEDED). This document reverses that.
> Merging this PR is the explicit owner decision that distribution is back on.
> The 7-evening personal-use gate set on 08-18 can still run in parallel — the
> tracker (personal OS) and the tools (public utility) are separable halves.

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

Principle: every tool is one URL, answer-first, client-side, EN+HI, with a
shareable card where the output is braggable or warnable.

### Wave 1 — calculators the engine mostly already powers (highest SEO volume)
1. **Hike Calculator** — % hike between two CTCs, and the killer feature:
   *in-hand hike vs CTC hike* ("30% on paper, 21% in your bank"). Reuses the
   engine twice. Shareable "hike card".
2. **In-hand salary pages** — programmatic: one prerendered page per LPA point
   (8, 10, 12 … 80 LPA), answer visible before any input. This is the
   highest-volume query family in the space ("15 lpa in hand salary").
3. **Notice Period Buyout Calculator** — basic vs gross convention toggle.
4. **Gratuity Calculator** — with the 4-years-240-days rule explained.
5. **Offer Comparison** — roadmap item 6; two decodes side by side, verdict
   line, shareable comparison card.
6. **Leave Encashment / F&F Estimator** — the exit-paperwork calculator.

### Wave 2 — documents and scripts (word-of-mouth, WhatsApp-forwardable)
7. **Resignation Letter Generator** — EN/HI, tones (standard / grateful /
   strictly formal), notice-date math built in, .docx/PDF/copy output.
8. **HR Scripts Library** — expected-CTC answer, early-release ask, buyout
   negotiation, offer decline, counteroffer response, follow-up nudges. Static
   content + fill-in variables; each script its own URL.
9. **Counteroffer Evaluator** — number + non-number factors, verdict framing.
10. **BGV Prep Checklist** — generated from a few questions (gaps? moonlighting?
    pending relieving letter?), client-side.

### Wave 3 — the unserved transition tools (hardest, most defensible)
11. **Two-Form-16 Tax Shock Estimator** — enter both employments, see the
    true liability now instead of in July. Seasonal marketing gift.
12. **EPF Transfer Wizard** — decision-tree walkthrough of Form 13, date-of-
    exit, UAN mismatch remedies. Content-heavy, calculator-light, ranks hard.
13. **ESOP Decoder** — vesting math, perquisite tax at exercise, red flags.
14. **Fake Offer Scanner** — heuristics from the offer letter (deposit asks,
    domain mismatch, EPFO establishment lookup pointers). Saavdhan-adjacent.

### Wave 4 — deepen, don't widen
15. Joining-bonus clawback cost calculator (fold into red flags).
16. Probation/bond clause scanner (extend red-flag engine).
17. More states' professional tax; FY updates as an annual ritual.

Not building: job discovery, resume builder, interview prep, anything needing
accounts or a server. Crowded, off-thesis, or breaks the privacy architecture.

## 4. Growth loops

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
- **Cadence:** ship one Wave-1 tool per week; each is a page + an engine
  function + tests + two share-card templates. Sonnet-tier implementation
  against this doc; frontier tier only for tool UX first-passes and the
  Astro/prerender architecture call.
- **Annual ritual:** tax engine is FY-stamped; every February, a "FY update"
  release. This is also an SEO moment ("in-hand salary FY 2027-28").

## 6. Proposed roadmap (needs your Class-B approval to become real)

- **Now:** (0) own domain + Cloudflare analytics decision; (1) per-tool
  routing/prerender architecture; (2) Hike Calculator; (3) Offer Comparison.
- **Next:** LPA pages, buyout + gratuity calculators, resignation letter
  generator, HR scripts.
- **Later:** F&F, two-Form-16 estimator, EPF wizard, ESOP decoder, fake-offer
  scanner.
- **Not doing:** job board, resume builder, accounts/server, interview prep.

## 7. Where I push back

1. **The 08-18 gate was good product discipline.** "Use it yourself for 7
   evenings" tests whether the tracker half is real. Reversing distribution
   doesn't require abandoning that gate — run both: tools are for strangers,
   the tracker is for you, and the tools don't depend on the tracker.
2. **Don't build 30 tools before one has traffic.** Ship Wave 1 + the domain,
   watch 8 weeks of Search Console, then fund Wave 2 with evidence.
3. **Without the domain and analytics decisions (both are gates: money), the
   rest of this plan should not start.** Building more tools behind a
   personal-site subpath with no measurement repeats the "distribution is
   the whole game" mistake in the opposite direction.
