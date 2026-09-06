# DIRECTION — what we build next, and why

Written 2026-09-06 for Kalpit, after three colleagues looked at Switch Karle and
did not want to use it.

**This is a proposal. Kalpit decides.** Nothing here is in force until he says
so. Parts 1 to 6 are written for him to read and argue with. Part 7 is build
instructions for coding agents and he can skip it. Once the plan described here
is built, delete this file, so the repo never ends up with two documents both
claiming to say what the product is.

---

## 1. What we learned

Three colleagues opened the site. None of them wanted it. What they meant,
underneath the politeness:

**"Can't I just ask ChatGPT this?"** They saw a page of calculators. A page of
calculators looks like something a chatbot already does.

**"I need something to get me started."** Their problem was never the maths.
They have wanted to leave for months and have done nothing about it.

**"Most of this only matters once I've started, or once I have an offer."**
There are 27 tools. Someone standing at the front door can use about two of
them.

Here is the mismatch, in one line. **The site was built for the day you get an
offer. The person who shows up has not applied anywhere yet.**

The calculators are not the problem. They are good, they are accurate, and they
cite their sources. They are just the wrong thing to show someone first. What is
missing is the thing that gets a stuck person from "I want to leave" to their
first application, and then stays with them for the nine months that follow.

That thing is **a plan with dates on it**, not a page of tools.

---

## 2. What we build

One sentence for what the product is:

> **Switch Karle turns "I'm done here" into a dated plan and one thing you can
> do today, then walks with you until your first day at the new job.**

Two sentences for the home page, replacing today's tagline:

> You have wanted to leave for a while. Answer three questions and get your
> switch calendar, the first fifteen-minute thing to do, and the numbers nobody
> else in the conversation has.

### What it looks like for a real person

Meet Ravi. 31, four years and eight months at an IT services company in Pune,
90 days notice. He has been saying he will leave since January. It is now
September. He has applied nowhere.

He lands on the site. It asks three things he knows without opening anything:

1. When did you join? *August 2021*
2. What is your notice period? *90 days*
3. Which month does your hike hit your account? *May* (he can skip this)

He gets his calendar back straight away:

> **Your gratuity flips on 1 August 2026.** Four months away. Leaving before
> that date costs you ₹2,10,000.
> **Your hike lands in May.** Leaving before it means you never see it.
> **Best window to resign: after 1 June.**
> To resign on 1 June you need an offer in hand by 18 May. Which means you
> start applying by 23 March.
>
> **Today, fifteen minutes: write down the one line reason you are leaving.**

Then one button: put these dates in my calendar. And a date to pick.

He picks 1 June. He writes his reason. He closes the tab.

He comes back on Sunday. The page opens with:

> *"My manager takes credit for my work and I have stopped learning."*
> Day 12. Next: name five companies you would say yes to. Twelve minutes.
> 267 days until 1 June.

That is the product. The calculators sit underneath it and appear when they are
relevant. The decoder shows up when he has an offer. The notice tracker shows up
the day he resigns.

### Why this is not something a chatbot replaces

This is the answer to the first objection, and it is not "we are more accurate."

**A chatbot cannot hold your date.** It does not know your gratuity flips on 1
August, that your bond ends in May, that you promised yourself you would apply
this Saturday, or that today is day 12 and you have not moved since day 4. A
plan is a thing that lives across months. A chat window is not.

**Where a chatbot is genuinely better, we hand it the job.** Wording a message
to your manager, researching a company. Prompt Studio already does exactly that:
we write the prompt, you run it in your own AI, in your own account. Admitting
that openly is what makes the rest of it believable.

**Do not build a page arguing with ChatGPT.** Arguing with the objection
concedes it, and puts a competitor's name above the fold on our own site. Show
it instead: a section of the Act under a number, on a screen a chatbot cannot
produce.

---

## 3. What the plan remembers

One record on the person's device. Only things they know by heart or choose.
Nothing that needs a document opened.

