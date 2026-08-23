# Switch Karle — Product & UX Audit

Audited: `build/suite` @ 906e228 · 2026-08-23  
Visual: first-paint screenshots at **390×900** (phone), local `http://127.0.0.1:4321/switch-karle/`  
Personas: Indian tech candidate on 90-day notice · Bengaluru HRBP/recruiter · senior frontend/UX · product manager (quality mandate, distribution parked)

This is a critique, not a compliment sheet. The suite already has too many doors. Depth did not keep up with breadth.

**Do not treat this file as a second roadmap.** Direction stays in personal-os §A. Do not AI-fix the s.157 / Act 2026 rebate citation — that waits on CA Review R1.

---

## How to read this

| Verdict | Meaning |
|---|---|
| **Keep & Polish** | Real pain. Fix the named gaps. Keep the URL. |
| **Pivot** | Right job, wrong shape. Fold, rebuild, or change the CTA. |
| **Kill** | Novelty, duplicate, or would embarrass a candidate. Delete the destination (keep the words elsewhere if useful). |

**Pain** is the bookmark + WhatsApp test (1–10), consensus across the candidate and PM. A 6 is “I might use it once.” A 8+ is “I would send this to a batchmate.”

---

## Executive verdict

The product is **eight tools**. Everything else is inventory.

1. Decoder  
2. Offer comparison  
3. Real hike  
4. Notice buyout *(napkin today)*  
5. Gratuity + flip date  
6. F&F checker *(flagship hole)*  
7. Form-16 shock + Form 12B  
8. EPF transfer  

A friend mid-switch would open Decoder, then one exit-money tool, then get lost in a 34-card home grid. That is a product failure, not completeness.

**Three suite-level defects, confirmed on a phone:**

1. **Demo theatre.** Almost every calculator paints a confident verdict on fixture numbers (₹24L CTC, 60-day notice, Karnataka, 2019–2024 gratuity dates) before the user types. There is no “example” chip. The verdict sits **below the fold** at 390px.
2. **Empty ≠ clean.** Fake-offer and bond-scanner show a **green** “no problem found” banner on a blank form. A candidate will screenshot that.
3. **Chrome is broken at phone width.** Tagline, privacy pill, and card descriptions truncate on every page. The HR-script copy button says **“Copy the headline”** (Decoder string reused). Hindi `/hi/expected-ctc/` is Hindi chrome around an **English** letter. The button becomes “Headline कॉपी करें.”

**What not to do next:** do not add tool 36. Do not invent statutory numbers while the CA review is pending. Do not reopen distribution.

---

## Visual pass (phone, first paint)

Captured empty/default state for every shipped island. Numeric tools have **no empty state** — first paint *is* the “completed” output, on Kalpit’s ₹24L fixture. That is itself the finding.

