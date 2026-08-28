# Switch Karle — Quality Cycle Record (C1 → 5.2)

**Date:** 2026-08-23
**Status:** EXECUTED AND AUDITED. This file was the one-PR implementation brief; every slice below shipped as commits on `quality/suite-pass` (PR #8) and survived a five-agent audit. It stays as the record of what was decided, what remains parked, and how to verify. It is **not** product direction — that is personal-os §A (`context/handoffs/2026-08-22-switch-karle-master-roadmap-v2.md`). Living technical truth: `docs/ARCHITECTURE.md`.

**Owner:** Kalpit. He owns product decisions; agents own technical execution. If this file and the repo disagree, believe the repo. If this file and Kalpit disagree, believe Kalpit.

---

## 1. What shipped

| Slice | Scope | State |
|---|---|---|
| C1 | Rebate citation corrected to s.156, Income-tax Act 2025 (was s.157/"Act 2026"), with §19/§123/§202 comment citations — all VERIFIED against the official ITA 2025 PDF. Punjab ₹2,400 labelled State Development Tax (PSDT Act 2018), removed from `PT_AMOUNT_UNVERIFIED`. Surcharge goldens incl. the ₹5 Cr+ 25% cap. | Done |
| G1 | Gratuity split into its two statutory tests: eligibility (PGA s.2A: 5y, or 4y + 190/240d by work week) vs payable years (s.4(2): +1 iff stub exceeds six calendar months). ₹20L cap (s.4(3)). 5-day/6-day island control. All seven spec goldens pass. | Done |
| 1.1–1.5 | Honesty: Example states with chips (offer-comparison, fake-offer, bond-scanner, Decoder); blank ≠ clean; `ui.copy` fixed; user-facing `CANDIDATE:` stripped; home pins decoder → offer-comparison → resignation-letter; card count unchanged. | Done |
| 2.1–2.2 | Engines return ids + params; islands render via `t()`; scan test fails on any raw engine-prose render or hardcoded days/months suffix; handover-doc headers through i18n. | Done |
| 3.1–3.3 | Notice-buyout shows both bases, seeds cash gross from Decoder with CTC/12 disclosure, GST marked disputed-not-computed. F&F excludes unclaimed gratuity from net (amber flag instead). Form-16 employer 2 starts at zero; "helper draft" off the paste. | Done |
| 4.1–4.4 | Resignation: local date, your-name/emp-ID fields, copy gated on blanks/placeholders. Relieving: day-30 is a status ask (no labour-commissioner threat), LWD gate, read-only resignation seed. Expected-ctc interactive with two numbers. Never-ship sentences stripped from scripts. | Done |
| 5.1–5.2 | `dist/404.html`; lang key versioned to `switchkarle.lang.v1`; Notes mode (+ document.title); redactor retitled "Mask text (not a photo)" with collision-safe UAN regex; unit-suffix sweep; leave-encashment retirement path hidden. | Done |
| 5.3 | Gzipped JS-size report. | Optional — intentionally skipped |

The golden tables that define correct money math live in the test files (`gratuity.test.ts`, `engine.test.ts`, `fnf.test.ts`) — they are the executable spec.

## 2. Audit record

Five independent agents audited the branch after implementation: money-math re-derivation, paste-honesty/glass-states, i18n key integrity, architecture purity + privacy, and all 63 acceptance criteria. Findings — UAN/Aadhaar pattern ordering, four missing Example states, placeholder-leaking copy gates, English letter bodies on `/hi/`, an unverifiable claim in decline-accepted — were fixed on the same PR. Money math and citations passed clean. AGENTS.md's old "do not fix s.157" landmine is resolved as of this cycle and updated there.

## 3. Standing requirements (always binding)

1. Never merge to `main`; `build/suite` → `main` only when Kalpit says deploy.
2. User data never leaves the device except by the user's own action (`PRIVACY.md`).
3. No statutory number or legal claim without a primary source named in a repo doc. `VERIFIED:` markers come only from Acts / notifications / official PDFs — never TaxGuru / Greythr / another AI.
4. English and Hindi, or it does not ship. Domain words stay Latin: CTC, PF, HRA, ESOP, F&F, LWD.
5. No distribution activity (Search Console, analytics, SEO submission, promotion).
6. `src/engine/**` pure TypeScript; UI imports engine, never reverse; engines return ids, UI maps through `t()`.
7. No new tool; no shared cross-tool profile blob. Read-only pulls from another island's storage key are allowed.
8. Nothing user-copyable may contain `CANDIDATE:`, leftover `[placeholders]`, labour-commissioner threats, guilt-shop/surprise-counter slang, "helper draft", "in the bank" phrasing on estimates, or a rupee the page invented. Empty page → no verdict; untouched fixture → Example chip; entered values → verdict allowed.

## 4. Locked decisions from this cycle (do not reopen without Kalpit)

- Notice-buyout formula unchanged; dual basis displayed; decoder seeds cash gross; GST/tax treatment disputed — not computed; `marginalRate()` stays unused.
- F&F is claimed-vs-recomputed; no dispute-mail feature.
- Every URL stays; home pins three tools; no three-door IA, no category headings.
- Punjab = ₹2,400 State Development Tax; BR/JH/AS/CG/SK/ML/TR/PY stay ₹0 + `PT_AMOUNT_UNVERIFIED`; KA stays ₹2,400.
- HRA keeps the 4-city metro limb; no 8-city expansion.
- Example detection uses each island's own fixture constant; Decoder-seeded values are Entered, not Example.
- hr-script bracket templates remain fill-after-copy by owner decision; merge fields are a future option, not authorized work.

## 5. Parked (do not implement)

| ID | Item | Why |
|---|---|---|
| C4 | PT for BR/JH/AS/CG/SK/ML/TR/PY | No primary state-Act figure |
| C11 | Leave-encash exemption / ₹25L cap | CA answer pending; retirement path already hidden |
| C12 | Notice GST / tax / gross-up | CA answer pending; shown as disputed, not computed |
| C13 | s.234B/C interest | CA answer pending; deliberately not modelled |
| C14 | ESOP Rule-3 FMV | R3 review |
| C15 | PF withdrawal TDS rupees | R3 review |
| — | HRA 8-city list | Secondary sources only |
| — | real-hike rent wipe · clawback two-date · counter-offer in-hands | Unless Kalpit names them |

When a human CA answers with a primary source: one new PR, `VERIFIED` from that source — never from an AI pass.

## 6. Verify

```bash
npm test && npm run typecheck && npm run lint && npm run build && npm run check:base && npm run check:seo
```

All six must pass before any push. Then phone-check changed URLs at 390px and on `/hi/<slug>/`.
