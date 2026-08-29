# Open UX and logic fixes

Extracted 2026-08-29 from a 225-line product audit of `build/suite` (2026-08-23,
PR #6, closed not merged). The audit's essay half — executive verdict, four
persona reviews, "what not to build" — has served its purpose and is not kept.
Only items still open against `main` survive here.

Every line below was checked against the current tree, not copied on trust.
Four items the audit raised are already fixed and are listed at the bottom so
nobody re-opens them.

## UI — verified still open

1. **Home is a grid, not a journey.** No `tool.category` grouping anywhere in
   `src/tools/home/`. Audit wanted four category headings, Decoder / Offer
   comparison / Resignation pinned, nav twins dropped from the grid.
6. **No inherit disclosure.** Tools that reuse Decoder structure (hike,
   variable, compare, relocation, counter) never say so.
7. **No CTC unit lock.** Nothing prevents a `₹` CTC and an LPA variable sitting
   in the same card.
9. **Two Scripts tools, not one** (`hr-script`, `manager-script`). Down from six,
   so this is half-done.

## Logic — still open

10. **Clawback has no editable taxable amount or regime**, and dates by whole
    months rather than credit-date → planned LWD.
11. **ESOP has no annual-vest option.** Model honesty, not a tax change.

## Features the audit judged real holes — none built

12. **F&F dispute-mail draft.** The audit called this *the* flagship output.
13. **Notice-tracker as a cockpit** — rows deep-linking to F&F, insurance, EPF,
    relieving.

## Not mechanically verifiable — needs an engine read before acting

F&F claimed-vs-recomputed netting; notice-buyout leave-day netting and seeding
gross from cash gross rather than CTC/12; real-hike/compare handling a
differently-stuffed new CTC; resignation→EPF earliest safe join date;
relieving-chaser send-on dates from LWD; leave-encashment retirement path
scoping. The markers exist in the code; whether they behave as the audit
describes was not confirmed here.

## Closed 2026-08-29 — the mobile pass

Numbering above is the audit's; the five items below keep their original
numbers so older notes still resolve.

- **2 — done.** Every two-column island's results column carries
  `-order-1 lg:order-none`, so the verdict leads on a phone and desktop is
  unchanged. Measured on notice-buyout at 375px: results moved from y=906
  (below an 812px fold) to y=359.
- **3 — done.** The example chip went from 6 tools to 16 — every tool that
  boots on fixture numbers. The markup five tools had copied is now
  `ExampleNote` in `ui.tsx`. Two defects fixed on the way: `form16-shock`
  decided example-ness once at mount, so the note outlived the user's own
  numbers, and its first paint showed a verdict on a figure hydration then
  replaced.
- **4 — was never open.** `fake-offer` and `bond-scanner` have guarded blank
  input since before the audit; the guard is named `isBlank`, which the audit's
  grep for `allBlank` / `isPristine` missed. Both render a dedicated blank
  string, not a verdict.
- **5 — done.** `ShareRow` went from 2 tools to 13 — Copy and Print after every
  money verdict, gated on the example state. EPF, insurance gap, tracker, BGV
  and the scanners were left alone: their verdicts are guidance, not a number
  anyone pastes.
- **8 — does not reproduce.** Checked at 320px and 375px, EN and HI, on home,
  notice-buyout and offer-comparison: `documentElement.scrollWidth` equals the
  viewport and no element overflows its box. The tagline and privacy pill wrap
  normally. The only overflow found anywhere was a native `<select>` clipping
  its own option text at 320px, which is browser behaviour. Absent
  `break-words` was not causing a clip.

## Already fixed — do not re-open

- Stealth label is now "Notes mode" / "नोट्स मोड".
- `ui.copy` reads "Copy", not "Copy the headline".
- `todayISO()` uses the local calendar date, not UTC.
- The relieving day-30 labour-commissioner threat is gone.

## Deliberately not carried over

The audit's "what not to build" list is product direction and belongs to Kalpit,
not to a docs file that agents read. Its one durable rule already lives in
`AGENTS.md`: no statutory changes while the CA review is open.
