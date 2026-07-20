# छलांग chhalaang

**Decode your Indian job offer. Know what actually reaches your bank.**

Chhalaang (Hindi: *the leap*) is a free, open-source toolkit for the Indian job
switch. Enter your CTC structure and see the truth:

- **Real in-hand salary** — under both tax regimes (FY 2026-27 rules), with the
  cheaper one recommended and every number explained.
- **Red-flag scanner** — 90-day notice periods, service bonds, inflated
  variable pay, gratuity stuffed into CTC, illiquid ESOPs, hostile clawbacks —
  each with the legal/market context and one concrete line to negotiate with.
- **The truth card** — a shareable image of what your CTC really pays.

## Privacy is the architecture

- **100% client-side.** No server, no accounts, no analytics. Your offer never
  leaves your device.
- **No AI calls.** Bring your own AI: the app generates context-rich prompts
  you can paste into ChatGPT/Claude/Gemini (coming in the Prompt Studio).
- Data lives in your browser's localStorage with JSON export/import (planned).

## Tax engine

Pure TypeScript, exhaustively unit-tested against hand-computed golden cases
(`src/engine/engine.test.ts`). FY 2026-27 assumptions:

- New regime: slabs ₹0–4L nil → 30% above ₹24L; ₹75,000 standard deduction;
  rebate u/s 157 (zero tax to ₹12L taxable) with marginal relief; surcharge
  tiers; 4% cess.
- Old regime: ₹50,000 standard deduction, HRA exemption, 80C/80D,
  professional-tax deduction.
- EPF 12% of basic (with statutory-ceiling option), gratuity accrual 4.81%,
  state-wise professional tax (approximate).

**Estimates, not tax or legal advice.** Payroll structures differ; verify with
your finance team or a CA.

## Develop

```bash
npm install
npm run dev        # local dev server
npx vitest run     # engine test suite
npm run build      # production build
```

## Roadmap

1. **Decoder** — done
2. **Tracker** — done. Kanban pipeline for your applications, India-native
   fields (CTC discussed, notice/buyout, F&F), unlimited and local
3. **Prompt Studio** — done. BYO-AI prompts wired to your tracked applications
4. **PWA install** — done. Installable, works offline
5. **Hindi UI** — done. Full app in English or Hindi (professional
   Indian-workplace register — domain terms like CTC/PF/HRA/ESOP stay in
   English), toggle in the header, persisted locally
6. Offer comparison UI (side-by-side decode of two offers), professional tax
   for more states

MIT licensed. Built by a job-switcher, for job-switchers.