| What | Why we ask |
|---|---|
| The reason they are leaving, one line | Shown back to them on every visit. Their words, not ours. |
| Join date | Works out the gratuity date and what leaving early costs |
| Notice period | Works out the last working day. Already shared across tools since PR #39 |
| Month the hike lands | Leaving before it forfeits it |
| Bond end date, if any | A date with a rupee figure attached |
| Joining bonus date and clawback window, if any | Same |
| The date they picked to resign | The commitment |
| Which actions they have ticked off, and when | Progress, and the "day 12" line |

**No salary in this record.** Money stays in the tools that already hold it. The
calendar file we hand them has no money in it either, and the events are
deliberately dull, because it may end up in their work calendar.

**Two kinds of number, and we must not confuse them.** Gratuity dates come from
the Act and carry a section number. Lead times like "you need an offer 8 weeks
after you start applying" are conventions we made up from ordinary experience.
Those are labelled as conventions and the person can edit them. We never dress a
convention up as a fact.

---

## 4. The first ten actions

Each one is fifteen minutes or less. Each has a tick box. Each is either done on
the site or points at a specific place elsewhere.

1. Write the one line reason you are leaving. *(on the site)*
2. Pick your resign date from the calendar. *(on the site)*
3. Enter your current in-hand, so every offer later shows as a difference
   against it. *(the shared record from PR #39)*
4. Name five companies you would say yes to. *(tracker cards, no job title
   needed)*
5. Tell one person. *(a share card with dates only, no money)*
6. Message one ex-colleague about a referral. *(Scripts tool)*
7. Update your Naukri and LinkedIn headline. *(a checklist, never automation)*
8. Research the first company using your own AI. *(Prompt Studio)*
9. Block two hours on Saturday for applications. *(calendar file)*
10. Apply to one.

After ten, the board takes over. It already knows what to do with an
application, an interview and an offer.

---

## 5. Where the 27 tools go

Nothing gets deleted. Everything gets a home, and only its own stage's tools are
on screen at a time. The rest live behind "All tools", which keeps the search.

| Stage | Shown at this stage |
|---|---|
| "I'm done here" | gratuity, bond scanner, bonus clawback, leave encashment |
| "Looking, quietly" | tracker, Prompt Studio, redactor |
| "Talking to them" | scripts for expected CTC, real hike |
| "The number on the table" | decoder, offer comparison, variable pay, ESOP, fake offer, relocation |
| "Telling them" | resignation letter, manager scripts, counter offer, notice buyout |
| "Serving it out" | notice tracker, handover, F&F, relieving chaser, insurance gap |
| "The first 90 days" | EPF transfer, BGV prep, tax declaration, Form-16 shock |

**No new calculator gets built until the plan exists.** That is the point of
this whole document.

---

## 6. Six rules for building something that gets people moving

These go alongside the eight rules already in `PRODUCT.md`. Each one can be
checked against the code.

**9. One next thing, never a list.** Show the single next action. Finishing it
reveals the next one. A list of ten is a reason to close the tab.

**10. Fifteen minutes, or split it.** If an action does not fit in fifteen
minutes it is really two actions.

**11. Dates before money.** The first thing we give back is a calendar. Money
attaches itself to a date, as in "leaving before 1 August costs you ₹2,10,000".
Never the other way round.

**12. Their words, given back.** The reason they typed opens every visit. We
never write their motivation for them.

**13. A date is a decision, so keep it visible.** Days remaining, every visit.
Changing the date is allowed and recorded. Never nagged about.

**14. Send them out of the site.** The best actions happen on Naukri, in a
WhatsApp message, in their own AI. The plan points and lets go. Automating any
of that is still off the table, permanently.

---

## 7. What goes on the roadmap

For `ROADMAP.md`, if Kalpit accepts this. Everything in Settled stays settled.
Everything in Not Doing stays there.

### Now

- **The plan becomes the home page.** Three questions, the calendar, pick a
  date, one action. English and Hindi.
  *Why: three out of three people could not get from the thought to an action.*
- **The tagline says what the site is.** The two sentences in Part 2.
- **The ten person test, round two.** Run it the week the plan ships. Not after
  "the site is complete".

### Next

- **The first ten actions**, with tick boxes and the returning-visitor line.
  The tracker accepts a company with no job title.
- **Calendar file, and the "tell one person" card.** Dates only, dull titles.
- **The tools move behind their stages.** The home page stops being a grid.
- **Prompt Studio reads the plan**, so prompts arrive pre-filled with the
  company and the stage. Never with money.

### Later

- **When an offer goes cold.** What to do on day 40 of your notice when the new
  employer stops replying. Already on the roadmap. It belongs inside the plan.
- **Reminders that actually reach someone.** A website cannot send a reminder
  without a server. A calendar file is the honest limit today. A real reminder
  would be the first feature that moves user data off the device, so it is
  Kalpit's call under `PRIVACY.md`, never an agent's.
- **Native Hindi pass, domain switch, and a distribution date.** Unchanged, and
  his.

### Stop doing

- New calculators, until the plan is built.
- Expert panels, unconstrained research audits, multi-agent research documents.
- Process built for a team of people: the record lane, long decision entries,
  handoff dossiers. Keep decision entries to about five lines.

---

## 8. How we find out if it worked

No analytics, ever. The measurement is ten people and a WhatsApp message.
**Write the pass mark down before showing anyone**, so the result cannot be
argued with afterwards.

**Who.** Ten people who have said in the last six months that they want to leave
their job. Colleagues, ex-colleagues, friends. Not founders. Not people already
interviewing.

**The message.** "Open this, answer the three questions, and do the first thing
if you feel like it. I'll ask you three questions next Sunday."

**Ask a week later.**

1. Did you do the first action?
2. Did you pick a date?
3. Will you open it again this Sunday?

**The pass mark.** Five of ten did the first action. Four picked a date. Three
say they will come back. Miss any one of those, fix it and run it again with ten
new people. **Miss twice and stop building.** The premise is wrong and adding
another tool will not fix it.

**What does not count.** "Looks clean." "Nice idea." Compliments are not data.
Only the three questions count.

---

## 9. What could go wrong

Said plainly, because these are real and one of them is likely.

- **The premise might be wrong.** People may take the first action and still not
  switch. Or not take it at all. The pass mark in Part 8 exists so that this
  shows up in two weeks instead of two years.
- **A plan is harder to write than a calculator.** The words carry this product.
  Agent-written motivational copy is the fastest possible way to make it feel
  like an app that wants something from the user. Keep the voice already written
  in `PRODUCT.md`: plain, unhurried, bad news first, no cheerleading.
- **"Tell me what to do next" drifts towards giving advice.** Stay on dates,
  arithmetic and pointers. The reason for leaving is theirs. The career
  judgement is theirs.
- **Reminders are genuinely weak without a server.** Said above. Do not quietly
  solve it with a push service.
- **This pivot could itself become over-engineering.** The guard is the size of
  the first phase: three questions, one screen, one calculation. If it takes
  more than two weeks of agent work, it has grown, and it should be cut back.
- **Two languages while the words are changing weekly.** The Hindi rule stands.
  Hindi ships as an agent draft, exactly as it does today, and the native
  writer's pass stays where it is on the roadmap.

---

## 10. What we keep

None of this throws away the good work.

The pure calculation engine and its hand-checked test cases. The rule that no
number ships without a source and a date. Local-first with an erase button.
Hindi as the same product rather than a translation. The refusal to do job
listings, automation, resume builders, salary bands, or an AI assistant inside
the page.

Those are the parts three colleagues never got far enough to see, and the parts
a chatbot cannot copy. The plan is how they finally get seen.

---

## 11. Build instructions for coding agents

**Kalpit can stop reading here.** This part exists so a future agent does not
have to guess, and so it starts with the full context rather than exploring the
repo blind.

Every phase is one or two pull requests. Kalpit merges. Before any PR: `test`,
`typecheck`, `lint`, `build`, `check:base`, `check:seo`, `check:csp`. Read
`AGENTS.md`, `PRODUCT.md` and `docs/DECISIONS.md` first. Never edit `PRODUCT.md`
or `ROADMAP.md`.

### Phase 0 — the calendar, and the new front door

*In plain terms: work out the dates, save the answers, and put them on the home
page.*

**The calculation.** New file `src/engine/switchCalendar.ts`, pure TypeScript,
no React, with `switchCalendar.test.ts` written first.

Input: `joinDate`, `noticePeriodDays`, optional `hikeCreditMonth` (1 to 12),
optional `bondEndDate`, optional `joiningBonusDate` plus `clawbackMonths`,
optional `targetResignDate`, `offerLeadWeeks` (default 8), `offerBufferDays`
(default 14), and `asOf`.

Output: a list of dated cliffs as `{ id, date, kind, daysAway }` where `kind` is
`'statutory' | 'contractual' | 'convention'`. Take the gratuity flip from
`gratuity()` in `src/engine/gratuity.ts`, which already returns `flipDate`, and
the clawback end from `bonusClawback()` in `src/engine/clawback.ts`. Do not
reimplement either. Then `earliestCleanDate`, and working backwards from the
resign date: `lastWorkingDay`, `needOfferBy`, `startApplyingBy`, each with
`daysAway`.

Rules: engines return ids and the UI maps them through `t()`. Reuse
`src/engine/dates.ts`. Never invent a statutory number. Conventions are marked
`kind: 'convention'` and their defaults are exported constants so the UI can
show and edit them. At least eight hand-worked test cases, including no optional
fields, someone already past five years so there is no flip date, a resign date
that falls before a cliff (the cliff must be listed as forfeited, never silently
dropped), and a five-day working week.

**The saved plan.** New file `src/data/plan.ts`, key `switchkarle.plan.v1`,
shape from Part 3, read and written through `src/lib/storage.ts`. It echoes on
mount like every other tool, so it does not need `releaseBootEcho`. Read the
"Nothing is written until the user types" section of `docs/ARCHITECTURE.md`
before writing a line. Take `noticePeriodDays` from
`src/data/currentJob.ts` and write it back there. Do not duplicate that field.
Tests in the style of `src/data/currentJob.test.ts`.

**The home page.** Needs a high-taste model, because the words are the product
here. No saved plan: the two sentences from Part 2, three fields, the calendar
laid out as in Part 2, a control to pick a date, and the first action. With a
saved plan: their reason, the day count, the next action, the date and days
remaining, then that stage's tools. The tracker moves under "Looking, quietly"
and is reached from the plan.

Copy goes in `en.ts` with Hindi pairs in `hi-suite.ts`, in the code-mixed
register the file already uses, keeping words like CTC, PF and notice period in
English. `PRODUCT.md` rule 1 still holds: a real calendar renders from example
inputs behind the Example chip before anyone types anything. Check it at 375px
wide: the first action must be visible without scrolling.

**Done when** a stranger with nothing saved lands, reads two sentences, answers
three questions, sees their own dates and one thing to do, and nobody with
existing saved data notices any change.

### Phase 1 — actions, coming back, calendar, sharing

*In plain terms: the ten actions, the returning-visitor screen, and a calendar
file they can download.*

- `src/data/actions.ts`: the ten actions in order, each with `id`, `stage`,
  `minutes`, and `where: 'here' | 'tool:<slug>' | 'external'`. Tested for order,
  and that every `tool:` slug exists in the registry.
- The returning-visitor screen from Part 2. Tick boxes record the date.
- Tracker: allow saving a card with a company and no job title. That is
  `PRODUCT.md` rule 2, and it is why someone at stage 0 cannot use it today.
- `src/lib/ics.ts`: a pure string builder for the calendar file, tested against
  a fixed expected output. Dull event titles by default. Offered as a download
  the same way the share image is.
- The "tell one person" card: dates and stage only. Reuse the share image path.

**Done when** a round-two tester can go from first visit to "applied to one"
without ever seeing a grid of tools, and nothing with a rupee in it can be
shared.

### Phase 2 — the tools take their places

*In plain terms: each tool appears at the stage where it is useful.*

- Each tool's registry row gets its stage from the table in Part 5. The plan
  renders that stage's tools. "All tools" keeps the full list and the search.
- Prompt Studio reads the company and stage from the plan. Never money.
- A test asserts every tool belongs to exactly one stage.

**Done when** the home page is no longer a grid, and every tool is two taps away
from either the plan or "All tools".

### Phase 3 — Kalpit's

Native Hindi pass. Domain switch. Distribution date. Not agent work.
