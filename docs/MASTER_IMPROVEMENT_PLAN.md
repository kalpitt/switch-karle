# Switch Karle — Master Implementation Plan

**Date:** 2026-08-23  
**Status:** Locked. This file is the only brief the next agent needs.

**Give the next agent this, nothing else:**  
Read `docs/MASTER_IMPROVEMENT_PLAN.md`. One branch `quality/suite-pass`, one PR into `build/suite`. Start at slice C1. Do not open more PRs. Do not merge to `main`.  
**Owner:** Kalpit. He is not a developer. Lead with one plain-English line before any technical block.  
**If this file and the repo disagree on a path or a number, believe the repo. If this file and Kalpit disagree, believe Kalpit.**

Kalpit wants **one implementation PR**, not a stack of slices. Do all the work below on a single branch, push to that one PR, and stop when the checklist is done. Do not open C1 / G1 / 1.1 as separate GitHub PRs. Those labels are **commit slices inside the one PR**.

Direction for *what the product is* still lives in personal-os §A  
(`context/handoffs/2026-08-22-switch-karle-master-roadmap-v2.md`).  
This file is the **quality + citation execution plan** for `build/suite`.

---

## 0. Start here (next agent)

```bash
cd <redacted-local-path>
git fetch --prune
git checkout build/suite
git pull --ff-only origin build/suite
git checkout -b quality/suite-pass
npm install
npm run dev   # http://127.0.0.1:4321/switch-karle/
# After the first push:
#   git push -u origin HEAD
#   gh pr create --base build/suite --title "quality: suite pass (citations, gratuity, honesty)"
# All later work stays on this branch / this PR.
```

