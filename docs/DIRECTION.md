# DIRECTION — from a toolkit to a switch plan

Written 2026-09-05 by Claude Fable 5.1 at Kalpit's request, after three
colleagues saw the site and did not want it. **Kalpit decides.** Nothing here is
in force until he applies it: Part 1 belongs in `PRODUCT.md`, Part 2 in
`ROADMAP.md`. Part 3 stays here as the build guide for coding agents until Phase 2
is done, then this file is deleted. It must not become a second strategy document
that drifts.

---

## 0. What we learned, and what it means

Three colleagues. Not one wanted to use it. What they said, stripped of politeness:

1. **"Can't I do this with ChatGPT?"** The home page was a decoder and a grid of
   tools. A grid of calculators looks like a thing a chatbot replaces.
2. **"I need something to get me started."** Their problem is not arithmetic.
   It is that they have wanted to leave for months and have done nothing.
3. **"Most of this only matters after I start, or after I have an offer."**
   Twenty-seven tools, and the person at the front door can use about two.

The site was built for stage 3, "the number on the table". The person who
arrives is at stage 0, "I'm done here", and cannot get from the thought to the
first action. `PRODUCT.md` already names this person as the first user and admits
stage 0 is the thinnest. The colleagues confirmed it is the only stage that
matters for whether anyone comes back.

**The verdict:** the calculators are not wrong. They are the payload. The product
that is missing is the thing that carries a stuck person from "I'm done here" to
their first application, and then stays with them. That thing is a **plan with
dates**, not a grid of tools.

---

## 1. The vision

**Switch Karle turns the thought "I'm done here" into a dated plan and one action
you can do today, then walks beside you until your first day at the new job.**

Two sentences for the home page, to replace the tagline:

> You have wanted to leave for a while. Answer three questions and get your
> switch calendar, your first fifteen-minute action, and the numbers nobody
> else in the conversation has.

### The core loop

```
 three questions you know by heart
        ↓
 your switch calendar        (dates: gratuity flip, bond end, clawback end,
        ↓                     hike credit, best resign window, LWD)
 pick your date
        ↓
 one action, ≤15 minutes, today
        ↓
 come back → "You said: <your reason>. Day 12. Next: <action>."
        ↓
 stage advances → the tools for THIS stage appear, the rest stay out of the way
```

Everything that exists today keeps its place inside that loop. The decoder is
what appears when a card reaches "offer". The notice tracker is what appears the
day the letter goes in. Nothing is deleted. The front door changes.

### Why this beats "just ask ChatGPT", and where it does not

Your AI can advise. It cannot hold your date. It does not know your gratuity
flips on 14 March, that your bond ends in May, that you promised yourself you
would apply to one company this Saturday, or that today is day 12 and you have
done nothing since day 4. A plan is a **stateful thing over months**. A chat is
not. Where a chatbot is better, at wording a message or researching a company,
the plan hands you a prompt and sends you there. That concession is what makes
the rest believable. Do not build a "why not ChatGPT" section; demonstrate it.

---

## 2. The product: the Plan

### The object

One record on the device, `switchkarle.plan.v1`. Fields the user knows by heart
or chooses; nothing that needs a document opened:

| Field | Source | Why it is here |
|---|---|---|
| `reason` | typed, one line | Shown back on every return. Theirs, not ours. |
| `joinDate` | typed | Gratuity flip date (existing engine) |
| `noticePeriodDays` | shared current-job record | Resign date → last working day |
| `hikeCreditMonth` | typed, optional | Leaving before the hike lands forfeits it |
| `bondEndDate` | typed, optional | A cliff with a rupee figure the user knows |
| `joiningBonusDate`, `clawbackMonths` | typed, optional | Existing clawback engine |
| `targetResignDate` | chosen from the calendar | The commitment |
| `stage` | derived from actions done and tracker state | Which tools appear |
| `actionsDone` | checkboxes, with dates | Progress, and the return message |
| `startedOn` | set once | "Day 12" |

Money never enters the plan record except through engines that already hold it.
No salary in the plan card, the calendar export, or anything shareable.

### First session: three questions, one screen