| Surface | What 390px actually shows |
|---|---|
| **Home** | Header wraps to 3 rows (pills + EN/हिं + Stealth). Kicker truncates. Cards start with Offer comparison; Decoder / Tracker / Prompts are **last** in the grid and already in the nav. No category headings. |
| **Decoder** | 24 LPA / 2.4 variable / 40% basic / 60 days / Karnataka. AutoFill banner truncates. In-hand headline is **below the fold**. |
| **Offer comparison** | Offer A CTC `₹ 2400000`, variable `2.4` with **no unit**. Offer B starts below the fold. No verdict visible without scroll. |
| **Fake-offer** | Empty company / email / text. Green: “No deposit ask. Still check EPFO and MCA.” |
| **Bond scanner** | Empty textarea. Green: “No bond, certificate-deposit or post-exit restraint in this paste.” |
| **Notice buyout** | 60 days, basic ₹80,000, **gross ₹2,00,000** (CTC/12 of 24L, not Decoder cash gross). Both money fields shown. Green ~₹1,60,000. Divisor copy truncates. |
| **Gratuity** | ₹1,00,000 · 01/08/2019–01/08/2024. Green “Eligible… ₹2,88,4…” truncated. |
| **F&F** | Join 01/08/2021, LWD 31/08/2026, basic ₹80k / gross ₹1.5L. Verdict below the fold. |
| **Resignation** | Company / manager / role empty. Date 23/08/2026. Notice **60** (Decoder default, not 90). Letter below the fold. |
| **Expected CTC** | Static evasion copy, `[current CTC]` unfilled. Button: “Copy the headline.” |
| **Expected CTC /hi/** | Hindi instructions. **English body.** Button: “Headline कॉपी करें.” |
| **Tracker** | Honest empty state (“0 tracked”). The exception that proves the rule. |

Desktop layout (`lg:grid-cols-[2fr_3fr]`) puts the form first. On a phone the user types seven fields before they see a number.

---

## Tool-by-tool

Pain = consensus 1–10. Changes are the smallest 10x, not a wishlist.

### Offer economics

| Tool | Pain | Verdict | First-paint / output | Exact change |
|---|---:|---|---|---|
| **decoder** | 8 | Keep & Polish | ₹24L demo; only money tool with copy / print / PNG | Demo chip. CTC as `MoneyField` (stop LPA-only). Move HRA slider next to basic. Copy string: `In-hand ₹X/mo on ₹Y CTC`. WhatsApp one-liner. |
| **offer-comparison** | 7 | Keep & Polish | A=24L vs B=+20% with **gratuity stuffed on B by default**. Variable unit ≠ CTC unit. No copy. Hidden Decoder basic/HRA/PF. | Copy: `A ₹X in-hand vs B ₹Y; B stuffs gratuity`. Disclose inherited structure. Do not default B to dirty. |
| **real-hike** | 7 | Keep & Polish | Instant 30% demo (24L→31.2L). Next job **silently zeros old-regime rent**. | Copyable `paper % / bank %`. Independent stuffing on the new CTC. Stop wiping rent. |
| **variable-reality** | 7 | Keep & Polish | 0/50/100 on the ghost 24L. No copy of the table. | Copy: `if they pay 50%, in-hand is ₹X, not CTC/12`. |
| **bonus-clawback** | 8 | Keep & Polish | ₹2L / 6 months / all-or-nothing gross. Taxable + regime **not editable**. | Two dates (credit, planned LWD). Editable taxable/regime. Copy `keep ₹X / repay ₹Y gross`. |
| **esop-reality** | 4 | Pivot | 1000 × ₹10 / FMV ₹110 on load. All shares taxed at once. Provisional. | Demote to a “paper = ₹0 in the verdict” chip on Decoder/compare. Annual-vest option if the URL stays. |
| **relocation** | 3 | Pivot | KA→MH, ₹40k rent invented if Decoder never set rent. Output is often a PT footnote. | Lead with rent here vs there. Or fold PT + metro into Decoder. Do not ship a city COL index. |
| **fake-offer** | 3 | Pivot | **Green on empty.** Placeholders teach Acme/gmail. | No verdict until company, domain, or text exists. Never say “clean” on a blank form. Prefill EPFO/MCA with the name. |

### Exit money

| Tool | Pain | Verdict | First-paint / output | Exact change |
|---|---:|---|---|---|
| **notice-buyout** | 7 | Keep & Polish | `/30 × days`. Gross defaults to **CTC/12**. Pay vs recover is the **same rupee**. | Show basic/30 **and** gross/30. Seed gross from last-drawn payslip / Decoder cash gross. Mode is process copy, not a second number. Button: “Ask HR this” (kill `/buyout-ask`). |
| **gratuity** | 8 | Keep & Polish | Fixture dates paint eligible ₹2.88L. Ceiling omitted (disclosed). Flip date is the real product. | No verdict until dates are touched. Bold flip date + copy `eligible / not yet / ₹X`. Note: many private employers still pay only at 5 completed years. |
| **leave-encashment** | 4 | Pivot | Resignation fully taxable (right). Retirement path still prints exempt ₹0. | Resign vs retire must change the number, or fold into F&F. Do not offer retirement if s.10(10AA) is omitted. |
| **fnf-checker** | 5 | Pivot (flagship hole) | One salary line. User types notice recovery. **Cannot enter claimed gratuity.** No leave-encash line. **No dispute mail.** Green “they pay you” on fixture dates. | Ingest their sheet: claimed gratuity, leave days + 26/30, notice, holds. Delta table. Dispute mail **only if a delta exists**. Demote the flagship claim until then. |
| **form16-shock** | 7 | Keep & Polish | Two cloned ~₹12L gross, 0 TDS — manufactures a shock. Form 12B **is** copyable. Regime not switchable. 234B/C omitted (honest). | Do not prefill employer 2 from employer 1. Months at each employer. Regime toggle. CTA = “fill payroll’s Form 12B with these numbers” — the paragraph is not the form. |
| **tax-declaration** | 4 | Pivot | Checklist; CTC edits do **not** write back to Decoder. `claimingHra` defaults true under new regime. | One screen on Decoder/form16, or read-only + “Edit in Decoder.” Strip any `CANDIDATE:` from user-facing strings. |
| **counter-offer** | 4 | Pivot | **`currentCtc` is collected and unused.** Promo/team toggles are copy-only. | Three in-hands: stay / counter / outside. Use the field or delete it. Copy decline/accept. Add clawback if they stay then leave. |

### Documents

| Tool | Pain | Verdict | First-paint / output | Exact change |
|---|---:|---|---|---|
| **resignation-letter** | 8 | Keep & Polish | LWD = resign + notice − 1 (**correct**, tested). No name / emp ID / department. `todayISO()` is **UTC**. Notice hydrates **60**. Letter has “Yours sincerely” and no signatory. Firm tone uses “effective {resign date}” — payroll may mark DoE as the resign day. | Fields: name, emp ID, dept, Subject. IST date. Long-form LWD. Never “effective” for the resign date. Push LWD into manager-script + HR scripts. |
| **manager-script** | 4 | Pivot | `[LWD]` never filled. Preset label **“Hostile / guilt shop.”** Anglo “surprise-counter.” | Autofill LWD. Kill the slang. Three spoken sentences. Fold onto the resignation page. |
| **expected-ctc** | 5 | Pivot | No number. “Not a single CTC number” is evasion. HR will bounce it. Hindi route still English. | Must state current + expected range. Autofill from Decoder. Hindi **body**. |
| **early-release** | 6 | Keep & fix | Dead brackets. No emp ID, no handover date. | Fill from resignation. Proposed LWD + remaining days + “handover written by {date}.” |
| **buyout-ask** | 5 | Kill URL | Asks “basic or gross?” without quoting the letter. | Button on notice-buyout that quotes clause + date + recover vs pay. |
| **decline-accepted** | 5 | Pivot | Volunteers “no bond, no bonus” — unsolicited legal defence. | Thank, withdraw, one reason. Do not volunteer bond/bonus. |
| **counter-offer-reply** | 5 | Kill URL | Defensive “not a tactic.” | Fold into counter-offer as “send this.” Add an accept variant that asks for a **system** increment + effective date. |
| **recruiter-followup** | 4 | Kill | Generic nudge. Fails the bookmark test. | Delete, or one line inside Tracker. |
| **handover-doc** | 3 | Kill | Markdown headers hardcoded English on `/hi/`. Looks like a GitHub README in Outlook. | Prompt-studio template, not a tool. If it stays: `t()` every header; table not `#` hashes. |
| **relieving-chaser** | 7 | Keep & Polish | Day 7/14/30. LWD manual. **Day 30 threatens `[labour commissioner]`.** Mid-size product F&F is often 30–45 days; that line marks the candidate hostile. | LWD from resignation. Date-driven send-on. Day 30 = BGV-blocker + written LWD confirmation. Threats, if ever, after 45–60 days and never in brackets. |

### Landing & depth

| Tool | Pain | Verdict | First-paint / output | Exact change |
|---|---:|---|---|---|
| **epf-transfer** | 7 | Keep & Polish | Demo dates. Guidance, no copy-all. Tenure is **this employer only**. User-facing `CANDIDATE:` / s.392(7) must not reach payroll. | Verdict: “Transfer. Blocker = unmarked date of exit.” Copyable one-liner to old HR. Strip `CANDIDATE`. |
| **bgv-prep** | 6 | Keep & Polish | Display list. Ticks do not persist. 6-month gap ≠ fail. | Persist ticks. Copy pack list (PAN, Aadhaar, degree, 3 payslips, UAN, gap line). Add education-name mismatch. |
| **insurance-gap** | 7 | Keep & Polish | Skeleton = today + 15 days → alarm. No invented premiums (correct). | Demo chip or empty dates. “Cover ends **DATE**. Ask a broker these 4 questions.” |
| **notice-tracker** | 5 | Pivot | Six boxes persist (good). Does not share LWD with resignation/chaser. Name collides with nav **Tracker**. | Rename “Notice checklist.” Become the exit cockpit (each row opens F&F / insurance / EPF / chaser) or delete. |
| **bond-scanner** | 5 | Keep & Polish | **Green on empty.** English regex. | No leaf verdict on blank. Copyable “ask HR this,” not case-law pasted to HR. |
| **redactor** | 2 | Kill as shipped | Product copy is a payslip screenshot. Implementation is **textarea → PNG**. | Until `input type=file` + tap-to-mask: retitle “Mask text (not a photo)” or hide from Home. |
| **clause-library** | 4 | Kill | Six glossary cards. Copy invites pasting “90 days is not a statute” at TA. | Fold copy into Decoder flags / bond-scanner. Read-only if it stays. |
| **tracker** | 3 | Pivot | Honest empty state. Then a 5-column kanban on a phone. CTC + notice fields are the only India in it. Sync already declined. | **Today** list: next action, CTC, notice chip, one tap to Decoder. Not Trello. |
| **prompts** | 2 | Pivot | 7 English templates. Levels.fyi / STAR / “band.” Hindi chrome, English GPT. | One hero: offer-letter → Decoder JSON. Hide the studio. Delete US refs. |
| **stealth** | 1 | Kill as shipped | Title → “Notes.” Tagline hidden. **Nav, URLs, tool titles still say resignation / Switch Karle.** Label untranslated (“Stealth”). | Real notes mode (tab title, favicon, generic nav) or remove the toggle so people do not think they are hidden. |
| **home** | 4 | Pivot | 34 equal cards, registry order, Decoder last. Categories exist on `ToolDef` and are unused. | Three doors: “I have an offer” / “I’m resigning” / “I’ve left.” Three tools each. Everything else under More. |

**HR scripts (shared):** zero inputs, English bodies in `hrScripts.ts`, `ui.copy` mislabeled “Copy the headline.” **One** `/scripts/` route with a Select, merge fields (company, LWD, in-hand), Hindi bodies.

---

## Persona collision (where they agree)

All four independent reviews converged. Treat disagreement as a signal; treat this list as settled.

| Finding | Candidate | HR | UX | PM |
|---|---|---|---|---|
| F&F is not the flagship that was promised | Pivot / hide | Embarrassing if mailed | Tautology audit | **P10 / C2 hole** |
| Empty fake-offer / bond is green | Delete before a friend sees it | “Scanner said clean” | Safety defect | Checklist first |
| 14/15 money tools have no copy | Won’t WhatsApp | n/a | ShareRow exists, unused | Share cards on hike + compare |
| Hidden Decoder template | Distrust | n/a | Silent rent/PF | One saved offer |
| HR bodies English on `/hi/` | Rewrite | Hindi body required | Ship-blocking | Bilingual rule |
| Day-30 labour-commissioner | n/a | **Hostile. F&F waits.** | n/a | Date-driven mails |
| Expected-CTC with no number | Evasion | “Share current and expected” | Zero inputs | Must state a range |
| `currentCtc` dead | “I will not trust any field” | n/a | Delete or use | Use or hide |
| Stealth / Prompts / Tracker-as-Trello | Hide from batchmates | Off the HR path | Kill stealth-as-shipped | Filler |
| Do not invent 234B/C, GST, §10(10AA) cap | — | — | — | **CA pending** |

---

## Prioritized action checklist

Do these in order. Nothing below invents a statutory number.

### Quick UI fixes (hours, not weeks)

1. **Home as a journey.** Four category `<h2>`s from `tool.category`. Pin Decoder, Offer comparison, Resignation. Drop nav twins from the grid.
2. **Verdict first on mobile.** `order-first lg:order-none` on the results column of every island.
3. **Demo chip.** If draft === `DEFAULT_OFFER` / fixture dates, banner: “Example numbers. Change the form.”
4. **Empty ≠ clean.** Fake-offer and bond-scanner: no `VerdictBanner` when all inputs are blank.
5. **`ShareRow` on every money verdict.** Primitive already exists. Copy = the verdict string.
6. **Fix `ui.copy` on non-Decoder tools.** Button label “Copy”, not “Copy the headline.”
7. **One Scripts tool.** Kill six Home cards. Move bodies into i18n. Hindi letters, not just chrome.
8. **Handover headers through `t()`** — or delete the tool.
9. **Inherit disclosure** on hike / variable / compare / relocation / counter: “Using Decoder structure: {basic}% basic, HRA {n}%.”
10. **CTC unit lock.** Never mix `₹` CTC and LPA variable in the same card.
11. **Counter-offer:** use `currentCtc` or remove the field.
12. **Form-16:** do not clone employer 1 onto employer 2.
13. **Stealth label → “Notes mode” / “नोट्स मोड”** and `document.title`. Do not claim more than you hide.
14. **Phone chrome.** Wrap tagline and privacy pill so they do not clip at 390px.
15. **Relieving day-30.** Delete the labour-commissioner threat.

### Logic / math refinements (non-citation)

1. **F&F:** claimed vs recomputed for unpaid leave, leave encash, gratuity, notice. Net can go negative because of a real shortfall.
2. **Notice buyout:** print both bases. Leave-day netting (contractual). Seed gross from cash gross, not CTC/12.
3. **Clawback:** editable taxable + regime. Credit date → planned LWD, not integer months only.
4. **Real hike / compare:** new CTC can have different stuffing than the old one.
5. **Resignation `todayISO()`:** local calendar date, not UTC.
6. **Resignation → EPF:** if overlap, propose the earliest safe join date.
7. **Relieving-chaser:** compute send-on dates from LWD.
8. **ESOP:** annual-vest option (model honesty, not a tax fix).
9. **One saved offer.** Decoder writes; everyone else reads. Tax-declaration must not fork it.
10. **Leave-encashment:** hide the retirement path until the exemption is CA-scoped.

### Recommended new features (only real holes)

1. **F&F dispute-mail draft** — promised, not a new tool. *The* flagship output.
2. **Notice-buyout explainer copy** — why basic vs gross, who pays, “GST/tax treatment is disputed — not computed.” No rates.
3. **Scripts merge fields** — company, LWD, in-hand from resignation + Decoder.
4. **Notice-tracker as cockpit** — rows deep-link to F&F, insurance, EPF, relieving.
5. **Redactor on a screenshot** — only if the privacy story needs a demo people will use. Text-only is not that.

No other new tools.

---

## What not to build

- Tool 36 of any kind  
- Statutory “fixes” while CA R1/R2 are open: 234B/C, GST on notice recovery, reimbursement gross-up, gratuity ceiling, §10(10AA) cap, ESOP Rule-3 FMV, PF TDS rupees, s.157 vs 156  
- A cost-of-living index  
- ESOP depth, clause encyclopedias, a seventh script, interview kits, ATS  
- Tracker sync, IndexedDB, Naukri bump, stalling engines  
- Browser → LLM, regex offer ingest, salary in the URL  
- Distribution: Search Console, share campaigns, pSEO, analytics  

---

## The eight-tool product (if quality is the mandate)

This month is not more surface area.

1. Make **F&F** real (inputs the engine already allows + dispute mail).  
2. Make **notice-buyout** explain the fight (both bases, letter decides).  
3. Make **home** a journey of three doors.  
4. Stop shipping English template URLs that look like tools.  
5. Put a **copy button** on every number a 90-day engineer would paste into WhatsApp.

Until those five land, do not add a tool.
