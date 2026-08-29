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
2. **Verdict is below the form on mobile.** `order-first` appears nowhere in
   `src/`. The results column of every island should lead on a phone.
3. **No demo chip.** Nothing detects `DEFAULT_OFFER` or fixture dates, so a
   visitor cannot tell example numbers from their own.
4. **Empty is not clean.** No blank-input guard (`allBlank` / `isPristine`),
   so fake-offer and bond-scanner render a verdict banner over empty inputs.
5. **`ShareRow` is on 2 tools, not every money verdict.** Present in
   `notice-buyout` and `offer-comparison` only. The primitive already exists.
6. **No inherit disclosure.** Tools that reuse Decoder structure (hike,
   variable, compare, relocation, counter) never say so.
7. **No CTC unit lock.** Nothing prevents a `₹` CTC and an LPA variable sitting
   in the same card.
8. **Tagline and privacy pill still clip at 390px.** The only `break-words` in
   `src/` is the redactor's output box.
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

## Already fixed — do not re-open

- Stealth label is now "Notes mode" / "नोट्स मोड".
- `ui.copy` reads "Copy", not "Copy the headline".
- `todayISO()` uses the local calendar date, not UTC.
- The relieving day-30 labour-commissioner threat is gone.

## Deliberately not carried over

The audit's "what not to build" list is product direction and belongs to Kalpit,
not to a docs file that agents read. Its one durable rule already lives in
`AGENTS.md`: no statutory changes while the CA review is open.