Join date. Notice period. The month your hike hits your account (skip allowed).
Then, immediately, the switch calendar, in the user's own dates:

> Gratuity flips on 14 Mar 2027, 6 months away. Leaving before it costs ₹2.1L.
> Your hike lands in May. Best resign window: after 1 June.
> To resign on 1 June you need an offer by 18 May, so you start applying by
> 23 March. First action today: write the one-line reason you are leaving.

Then: **pick your date**. Then one button each: add the dates to your calendar,
tell one person, come back Sunday.

Statutory dates come from engines with `VERIFIED:` markers. Lead times ("offer
by", "start applying by") are **conventions the user can edit**, labelled as
such: 8 weeks from first application to offer, 2 weeks of buffer. Never present
a lead time as a fact.

### Return session

The plan is the home page for anyone with a saved plan. It opens with their
reason in their words, the day count, the next action, and the date with days
remaining. One action visible at a time. The tools for the current stage sit
below it. Everything else is behind "All tools".

### The next-action library

Stage 0 → 1. Each action is fifteen minutes or less, has a done box, and is
either done inside the product or points to a specific external place. Pure data
in `src/data/actions.ts`, copy in i18n, order tested.

1. Write the one-line reason you are leaving. *(in product)*
2. Pick your resign date from the calendar. *(in product)*
3. Enter your current in-hand, so every offer later shows as a delta against
   it. *(current-job record)*
4. Name five companies you would say yes to. *(tracker cards; role optional)*
5. Tell one person. *(share card: dates only, no money)*
6. Message one ex-colleague for a referral. *(Scripts tool)*
7. Update your Naukri and LinkedIn headline. *(external; a checklist, never
   automation)*
8. Research company one with your own AI. *(Prompt Studio)*
9. Block two hours on Saturday for applications. *(calendar export)*
10. Apply to one.

After 10 the plan hands over to the board, which already knows what to do
with an application, an interview and an offer.

### How the 27 tools fit

| Stage | Appears in the plan | Stays behind "All tools" |
|---|---|---|
| 0 "I'm done here" | gratuity, bond scanner, bonus clawback, leave encashment | everything else |
| 1 "Looking, quietly" | tracker, Prompt Studio, redactor | |
| 2 "Talking to them" | scripts (expected CTC), real hike | |
| 3 "The number on the table" | decoder, offer comparison, variable, ESOP, fake offer, relocation | |
| 4 "Telling them" | resignation letter, scripts (manager), counter-offer, notice buyout | |
| 5 "Serving it out" | notice tracker, handover, F&F, relieving chaser, insurance gap | |
| 6 "The first 90 days" | EPF transfer, BGV prep, tax declaration, Form-16 shock | |

No tool is deleted. No new calculator is built until Phase 2 is done.

### Calendar export

An `.ics` file with the milestones, generated as a string in `src/lib/`, offered
as a download like the share image. **Default event titles are neutral**
("Personal milestone", "Personal: block 2h"), because the calendar it lands in
may be the employer's. The user can rename. No money in any event.

---

## 3. Design rules for will power

Append to the eight in `PRODUCT.md`. Each is checkable.

9. **One next action, never a list.** The plan shows the single next thing.
   Completing it reveals the next. A list of ten is a reason to close the tab.
10. **Every action fits in fifteen minutes.** If it does not, split it.
11. **Dates before money.** The first output is a calendar. Money attaches to
    dates ("leaving before 14 March costs ₹2.1L"), not the other way round.
12. **Their words, shown back.** The reason they typed opens every return
    session. The product never writes their motivation for them.
13. **A date is a decision; make it visible.** Days remaining on every visit.
    Changing the date is allowed and is recorded, not judged.
14. **Get them out of the product.** The best actions happen on Naukri, in a
    WhatsApp message to an ex-colleague, in their own AI. The plan points and
    lets go. Automating any of that is still out.

---

## 4. Roadmap proposal

For `ROADMAP.md`. Settled items stay settled. "Not doing" stays as is.

### Now

- **The plan is the home page.** Three questions, the switch calendar, pick a
  date, one action. Pure `switchCalendar` engine with golden cases; plan store;
  home island. EN and HI.
  *Why:* three of three test users could not get from the thought to an action.
- **The tagline says what the site is.** The two sentences in Part 1.
- **Ten-person test, round two.** Same protocol as Part 5. Runs the week the
  plan ships, not after "complete".

### Next

- **Next-action library, stages 0 → 1.** Ten actions, done boxes, the return
  message. Tracker accepts a company with no role.
- **Calendar export and the "tell one person" card.** Dates only, neutral
  titles.
- **Stage gating of the existing tools.** Each stage surfaces its own; the rest
  move behind "All tools". Home stops being a grid.
- **Prompt Studio knows the plan.** Prompts pre-filled with company and stage,
  never with money.

### Later

- **Offer goes cold.** The stage-5 fear: what to do on day 40 of notice when the
  new employer stops replying. Already on the roadmap; it belongs in the plan.
- **Reminders that reach you.** The web cannot schedule a notification without
  a server. Calendar export is the honest ceiling today. A server-side reminder
  would be the first named, opt-in feature that moves user data, and is
  Kalpit's decision under `PRIVACY.md`, not an agent's.
- **Native Hindi pass, domain cutover, distribution date.** Unchanged, in
  Kalpit's hands. Distribution unparks when round two clears the bar.

### Stop

- New calculators, until Phase 2 is done.
- Expert panels, unconstrained audits, multi-agent research dossiers.
- Governance ceremony sized for a team: the record lane, long decision entries,
  handoff dossiers. Keep `DECISIONS.md` at five lines an entry.

---

## 5. Measurement without analytics

There is no telemetry and there will be none. The measurement is ten people and
a WhatsApp message. **Write the bar before showing anyone.**

**Cohort.** Ten people who have said, in the last six months, that they want to
leave their job. Colleagues, ex-colleagues, friends. Not founders, not people
already interviewing.

**Send.** One message: "Open this, answer the three questions, and do the first
action if you feel like it. I'll ask you three things next Sunday."

**Ask, seven days later.**
1. Did you do the first action?
2. Did you pick a date?
3. Will you open it again this Sunday?

**The bar.** At least 5 of 10 did the first action. At least 4 picked a date.
At least 3 say they will return. Any one missed: fix and run round three with
ten new people. **Missed twice: stop building.** Rethink the premise rather than
add a tool.

**What not to measure.** Compliments, "looks clean", "nice idea". Only the three
questions count.

---

## 6. Realisation plan for coding agents

Each phase is one or two PRs. Each brief is self-contained because every agent
starts blank. Tier routing per Kalpit's global rules: engine and goldens to the
workhorse tier, anything the user reads to a high-taste tier, review to the
deep-reasoner tier. Gates before every PR: `test`, `typecheck`, `lint`, `build`,
`check:base`, `check:seo`, `check:csp`. Kalpit merges.

### Phase 0 — the switch calendar and the new front door

**Brief for the engine agent.**
Create `src/engine/switchCalendar.ts`, pure TypeScript, React-free, with
`src/engine/switchCalendar.test.ts` written first. Input: `joinDate`,
`noticePeriodDays`, optional `hikeCreditMonth` (1–12), optional `bondEndDate`,
optional `joiningBonusDate` + `clawbackMonths`, optional `targetResignDate`,
`offerLeadWeeks` (default 8) and `offerBufferDays` (default 14), `asOf`.
Output: a list of dated cliffs `{ id, date, kind: 'statutory' | 'contractual' |
'convention', daysAway }` (gratuity flip via the existing `gratuity` engine's
`flipDate`; bond end; clawback end via the existing `clawback` engine; hike
credit as the first of the month after `hikeCreditMonth`), the `earliestCleanDate`
(day after the latest cliff the user has not chosen to ignore), and the backward
plan from the resign date: `lastWorkingDay`, `needOfferBy`, `startApplyingBy`,
each with `daysAway`. Engines return ids; the UI maps them through `t()`. At
least eight hand-derived golden cases, including: no optional fields; gratuity
already eligible (no flip); a resign date before a cliff (the cliff is listed
as forfeited, never silently dropped); a 5-day week establishment. Reuse
`src/engine/dates.ts`. Do not invent a statutory number; conventions are marked
`kind: 'convention'` and the defaults are exported constants.

**Brief for the plan store agent.**
Create `src/data/plan.ts` with key `switchkarle.plan.v1`, shape from Part 2,
read through `src/lib/storage.ts`. It echoes on mount like every tool, so it
does not need `releaseBootEcho`; read `docs/ARCHITECTURE.md` "Nothing is written
until the user types" before writing a line. `noticePeriodDays` is read from and
written to the shared current-job record in `src/data/currentJob.ts`, never
duplicated. Tests in the style of `src/data/currentJob.test.ts`.

**Brief for the home agent (high-taste tier).**
Home becomes the plan. No saved plan: the two tagline sentences, three fields,
the calendar rendered as the example does in Part 2, a "pick your date" control,
the first action. Saved plan: reason, day count, next action, date with days
remaining, the stage's tools below. The tracker moves under stage 1 and is
reached from the plan. Copy in `en.ts` with Hindi pairs in `hi-suite.ts`,
code-mixed register, domain words in Latin. Rule 1 holds: a real calendar
renders from example inputs behind the Example chip before anyone types. Verify
in the browser at 375px: the first action must be above the fold.

**Done when:** a stranger with no saved data lands, reads two sentences, answers
three questions, sees their dates and one action, and the URL, tab title and
storage keys have not changed for anyone with existing data.

### Phase 1 — actions, return, calendar, share

- `src/data/actions.ts`: the ten actions, ordered, each with `id`, `stage`,
  `minutes`, `where: 'here' | 'tool:<slug>' | 'external'`, tested for order and
  for every `tool:` slug existing in the registry.
- Return session per Part 2. Done boxes write `actionsDone` with dates.
- Tracker: a card may be saved with a company and no role (PRODUCT rule 2).
- `src/lib/ics.ts`: pure string builder, tested against a fixed expected file.
  Neutral titles by default. Download offered like the share image.
- "Tell one person" card: dates and stage only. Reuse the share-image path.

**Done when:** a round-two tester can go from the first visit to "applied to
one" without seeing a tool grid, and nothing with a rupee in it can be shared.

### Phase 2 — the tools take their places

- Each tool's registry row gains its stage from Part 2's table; the plan renders
  the stage's tools; "All tools" keeps the full list and search.
- Prompt Studio reads company and stage from the plan. Never money.
- A test asserts every tool appears in exactly one stage.

**Done when:** the word "grid" no longer describes the home page, and every
tool is reachable in two taps from the plan or from "All tools".

### Phase 3 — Kalpit's

Native Hindi pass. Domain cutover. Distribution date. Not agent work.

---

## 7. Risks, said plainly

- **The premise may be wrong.** Ten people may take the first action and still
  not switch, or not take it at all. The bar in Part 5 exists so that failure is
  visible in two weeks, not two years.
- **A plan is harder to make than a calculator.** Copy carries the product
  here. Agent-written motivational copy is the fastest way to make it feel like
  an app that wants something from you. Keep the voice in `PRODUCT.md`: plain,
  no cheerleading, bad news first.
- **"Tell you what to do next" edges toward advice.** Stay with dates,
  arithmetic and pointers. The reason is theirs. The career judgement is theirs.
- **Reminders are weak without a server.** Said in Part 4. Do not solve it with
  a push service quietly.
- **The pivot can itself become over-engineering.** The guard is Phase 0's
  scope: three questions, one screen, one engine. If Phase 0 takes more than two
  weeks of agent work, it has grown; cut it back.
- **Bilingual doubles copy churn while copy is changing weekly.** Rule 4 stands.
  Hindi ships as agent draft, as it does today, and the native pass stays in
  Phase 3.

---

## 8. What to keep

The pure engine and its goldens. The `VERIFIED:` markers and the refusal to ship
an untraced number. Local-first with an erase button. English and Hindi as one
product. The refusal to do listings, automation, resumes, salary bands, or an
in-page AI. These are the parts three colleagues did not see and the parts a
chatbot cannot copy. The plan is how they finally get seen.
