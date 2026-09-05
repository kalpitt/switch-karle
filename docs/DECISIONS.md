# DECISIONS — Switch Karle

What was decided, when, and why. Newest first. Append, never rewrite: a reversed
decision keeps its entry and gains a reversal note, because knowing something was
tried and abandoned is worth more than a tidy list.

This is a **record**, not direction. Direction lives in `PRODUCT.md` (what this
is) and `ROADMAP.md` (what is next), both owned by Kalpit. If this file and the
code disagree, believe the code and fix this file.

---

## 2026-09-05 — An erase control, and storage that waits for the user

**Decided:** ship the ROADMAP "Now" item as two halves — the erase button, and
the reason it could not work without a second fix.

**Why the second half was not optional.** The erase button worked and then
re-seeded storage on its own reload. Every tool boots by reading its key and
echoing what it loaded back, so opening a tool wrote its example numbers to
disk before the user typed anything. The home page renders the tracker, so
*every visitor to the front page* got a key written to a disk their employer may
own. That is PRODUCT.md rule 6 ("nothing persists unless the user chose
persistence") broken on the exact machine the product worries about, and it made
the erase button a claim rather than a fact.

**Mechanism, and the one that was rejected.** Skip by shape, not by value: the
first write after a boot read that found nothing does not create the key. The
obvious alternative — remember the default and skip a write equal to it — was
designed, reviewed and thrown away: it works only for the ~10 tools that pass
their real default as the `readJson` fallback, and the other ~13 read with a
`null` fallback and build their default themselves, so half the app would have
kept re-seeding while looking fixed.

**What it costs.** Storage cannot tell an echo of a computed default from a real
edit, so the skip is spent on the first save after a boot read whatever it
carries. Safe only because every tool echoes on mount. The decoder does not —
it holds its write when seeded from a tracker card — and lost the user's first
edit until `releaseBootEcho` was added. That bug was found by verifying the
change in a browser, not by a test going red, and is now pinned by a test that
fails without the fix.

**Scope held.** Erase covers `localStorage`, not the PWA precache (site assets,
no user input, returns on the next load) and not browser history. Both said out
loud in the dialog and in `PRIVACY.md` rather than quietly omitted.

**Consequence to know:** `notice-buyout` and `form16-shock` decide whether to
inherit from the decoder by testing whether its key exists. Someone who opens the
decoder and types nothing no longer counts as having an offer, so those tools use
their own fixtures — correct, and it stops them presenting example numbers as
"from your decoder". **Open for Kalpit:** confirm that reads right, and whether
erase should also clear the PWA cache.

---

## 2026-09-05 — Current-job pay gets one home, separate from the new offer

**Decided by Kalpit**, asked directly: build a shared "your current job" record
rather than simply dropping the wrong seed or extending the decoder.

**The bug it answers.** `notice-buyout` seeds monthly basic, gross and unserved
days from `decodeOffer(loadOffer())` — the **new** offer. A notice buyout is owed
to the current employer out of current pay, so decoding a 30 LPA offer inflates
it. `resignation-letter` does the same with the notice period, for a letter
addressed to the current employer. Review found `notice-tracker` does it too, on
the same field, to count down notice served at the current employer.

**Why a shared record rather than nothing.** Five tools ask for current-job pay
separately today (`gratuity.lastDrawnBasicDA`, `leave-encashment.monthlyBasic`,
`fnf-checker.monthlyBasic`/`monthlyGross`, `notice-buyout.monthlyBasic`/
`monthlyGross`). PRODUCT.md rule 7: a value already typed is never asked for
twice.

**Two "basic" numbers, never merged.** Review caught this before any code
shipped: `gratuity` asks for **basic + DA** and says so in its hint, while
`notice-buyout` and `leave-encashment` ask for plain **basic** and their engines
use it raw. One shared field would hand a wrong number to anyone with a DA
component. The record therefore carries `monthlyBasic` and `monthlyBasicDA` as
separate fields that never cross-seed. `fnf-checker` feeds its `monthlyBasic`
into the gratuity engine as `lastDrawnBasicDA` internally
(`src/engine/fnf.ts:89-94`), so that field is already ambiguous between the two —
**pre-existing, unresolved, and Kalpit's to decide.**

**Built 2026-09-05**, branch `feat/current-job-record`. `src/data/currentJob.ts`
holds the shared record and calls `releaseBootEcho` on read, per the design
above. All six tools wired: `notice-buyout`, `resignation-letter` and
`notice-tracker` no longer touch the decoder; `gratuity`, `leave-encashment` and
`fnf-checker` moved from their own storage-only fields to the shared one where
it applies. Two build-time decisions for Kalpit to confirm, not re-derive from
the diff:

(a) The Example chip's rule got stricter than "Decoder-seeded values count as
Entered": a field the record fills, sitting next to a fixture the user has not
touched in *that* tool, still shows the Example chip until the user types in
that specific tool. A record-filled basic beside example dates is not a verdict
the user asked for.

(b) `fnf-checker` reads the record's plain `monthlyBasic`, and its own engine
already feeds that number to gratuity's calculation as basic+DA
(`src/engine/fnf.ts:89-94`) — the pre-existing ambiguity noted above is
unchanged by this work and still his to decide.

---

## 2026-09-05 — The journey starts at "I'm done here"

**Decided:** a person who has decided to leave but has applied nowhere is a
Switch Karle user, and they are the *first* user. The site covers the whole arc
of a switch from that moment to surviving ninety days at the new job.

**And:** it does not help you find openings. No job listings, aggregation,
resumes, ATS scoring, cover letters or interview banks — permanently, on
reputational grounds, not capacity. You find roles on Naukri or LinkedIn.

**Why it matters technically:** the product currently inherits from *the offer* —
`src/data/defaults.ts` exports `loadOffer()` and `DECODER_STORAGE_KEY`, and five
tools carry the `ui.inherit` disclosure. Nothing inherits from the current job;
there is no `switchkarle.currentjob.v1`. That absence is the old
"journey-starts-at-the-offer" model encoded in the schema, and it is what has to
change for this decision to be true in the product rather than only in a document.

**Recorded with it:** three tools that ship today — `gratuity`,
`leave-encashment`, `notice-buyout` — take only current-job inputs and no offer
field. Someone at this stage can already price what leaving costs them.

## 2026-09-05 — Raw-text persistence: keep the default, disclose it

`redactor`, `bond-scanner` and `resignation-letter` save the raw pasted text —
un-redacted payslip, bond clause, resignation draft — to plaintext `localStorage`
indefinitely, with nothing on screen saying so. Flagged the same day in
`docs/ARCHITECTURE.md` with three options: keep the default and disclose it,
make the three tools in-memory only, or add a session-only mode.

**Decided: keep the default, disclose it.** No storage behaviour changed. Each
tool's existing hint now says the text saves on this device only and is never
uploaded — `redactor.textHint`, `bond-scanner.textHint`, and a new
`resignation-letter.formHint`. One line, three tools, EN + HI.

## 2026-09-05 — `PRODUCT.md` created; two unbidden strategy docs deleted

`docs/STRATEGIC_SYNTHESIS_AND_TIERED_ROADMAP.md` and
`docs/UNCONSTRAINED_RESEARCH_AUDIT.md` were agent-written, untracked,
self-authorised, and about 100KB between them. One declared itself
"Authoritative Reference Document" while proposing to relax the distribution
embargo and the English+Hindi parity rule — both decisions only Kalpit makes.

A salvage pass kept **two items out of the pair**, both now in
`docs/ARCHITECTURE.md`: the raw-text persistence gap in `redactor` /
`bond-scanner` / `resignation-letter`, and one candidate panic-switch mechanism.
Nearly everything else they proposed as new already ships. One claim actively
contradicted the code: they asserted a settled 0% GST answer on notice-buyout
recovery, where `src/i18n/en.ts` correctly calls it disputed and computes
nothing. The code was right.

**The structural fix:** the repo had rules (`AGENTS.md`), priorities
(`ROADMAP.md`) and technical truth (`docs/ARCHITECTURE.md`) but no definition of
the product, so every agent inferred it from the code and the code was downstream
of whoever argued last. `PRODUCT.md` is now that definition, and `AGENTS.md`
carries a one-home-per-fact table so the next agent writes into an existing file
instead of inventing a new one.

## 2026-08-31 — Merge wave, PRs #20–#36

Shipped in one day: tracker restore safety (#20), ingest core (#21), mobile
header bloat (#22), applied-on dates (#23), CSP plus the `check:csp` gate (#25),
tracker hardening (#26), and the audit rounds that followed (#30, #31, #32, #34,
#36) which brought the stranded sweep, ingest and coverage work back onto main.

**ROADMAP.md was not updated afterwards.** As of 2026-09-05 it still lists both
"Now" items and four of five "Next" items as pending when all six shipped here or
in #18. Since `AGENTS.md` tells every agent to answer "what's next" from that
file, an agent starting cold would rebuild finished work. Correcting it is
Kalpit's — agents propose in a handoff.

## 2026-08-30 — The tracker became the home page

**Reverses the 2026-08-29 decision below.** The tool grid moved inside a
collapsed disclosure and the Kanban board became the page.

**The evidence, stated accurately:** commit `6d160c7`'s message reads
"Colleagues bounced off the 29-item grid within seconds ('I can just ask ChatGPT
this'), and the application tracker was the one part they wanted." That is
informal hallway feedback from the owner — no recorded sample size, no method, no
analytics, and there are zero users. The code comment in
`src/tools/home/index.tsx` compresses it to "Research killed the tool-menu home",
which reads as a study and is not one.

**Note for whoever revisits this:** the objection recorded was *substitutability
by a chatbot*, not menu length. Hiding the tools answered a different complaint
than the one that was made. `PRODUCT.md` now carries the answer to the objection
that was actually raised.

## 2026-08-30 — Notes mode deleted; local-first became a default, not a boundary

Notes mode was removed rather than parked: it renamed the site and hid four
chrome elements while leaving company names, LPA chips and stage words fully
visible. A disguise that leaves the incriminating half on screen is worse than
none. Replacement requirement and design notes: `docs/ARCHITECTURE.md`.

Separately, the absolutist "nothing ever leaves the device" rule was retired.
User data may leave only to deliver a feature the user explicitly turned on, only
to a destination Kalpit controls, and only while it stays on. Nothing today does.
Full test: `PRIVACY.md`.

## 2026-08-29 — Home became a grid in journey order — REVERSED 2026-08-30

Three pinned starters, then the four category phases. The registry had carried
`category` and `stage` on every tool for months and the page ignored both;
ordering moved to `src/data/home.ts`, pure and tested.

Superseded the next day by the entry above. The ordering logic survived and is
still what the collapsed disclosure renders.

## 2026-08-23 — Quality cycle C1 → 5.2 (PR #8)

The statutory correction pass, audited by five independent agents. Money math and
citations passed clean; UAN/Aadhaar pattern ordering, four missing Example
states, placeholder-leaking copy gates and English letter bodies on `/hi/` were
found and fixed on the same PR.

**The correction that matters most:** the rebate citation was wrong — it said
s.157 of an "Act 2026" that does not exist. It is s.156 of the Income-tax Act,
2025, verified against the official PDF, and `src/engine/tax.ts` now carries the
disproof of the old one inline. This is the concrete reason the never-cite-an-AI
rule exists.

Executed slice detail lives in git history on `quality/suite-pass`. The golden
tables in `gratuity.test.ts`, `engine.test.ts` and `fnf.test.ts` are the
executable spec for correct money math.

---

## Standing requirements — always binding

1. Never merge to `main`. Branch → PR → Kalpit merges.
2. User data moves only to deliver a named feature the user turned on, and is
   never sold or shared. See `PRIVACY.md`.
3. No statutory number or legal claim without a primary source named in a repo
   doc. `VERIFIED:` markers come only from Acts, notifications or official PDFs —
   never a tax blog, never another AI.
4. English and Hindi, or it does not ship. Domain words stay Latin: CTC, PF, HRA,
   ESOP, F&F, LWD.
5. No distribution activity: no Search Console, analytics, SEO submission or
   promotion.
6. `src/engine/**` is pure TypeScript. UI imports engine, never the reverse.
   Engines return ids; the UI maps them through `t()`.
7. No shared cross-tool profile blob. Read-only pulls from another island's
   storage key are allowed.
8. Nothing user-copyable may contain `CANDIDATE:`, leftover `[placeholders]`,
   labour-commissioner threats, "helper draft", "in the bank" phrasing on an
   estimate, or a rupee the page invented. Empty page → no verdict; untouched
   fixture → Example chip; entered values → verdict allowed.
   *(Unenforced by any test as of 2026-09-05 — true by inspection only.)*

## Statutory and product decisions that stand

- Notice-buyout: formula unchanged, dual basis displayed, Decoder seeds cash
  gross, GST and tax treatment shown as **disputed — not computed**.
- F&F is claimed-vs-recomputed. No dispute-mail feature.
- Punjab ₹2,400 is State Development Tax (PSDT Act 2018). BR/JH/AS/CG/SK/ML/TR/PY
  stay ₹0 with `PT_AMOUNT_UNVERIFIED`. KA stays ₹2,400.
- HRA keeps the four-city metro limb. No eight-city expansion — secondary sources
  only.
- Gratuity: eligibility (PGA s.2A — 5y, or 4y + 190d on a 5-day week / 240d on a
  6-day week) is a separate test from payable years (s.4(2)). ₹20L cap (s.4(3)).
- Example detection uses each island's own fixture constant. Decoder-seeded
  values count as Entered, not Example.
- Every URL stays.
- HR-script bracket templates remain fill-after-copy, by owner decision.

**Retired 2026-09-05:** the 2026-08-23 cycle locks "no new tool" and "no
three-door IA, no category headings". The first was a one-PR freeze, not a
product rule. The second was contradicted by shipped code within a week —
`src/tools/home/index.tsx` renders category headings today.

## Parked — waiting on a chartered accountant

Every constant below stays `CANDIDATE` until a human CA answers in writing with a
primary source. An AI reading tax blogs does not count and never will. When the
answer arrives: one new PR, `VERIFIED` from that source.

| ID | Item | Why parked |
|---|---|---|
| C4 | Professional tax for BR/JH/AS/CG/SK/ML/TR/PY | No primary state-Act figure |
| C11 | Leave-encashment exemption / ₹25L cap | Retirement path already hidden |
| C12 | Notice-period GST / tax / gross-up | Shown as disputed, not computed |
| C13 | s.234B/C interest | Deliberately not modelled |
| C14 | ESOP Rule-3 FMV | Awaiting review |
| C15 | PF withdrawal TDS in rupees | Awaiting review |
| — | HRA eight-city list | Secondary sources only |
| — | real-hike rent wipe · clawback two-date · counter-offer in-hands | Unless Kalpit names them |
