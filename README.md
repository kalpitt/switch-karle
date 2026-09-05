# Switch Karle

**Everything about an Indian job switch except finding the job.**

From "I'm done here" — before you have applied anywhere — through the offer, the
resignation, ninety days of notice, and surviving the first three months at the
new place.

**Live: [kalpit.me/switch-karle](https://kalpit.me/switch-karle/)** · target origin: `switchkarle.fyi` (not serving yet)

Free and open source. Every number runs in your browser. Nothing is uploaded. No
accounts, no analytics, no AI calls.

You find openings on Naukri or LinkedIn. We do not do job listings, resumes, ATS
scoring or interview banks, and we are not going to — see [PRODUCT.md](PRODUCT.md)
for what that decision is and why.

[![CI](https://github.com/kalpitt/switch-karle/actions/workflows/ci.yml/badge.svg)](https://github.com/kalpitt/switch-karle/actions/workflows/ci.yml)

## Tools

| URL | What it answers |
| --- | --- |
| `/decoder/` | What does this CTC actually pay in-hand, and which red flags are in the offer? |
| `/offer-comparison/` | Which of these 2–3 offers puts more in the bank once stuffing and paper ESOP are stripped? |
| `/real-hike/` | How much of this CTC hike actually shows up in-hand? |
| `/variable-reality/` | What is monthly in-hand if variable pays 0, 50 or 100%? |
| `/bonus-clawback/` | If I leave before the clawback window, do I repay more than I kept? |
| `/esop-reality/` | What does exercising this grant cost, and what tax hits at my slab? |
| `/relocation/` | Does this CTC move in-hand when I change city? |
| `/fake-offer/` | Does this letter look like a job scam? |
| `/notice-buyout/` | What does unserved notice cost to buy out or recover? |
| `/gratuity/` | Am I eligible, how much, and which date flips me over the line? |
| `/leave-encashment/` | On a resignation, is this leave balance taxable? |
| `/fnf-checker/` | Does this full-and-final sheet add up, or do I owe them? |
| `/form16-shock/` | Two Form-16s this year — what extra tax is waiting? |
| `/resignation-letter/` | What does the resignation letter say, and what is my last working day? |
| `/manager-script/` | What do I actually say when I resign in person? |
| `/expected-ctc/` | How do I answer expected CTC without boxing myself in? |
| `/early-release/` | How do I ask to leave before notice ends? |
| `/buyout-ask/` | How do I ask HR what the buyout number is? |
| `/decline-accepted/` | How do I withdraw an acceptance cleanly? |
| `/counter-offer-reply/` | How do I close a counter-offer in writing? |
| `/recruiter-followup/` | How do I nudge a recruiter once? |
| `/counter-offer/` | Is this counter actually better than the outside offer? |
| `/handover-doc/` | What do I leave behind so the work does not fall over? |
| `/relieving-chaser/` | What do I send on day 7, 14 and 30 if relieving has not come? |
| `/epf-transfer/` | Should I transfer PF (Form 13) or withdraw, and why is the claim stuck? |
| `/bgv-prep/` | What will background verification see, and what should I pack? |
| `/insurance-gap/` | How many days am I uncovered between jobs? |
| `/tax-declaration/` | What do I tell the new employer about regime, HRA proofs, and Form 16? |
| `/notice-tracker/` | What is my last working day, and what is left on the exit checklist? |
| `/bond-scanner/` | Does this clause look like a training-bond / liquidated-damages trap? |
| `/redactor/` | Can I share a payslip with identifiers stripped? |
| `/clause-library/` | What does this common offer clause actually mean? |
| `/tracker/` | Where is each application, and what's the next action? |
| `/prompts/` | What do I paste into my own AI so it sees this offer and this hunt? |

Every English URL has a Hindi twin at `/hi/<same-slug>/`. Language follows the URL.

## Privacy is a promise, not an architecture

- **100% client-side.** No server, no accounts, no analytics. Your offer never leaves this device.
- **No AI calls.** Bring your own AI: the app generates prompts you paste into ChatGPT/Claude/Gemini.
- Data lives in `localStorage` under `switchkarle.<tool>.v<N>`, with JSON export/import on the Tracker.

See [PRIVACY.md](PRIVACY.md).

## Tax engine

Pure TypeScript, golden-tested against hand-computed cases (`src/engine/engine.test.ts`). FY 2026-27:

- New regime: slabs ₹0–4L nil → 30% above ₹24L; ₹75,000 standard deduction; rebate (zero tax to ₹12L taxable) with marginal relief; surcharge tiers; 4% cess.
- Old regime: ₹50,000 standard deduction, HRA exemption, 80C/80D, professional-tax deduction.
- EPF 12% of basic (statutory-ceiling option), gratuity accrual 4.81%, state professional tax (approximate).

**Estimates, not tax or legal advice.** Footer chip shows when the rules were last verified. A practising CA is reviewing the constants; until then statutory tools ship as `provisional-pending-CA`.

How the repo is put together: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Develop

```bash
npm install
npm run dev          # Astro dev server
npm test             # vitest — engine goldens, i18n freeze, purity
npm run typecheck    # tsc -b --noEmit
npm run lint         # oxlint
npm run build        # astro build
npm run check:base   # asset URLs resolve under the configured base
npm run check:seo    # canonical + OG on every route; no analytics in dist/
npm run check:csp    # CSP meta + hashes; no off-origin subresources
npm run new-tool     # node scripts/new-tool.mjs <slug>
```

`test`, `typecheck`, `lint`, `build`, `check:base`, `check:seo`, and `check:csp` must all pass before you open a pull request.

MIT licensed. Built by a job-switcher, for job-switchers.
