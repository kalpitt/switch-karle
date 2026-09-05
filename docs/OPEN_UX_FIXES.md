# Open UX and logic fixes

> **SUPERSEDED 2026-09-05.** Kept as history. Item 1 below ("Home is a grid, not
> a journey — done") was reversed on 2026-08-30 when the tracker became the home
> page; see `docs/DECISIONS.md` for both entries and why. Nothing here is a work
> list.

Extracted 2026-08-29 from a 225-line product audit of `build/suite` (2026-08-23,
PR #6, closed not merged). The audit's essay half — executive verdict, four
persona reviews, "what not to build" — has served its purpose and is not kept.

**Everything on this list is now closed.** What follows is the record of how,
kept because two items were closed by disproving them and six of the seven
unverifiable claims turned out to be either fine or differently wrong. Nothing
here is a work list any more; the next agent should treat it as history.

## UI

1. **Home is a grid, not a journey — done.** The registry had carried
   `category` and `stage` on every tool for months and the page ignored both.
   Three pinned starters, then the four phases in journey order. Tracker and
   Prompts left the grid; they were the only tools listed twice on the page.
   Ordering lives in `src/data/home.ts`, pure and tested, so a tool cannot
   silently fall out of the page.
2. **Verdict below the form on mobile — done.** The results column carries
   `-order-1 lg:order-none`. Measured on notice-buyout at 375px: results moved
   from y=906, below an 812px fold, to y=359. Desktop unchanged.
3. **No demo chip — done.** From 6 tools to 16, every tool that boots on
   fixture numbers. `ExampleNote` in `ui.tsx` replaced markup five tools had
   copied. Two defects fixed on the way, both in `form16-shock`.
4. **Empty is not clean — was never open.** `fake-offer` and `bond-scanner`
   have guarded blank input since before the audit; the guard is named
   `isBlank`, which the audit's grep for `allBlank` / `isPristine` missed.
5. **`ShareRow` on 2 tools — done.** Now 13: Copy and Print after every money
   verdict, gated on the example state. EPF, insurance gap, tracker, BGV and
   the scanners are deliberately out — their verdicts are guidance, not a
   number anyone pastes.
6. **No inherit disclosure — done.** Real hike, variable pay, relocation,
   counter-offer and offer comparison say where the basic/HRA split and PF
   settings come from, with a link to change them. tax-declaration already
   disclosed it in its own words.
7. **No CTC unit lock — done.** Three tools asked for CTC in rupees and
   variable pay in lakhs in the same card. Both are rupees now, and
   `src/tools/units.test.ts` fails if any form file mixes the two again. The
   Decoder is in lakhs throughout and was left alone.
8. **Tagline and privacy pill clip at 390px — does not reproduce.** Checked at
   320px and 375px, EN and HI, on home, notice-buyout and offer-comparison:
   `documentElement.scrollWidth` equals the viewport and no element overflows
   its box. The only overflow found anywhere was a native `<select>` clipping
   its own option text at 320px, which is browser behaviour.
9. **Two Scripts tools — done.** One tool, `src/tools/scripts/`, serving all
   seven URLs, which stay where they were. The page gained a switcher row.
   Expected CTC keeps its money inputs and locked copy; the manager
   conversation keeps its tone picker and the last working day it reads from a
   saved resignation draft.

## Logic

10. **Clawback had no editable taxable amount or regime, and dated by whole
    months — done.** Both tax inputs are fields now and live in the saved
    draft. Whole months are gone: the tool asks for the credit date and the
    planned last working day, and `monthsBetween` returns the fraction, so
    11.84 months against a 12-month window still repays the gross. It used to
    round that to 12 and tell you the money was yours.
11. **ESOP had no annual-vest option — done.** `vestCadence` is an input;
    annual releases one tranche at the cliff and one per anniversary. A test
    asserts perquisite, tax and cash needed are identical across cadences —
    this was model honesty, not a tax change.

## Features the audit judged real holes

12. **F&F dispute-mail draft — built.** Subject, greeting, one numbered
    paragraph per gap, a close that asks for the calculation basis. Copy gated
    on your name. `disputeItems` is pure and tested; the sentences are i18n in
    both languages. The first version asked HR to explain a deduction they had
    not taken — `FnFAuditLine` now carries `kind`, and the mail raises only
    what is yours to raise. Nothing statutory is asserted in the letter.
13. **Notice-tracker as a cockpit — built.** Five of six milestones link to
    the tool that does the thing. `asset-return` deliberately does not: handing
    back a laptop has no tool behind it. A test pins exactly that.

## The seven claims that needed an engine read

Read 2026-08-29. Three were real and are fixed in the same branch; four were
already correct, and one of those is better than the audit assumed.

- **F&F claimed-vs-recomputed netting — correct.** A gratuity the sheet never
  listed is flagged, never added into the net. The `continue` and the master
  plan §9.3 comment are both in `fnf.ts`.
- **Notice-buyout seeding gross from cash gross — correct.** It seeds
  `grossSalary / 12`, not `ctcAnnual / 12`, and warns when the two coincide.
- **Notice-buyout leave-day netting — was missing, now built.** `buyoutQuote`
  took unserved days and nothing else. Leave applied against notice is an
  input now, capped at the unserved days, marked CANDIDATE in the engine and
  on the page: it is contractual, never statutory.
- **Real-hike handling a differently-stuffed new CTC — was broken, now
  fixed.** `asOffer(..., 'next')` spread the current template, so the new CTC
  inherited the current employer's basic percentage — the exact thing the tool
  exists to expose. The new offer's basic is its own field.
- **Resignation → EPF earliest safe join date — was half-built, now shown.**
  The overlap warning existed; the date that is actually safe did not. It
  prints LWD + 1.
- **Relieving-chaser send-on dates from LWD — correct, and stricter than the
  audit assumed.** Day 7/14/30 templates key off the last working day, and
  copy stays locked until that day has actually passed.
- **Leave-encashment retirement path scoping — correct.** The only selector on
  the page is the 26/30 divisor; a stored retirement draft is coerced back to
  resignation on load.

## Already fixed before this branch — do not re-open

- Stealth label is now "Notes mode" / "नोट्स मोड".
- `ui.copy` reads "Copy", not "Copy the headline".
- `todayISO()` uses the local calendar date, not UTC.
- The relieving day-30 labour-commissioner threat is gone.

## Deliberately not carried over

The audit's "what not to build" list is product direction and belongs to Kalpit,
not to a docs file that agents read. Its one durable rule already lives in
`AGENTS.md`: no statutory changes while the CA review is open. Nothing in this
branch moved a statutory number, citation, or legal claim.