**One PR into `build/suite`.** Never merge to `main` (merging deploys). No force-push. No branch deletes unless Kalpit says so. Do not open additional PRs for later slices. Leave existing doc PRs (#6 audit, #7 this plan) alone.

Before every push:

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm run check:base
npm run check:seo
```

Phone-check the changed URL at **390px** and `/hi/<slug>/`.

**AGENTS.md still says “do not fix s.157.”** That sentence is **superseded for slice C1 in this PR**, by Kalpit on 2026-08-23, after the official Income-tax Act, 2025 PDF was checked. Do the citation fix in this PR. Do not “fix” any other statutory constant from memory or a blog.

---

## 1. Executive summary

The suite already computes. The failure is honesty, Hindi, paste-safety, one live wrong citation, and one gratuity underpay.

This cycle:

1. **Stop lying on first paint.** Blank = empty. Fixtures wear an **Example** chip. No green “all clear” on nothing.
2. **Hindi is a body.** Engine strings and letter bodies go through i18n. `/hi/` that pastes English is unshipped.
3. **Show where the rupee came from.** Buyout prints both bases. F&F only credits money the user claimed.
4. **Letters that may leave the building.** Signatory required. No labour-commissioner threat. No `CANDIDATE:` on glass.
5. **Keep every URL.** Pin Decoder / Compare / Resignation. No Super-Tools. No shared profile store.
6. **Cite the Act in force.** Rebate is **s.156, Income-tax Act, 2025** (not s.157 / “Act 2026”). Amounts already match.
7. **Pay gratuity the Act’s way.** Eligibility (s.2A) and payout years (s.4(2)) are two tests. Cap ₹20L.

**Do not:** invent PT rupees for contested states; put salary in a URL; ship proof cards / `.ics` / Super-Tools; delete URLs; open distribution; apply `docs/CA_REVIEW_SYNTHESIS.md` §5 as written.

---

## 2. Locked decisions (do not reopen)

| # | Call |
|---|---|
| D1 | Quality handoff is the spine. Audit fills compatible detail. 10x blueprint is an idea bank only. |
| D2 | Hold `build/suite` → `main` until Kalpit says deploy. |
| D3 | Notice-buyout formula unchanged. Dual-basis display. No GST. Do not import `marginalRate()`. |
| D4 | Full bilingual B2 fix + scan test this cycle. |
| D5 | Keep every URL. |
| D6 | Home: pin Decoder, Offer comparison, Resignation. No three-door IA. No category headings. |
| D7 | Cleanup extras in Phase 5 (404, lang key, `addDays`, orphan storage, offerScam copy, Hindi calque, UAN regex, age-under-60, fixed-pay note). |
| D8 | F&F = claimed-vs-recomputed table. **No dispute mail.** |
| D9 | Citations: only what the official ITA 2025 PDF states (s.156, s.19, s.202, s.123). `VERIFIED` only from Act / notification / circular URLs — never TaxGuru / Greythr / Chillsoft / another AI. |
| D10 | No shared profile blob. **Read-only** pull from an existing key is allowed (`loadOffer()`, resignation LWD). |
| D11 | Keep ₹24L / 60-day fixtures. Label **Example**. Do not wipe defaults. |
| D12 | Punjab `PB: 2_400`, labelled **State Development Tax** (PSDT Act 2018), not “professional tax.” |
| D13 | BR, JH, AS, CG, SK, ML, TR, PY stay ₹0 + `PT_AMOUNT_UNVERIFIED`. KA stays ₹2,400. |
| D14 | HRA: keep 4-city / user toggle. Do not add Bengaluru/Hyderabad/Pune/Ahmedabad from an EY alert. |
| D15 | `docs/CA_REVIEW_SYNTHESIS.md` is a conflict map. Do not apply its diffs. |
| D16 | Gratuity A1–A4 + s.4(2) follow-up are **closed**. Implement in **PR G1**. Leave-encash / GST / 234B/C / leftover PT stay parked. |

---

## 3. Hard rules (always on)

1. Never merge to `main`.
2. User data stays on the device unless the user copies, downloads, or pastes it.
3. No statutory number or legal claim without a primary source named in this file.
4. English and Hindi, or it does not ship. Domain words stay Latin: CTC, PF, HRA, ESOP, F&F, LWD.
5. No distribution (Search Console, analytics, SEO submission, promotion).
6. `src/engine/**` is pure TypeScript. UI imports engine; never the reverse. Engines return **ids**; UI maps through `t()`.
7. Do not add a tool. Do not add a shared JSON profile every URL reads and writes.

**Quality bar — a sceptical friend on a phone must:**

1. Open the page, type nothing, and not see a finished green result that looks like theirs.
2. Copy/paste into WhatsApp without editing out `CANDIDATE:`, leftover `[brackets]`, “helper draft”, or a labour-commissioner threat.
3. On buyout and F&F, see which base, which days, which line was claimed.

| Form state | Glass may show |
|---|---|
| **Empty** | No verdict. No green clean. One line: nothing has been checked yet. |
| **Example** | Visible **Example** chip. Copied text says it is an example. |
| **Entered** | Verdict and copy allowed. No placeholders in the paste. |

**Forbidden in any paste:** `CANDIDATE:` · leftover `[placeholders]` · labour commissioner / श्रम आयुक्त · “guilt shop” · “surprise-counter” · “shopping a counter” · “this is not a tactic” · “I have not signed a bond” · “helper draft” inside the paste · “in the bank” on an estimate · “puts ₹X in the bank” · a rupee the page invented.

**Allowed:** the user’s join date as the reason they want an earlier LWD. Do not write “the new company asked.”

Standing rules on **the island this PR names only** (do not sweep the suite):

1. Verdict first on a phone: `order-first lg:order-none`.
2. Money page → `ShareRow` (`src/components/ui.tsx`).
3. Letters you touch get `hr.disclaimer`, not `ui.disclaimer`.
4. Do not require emp ID to copy a Decoder or Compare number.
5. Every new/changed `en.ts` key needs a non-blank Hindi pair. Respect `hi-freeze.json` (presence + non-blank; value edits OK; key renames need a freeze update).

---

## 4. What is true in the repo today (verify before you edit)

- App base: `/switch-karle/`. Decoder persists `switchkarle.decoder.v1`. Default notice **60** days (`src/data/defaults.ts`).
- `loadOffer()` / `saveOffer()` already exist. Tools that seed from Decoder may keep doing that. Read-only from another island’s key is allowed; do not invent a `SwitchProfile`.
- Notice buyout: `(basic or gross) / 30 × days`. Island seeds gross from **CTC/12**, not Decoder cash gross. `marginalRate()` exists, is tested, and is **unused** — leave it unused.
- F&F engine supports claimed vs recomputed. Island can append leftover gratuity at claimed ₹0 and **add it to net** — that is the bug Phase 3 fixes.
- Offer B defaults `gratuityInCtc: true` in **two** places. Fix both.
- `ui.copy` is still “Copy the headline.” Hindi: “Headline कॉपी करें.”
- Six letter bodies live in `src/data/hrScripts.ts` (English). One island: `src/tools/hr-script/index.tsx` (six slugs).
- Relieving day-30 names a labour commissioner. Resignation `todayISO()` is UTC.
- User-facing `CANDIDATE:` in `en.ts` / `hi-suite.ts` (EPF, tax-declaration, bond-scanner). Engine `// CANDIDATE` comments stay except where PR C1 / G1 replace them with `VERIFIED`.
- Gratuity: eligible via 4y+240d but `amount` uses `completedYears` (4). No ₹20L cap. No 190-day path. No s.4(2) >6-month bump. Test at `gratuity.test.ts` asserts the 4-year underpay — that golden is wrong and changes in G1.
- Tax comments cite s.157 / Act 2026. Math (slabs, rebate ₹60k, cliff, surcharge 25% new-regime cap) is already correct.
- PT: Punjab is ₹0 and in `PT_AMOUNT_UNVERIFIED`. Official PSDT reading: ₹2,400 — PR C1.
- Raw English on `/hi/`: fake-offer, fnf-checker, gratuity notes, hr-script bodies. Hardcoded `suffix="days"` / `"mo"` on ~9 islands.
- No `404.html`.
- `ShareRow` exists and is unused on most calculators.

---

## 5. Tool-by-tool specification

### 5.1 Offer economics

**decoder** — PR 1.5 + C1 copy  
Example chip on `DEFAULT_OFFER`. Do not change 60-day default. Copy: `In-hand ₹X/mo on ₹Y CTC`. Inline: tax is on **fixed pay only**. Old regime: **assumes age under 60**. How-computed: s.156 / s.19 / s.202 after C1.

**offer-comparison** — PR 1.1  
Example on `defaultSlots()` (not “equals Decoder”). No green winner on first paint. Strip `gratuityInCtc: true` in **both** default sites. No ₹/LPA mix. `ShareRow`. No “in the bank.” Verdict-first.

**real-hike** — parked unless Kalpit names it (silently zeros old-regime rent on the next job).

**variable-reality / bonus-clawback / esop-reality / relocation** — no structural work. If you open the island: Example + `ShareRow` + unit keys. No COL index. No fold-into-Decoder.

**fake-offer** — PR 1.2 + 2.1  
Blank → no banner. “Nothing has been checked yet.” After paste, clean must not claim EPFO/MCA. Engine ids → i18n.

### 5.2 Exit money

**notice-buyout** — PR 3.1  
Engine formula untouched. Show basic/30 **and** cash-gross/30. Seed gross from `decodeOffer(loadOffer()).grossSalary / 12` when Decoder exists; if the field still equals CTC/12, say so. Pay vs recover is a sentence, not a second rupee. “GST/tax treatment is disputed — not computed.”

**gratuity** — PR G1 (math) + PR 2.1 (ids)  
See Phase G. No `.ics`.

**leave-encashment** — PR 5.2  
Hide retirement path. Do not add ₹25L. Resignation stays fully taxable.

**fnf-checker** — PR 3.2 + 2.1  
Claimed gratuity: 0 = not on the sheet. Do not append leftover gratuity at ₹0. No dispute mail. Engine goldens stay except string→id.

**form16-shock** — PR 3.3  
Do not clone employer 1 onto 2. “Helper draft” off the paste. No 234B/C.

**tax-declaration** — PR 1.4  
Strip user-facing `CANDIDATE:`. Keep “confirm with a CA.” No write-back to Decoder.

**counter-offer** — not a must. If opened: use `currentCtc` or hide it.

### 5.3 Letters

**resignation** — PR 4.1  
Name required for copy. Emp ID this page only. Local today, not UTC. Hindi body. `hr.disclaimer`. LWD explicit.

**relieving** — PR 4.2  
Keep day 7/14/30. Day-30 = status ask. No श्रम आयुक्त. Future/blank LWD → “set LWD first.” May read resignation LWD if present.

**expected-ctc** — PR 4.3  
Body in i18n. Two money fields. Copy blocked until both filled. May read-only seed CTC from `loadOffer()`. Do not break the other five `hr-script` slugs.

**manager-script** — PR 1.4  
Preset **Manager push-back**. Drop guilt-shop / surprise-counter slang. Fill `[LWD]` only if resignation already stored it.

**early-release, buyout-ask, decline-accepted, counter-offer-reply** — PR 4.4  
URLs stay. Strip never-ship sentences. No Harvard-PON rewrite.

**handover-doc / clause-library** — URLs stay. PR 2.2: handover headers through `t()`.

### 5.4 Other

**epf-transfer** — PR 1.4 strip `CANDIDATE:`. Optional one-liner to old HR.  
**bond-scanner** — PR 1.2 empty≠clean; PR 1.4 strip `CANDIDATE:`.  
**redactor** — PR 5.2 retitle “Mask text (not a photo)”; UAN regex, no Aadhaar collision. Not a screenshot editor.  
**stealth** — PR 5.2 “Notes mode” / “नोट्स मोड” + `document.title` only.  
**notice-tracker** — optional rename “Notice checklist.” Deep-links only.  
**home** — PR 1.5 pin three cards. Do not drop cards.  
**tracker / prompts** — out of scope unless Kalpit names the URL.

---

## 6. Sequential checklist (one PR, many commits)

Work **in this order** on `quality/suite-pass`. One GitHub PR. Prefer one commit per slice (C1, G1, 1.1, …) so Kalpit can read the history. Push as you go; do not open a new PR.

**C1 then G1 first** (money + citation). Then honesty 1.1→1.5, bilingual 2.x, money-depth 3.x, letters 4.x, cleanup 5.x.  
Slice 2.1 must not re-assert 4-year gratuity money after G1.

Do not merge this PR to `main`. Kalpit merges it into `build/suite` when the done-gate in §10 passes. `build/suite` → `main` is a later, separate decision.

### Phase 0 — already done

- [x] R1 reviews + official ITA 2025 PDF checked.
- [x] Gratuity A1–A4 + s.4(2) follow-up received.
- [x] Kalpit: one implementation PR, not a stack. Do not merge to `main` yet.

### PR C1 — Citations + Punjab PSDT

**Files:** `src/engine/tax.ts`, `src/engine/engine.test.ts`, `src/engine/professionalTax.ts` (+ tests), `src/i18n/en.ts`, `src/i18n/hi.ts`, comments in `src/engine/salary.ts` (no 8-city HRA list).

- [ ] User-facing and comments: rebate is **s.156, Income-tax Act, 2025**. s.157, if mentioned, means **arrears relief only**.
- [ ] Comments: SD + PT deduction **s.19**; new-regime scheme **s.202**; 80C-cap **s.123**. Amounts unchanged.
- [ ] `VERIFIED: 2026-08-23 | Source: ITA 2025 PDF https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf §<n> | FY: 2026-27`
- [ ] `PB: 2_400`. Remove `PB` from `PT_AMOUNT_UNVERIFIED`. UI: **State Development Tax**.
- [ ] Do not change BR / JH / AS / CG / SK / ML / TR / PY / KA.
- [ ] Extra goldens OK: rebate at ₹12L / ₹12.1L; new-regime surcharge still 25% above ₹5 Cr. No STCG/crypto.

**Verify:** `rg 's\\.157|Act 2026' src/i18n src/engine/tax.ts src/engine/engine.test.ts` empty (or arrears only). `PROFESSIONAL_TAX_ANNUAL.PB === 2400`. Six npm gates.

### PR G1 — Gratuity (CA closed)

Two calculations — do not conflate:

1. **Eligible?** PGA s.2A — 5 years, **or** 4 years + **240** days (6-day week) / **190** days (5-day week).
2. **If eligible, payable years?** PGA s.4(2) — completed years, **+1 iff** the stub after the last anniversary is **in excess of six calendar months**. Exactly 6 months does **not** bump. Test with `addMonths(lastAnniversary, 6)`, not 180 days.

**Files:** `src/engine/dates.ts` (+ tests), `src/engine/gratuity.ts` (+ tests), gratuity island, `en.ts` / `hi-suite.ts`.

Goldens at basic **₹50,000** (₹2,88,462 is the ₹1L × 5 figure — do not reuse it here):

| Service | Eligible | payableYears | Amount |
|---|---|---|---|
| 4y + 239d, 6-day | no | — | 0 |
| 4y + 240d, 6-day | yes | 5 | ₹1,44,231 |
| 4y + 190d, 5-day | yes | 5 | ₹1,44,231 |
| 5y 0d | yes | 5 | ₹1,44,231 |
| 5y + 6m exactly | yes | 5 | ₹1,44,231 |
| 5y + 6m + 1d | yes | 6 | ₹1,73,077 |
| 5y + 200d | yes | 6 | ₹1,73,077 |

- [ ] Island: 5-day / 6-day control. Flip date follows the threshold.
- [ ] Cap **₹20,00,000**. Remove `ceiling-omitted`. `VERIFIED`: PGA s.4(3) + S.O. 1420(E) 29-Mar-2018 + https://labour.gov.in/sites/default/files/gratuity_2.pdf
- [ ] Copy: the Act uses 190/240, not “wait for 5 calendar years.” No labour-office threat.
- [ ] Update the existing golden that asserts 4-year money on 4y+240d.

**Verify:** table above. Amount never exceeds ₹20L. Six npm gates. EN+HI.

### Phase 1 — Honesty (commits 1.1–1.5 on the same PR)

**PR 1.1** `src/tools/offer-comparison/index.tsx` — Example on `defaultSlots()`; both gratuity defaults gone; unit lock; `ShareRow`; no “in the bank.”  
**Done:** type nothing → no green winner. Edit B CTC → winner + copyable line.

**PR 1.2** fake-offer + bond-scanner — blank → no banner.  
**Done:** no green “no deposit / no bond” on empty.

**PR 1.3** `ui.copy` / `ui.copied` → Copy / Copied · कॉपी करें / कॉपी हो गया.  
**Done:** `/hi/expected-ctc/` is not “Headline कॉपी करें.”

**PR 1.4** User-facing i18n only. Strip `CANDIDATE:` from EPF / tax-declaration / bond-scanner. Keep “confirm with a CA.” Manager: **Manager push-back**.  
**Done:** `rg 'CANDIDATE:' src/i18n` empty. Engine comments remain.

**PR 1.5** Decoder Example chip; `TOOLS` order decoder → offer-comparison → resignation-letter; inline fixed-pay note; old-regime age under 60.  
**Done:** first paint Example; Home first three cards those three; card count unchanged.

### Phase 2 — Bilingual

**PR 2.1** `offerScam.ts`, `fnf.ts`, `gratuity.ts` return ids; islands `t()`. Scan test: fail if an island renders an engine string field raw. Unit suffixes → `unit.days` / `unit.months` on islands you open.  
**Done:** `/hi/fake-offer/`, `/hi/fnf-checker/`, `/hi/gratuity/` show Hindi bodies. Do not revert G1 amounts.

**PR 2.2** handover-doc headers through `t()`. URL stays.

### Phase 3 — Money depth

**PR 3.1** notice-buyout island only. Both bases. Decoder cash-gross seed. CTC/12 disclosed. No `marginalRate()`.  
**PR 3.2** F&F claimed gratuity. 0 = not on sheet. No dispute mail.  
**PR 3.3** Form-16: do not clone employer 1 onto 2. Helper-draft off paste.

### Phase 4 — Letters

**PR 4.1** resignation: name, local today, Hindi body, copy blocked on blank/`[`.  
**PR 4.2** relieving: day-30 status only; LWD gate.  
**PR 4.3** expected-ctc in i18n; two numbers; do not break five sibling slugs.  
**PR 4.4** remaining scripts: strip never-ship sentences. URLs stay.

### Phase 5 — Cleanup

**PR 5.1** `src/pages/404.astro` → `dist/404.html`. No new tool slug `hi`.  
**PR 5.2** version `switchkarle.lang`; `gratuity.ts` uses `dates.addDays`; orphan key cleanup (`switchkarle.tab`, `chhalaang.*`); offerScam `.io`/`.ai` copy (“verify, not proof of fraud”); Hindi calque in `hi-suite.ts`; UAN regex; leftover suffixes; redactor retitle; Notes mode; hide leave-encash retirement; 390px chrome wrap.  
**PR 5.3** (optional) gzipped JS report. Do not fail CI unless Kalpit wants a cap.

---

## 7. Parked (do not implement)

| ID | Item | Why |
|---|---|---|
| C4 | PT for BR/JH/AS/CG/SK/ML/TR/PY | No primary state-Act figure. Keep ₹0 + unverified. |
| C11 | Leave-encashment exemption / ₹25L | CA B still unanswered. Hide retirement path only. |
| C12 | Notice GST / tax / gross-up | CA C unanswered. Dual-basis + “disputed — not computed.” |
| C13 | s.234B/C | CA D unanswered. Do not model. |
| C14 | ESOP Rule-3 FMV | R3. |
| C15 | PF withdrawal TDS rupees | R3. |
| — | HRA 8-city list | Secondary only. |
| — | Real-hike rent wipe, clawback two-date, counter-offer three in-hands | After-cycle unless Kalpit names them. |

When a **human CA** answers B–G with a primary source: one new PR, `VERIFIED` from that source. Never from an AI pass.

---

## 8. Out of scope (never from this plan)

- A new tool, seventh script, or calculator
- `SwitchProfile` / URL-hash `#offer=v1...` / Super-Tool consolidation / three-door Home
- Cost-of-living index, Naukri, analytics, sync, backend
- WhatsApp proof cards, `.ics`, Reddit/Blind exporters
- Screenshot redactor; real stealth mode
- Distribution of any kind
- F&F dispute-mail
- Deleting URLs
- Applying `docs/CA_REVIEW_SYNTHESIS.md` §5

---

## 9. Implementation cautions

1. Offer-comparison `gratuityInCtc: true` is **duplicated** — fix every site.
2. Example detection uses **that island’s** fixture (`defaultSlots()`, `DEFAULT_OFFER`, `DEFAULT_DRAFT`), not “equals Decoder.” Decoder-seeded slots are **Entered**.
3. F&F nets **recomputed** values. Claimed 0 → salary − notice − unpaid only.
4. `hr-script` is one island, six slugs. PR 4.3 must not break the other five.
5. `hi-freeze.json`: renaming keys requires a freeze update.
6. Do not sweep. Standing rules apply to the named island.
7. Gratuity s.2A and s.4(2) are separate. Do not use `completedYears` as the multiplier.
8. Do not apply the CA synthesis diffs. Punjab is the only PT amount change; label it State Development Tax.
9. If stuck, ask Kalpit. Do not invent direction from deleted strategy docs.

---

## 10. PR done-gate (Kalpit, without the agent)

1. Open the changed URL at phone width.
2. Load it and type nothing. Say empty / example / fake-finished.
3. Change one field. Copy. Paste. No forbidden strings. No “in the bank” on an estimate.
4. Open `/hi/` if copy was touched. The **body** is Hindi.

The agent runs the six npm commands on the **one** PR and does not open further PRs. **The agent does not merge** — not to `build/suite`, not to `main`.

---

## 11. For Kalpit

| Action | Est. | Unblocks |
|---|---|---|
| Point the next agent at this file + “one PR, `quality/suite-pass`” | 1 min | Work starts |
| Review / merge that one PR into `build/suite` when §10 passes | 15 min | Suite quality lands |
| Merge `build/suite` → `main` | his call, later | Production |
| Paste remaining CA answers (leave encash, GST, 234B/C, leftover PT) | 5 min | A later pass, not this PR |

---

## 12. Source trail (do not re-run unless the repo drifted)

| Source | Role |
|---|---|
| Quality handoff (2026-08-23) | Honesty / letter PR shapes. 20/21 facts verified. |
| `docs/TOOL_AUDIT_REPORT.md` | Tool UX. Adopted where it does not kill URLs or invent statute. |
| `build/suite` review 2026-08-23 | B1–B4 confirmed. B1 fixed by G1. B4 (`marginalRate`) stays unused. |
| 10x blueprint | Rejected as architecture. Salvage: UAN regex, Hinglish, JS-budget *check*. |
| Official ITA 2025 PDF | s.156, s.19, s.202, s.123 — PR C1. |
| CA A1–A4 + s.4(2) follow-up | Gratuity — PR G1. |
| MoLE S.O. 1420(E) 29-Mar-2018 | ₹20L cap. https://labour.gov.in/sites/default/files/gratuity_2.pdf |

---

*End. Next human action: hand this file to the next agent and say: one PR, `quality/suite-pass` → `build/suite`, start at slice C1.*
