# Switch Karle

**Decode your Indian job offer. Know what actually reaches your bank.**

**Live: [kalpit.me/switch-karle](https://kalpit.me/switch-karle/)** · target origin: `switchkarle.fyi` (not serving yet)

A free, open-source suite of instant micro-tools for the Indian job switch. Every
number runs in your browser. Nothing is uploaded. No accounts, no analytics.

[![CI](https://github.com/kalpitt/switch-karle/actions/workflows/ci.yml/badge.svg)](https://github.com/kalpitt/switch-karle/actions/workflows/ci.yml)

## Tools

| URL | What it answers |
| --- | --- |
| `/decoder/` | What does this CTC actually pay in-hand, and which red flags are in the offer? |
| `/offer-comparison/` | Which of these 2–3 offers puts more in the bank once stuffing and paper ESOP are stripped? |
| `/tracker/` | Where is each application, and what's the next action? |
| `/prompts/` | What do I paste into my own AI so it sees this offer and this hunt? |

More tools land on the `build/suite` branch (rolling PR, not production until Kalpit merges).

## Privacy is the architecture

- **100% client-side.** No server, no accounts, no analytics. Your offer never leaves this device.
- **No AI calls.** Bring your own AI: the app generates prompts you paste into ChatGPT/Claude/Gemini.
- Data lives in `localStorage` under `switchkarle.<tool>.v<N>`, with JSON export/import on the Tracker.

See [PRIVACY.md](PRIVACY.md).

## Tax engine

Pure TypeScript, golden-tested against hand-computed cases (`src/engine/engine.test.ts`). FY 2026-27:

- New regime: slabs ₹0–4L nil → 30% above ₹24L; ₹75,000 standard deduction; rebate (zero tax to ₹12L taxable) with marginal relief; surcharge tiers; 4% cess.
- Old regime: ₹50,000 standard deduction, HRA exemption, 80C/80D, professional-tax deduction.
- EPF 12% of basic (statutory-ceiling option), gratuity accrual 4.81%, state professional tax (approximate).

**Estimates, not tax or legal advice.** Footer chip shows when the rules were last verified. A practising CA is reviewing the constants; until then statutory tools on `build/suite` ship as `provisional-pending-CA`.

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
npm run new-tool     # node scripts/new-tool.mjs <slug>
```

`test`, `typecheck`, `lint`, `build`, `check:base`, and `check:seo` must all pass before a push to `build/suite`.

MIT licensed. Built by a job-switcher, for job-switchers.
