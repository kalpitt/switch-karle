# DIRECTION — what we build next, and why

Written 2026-09-06 for Kalpit, after three colleagues looked at Switch Karle and
did not want to use it. Revised the same day after he found a hole in it: three
questions cannot produce a rupee figure, because none of them asks what he earns.
That fix is in Part 3, and finding it turned up eight more.

Revised again after an outside review by Gemini 3.8, which found the weakest
thing in the design: **there is no mechanism that brings anyone back.** That is
Part 3 under "How he comes back at all", and it changed the pass mark in Part 9.

That review also said the returning screen should hide the user's reason for
leaving, because `PRODUCT.md` rule 5 forbids naming the job switch to someone
glancing at the screen. **Kalpit overruled it on 2026-09-06 and retired rule 5.**
His reasoning is in Part 3. This document was briefly written the other way and
is now written his way.

**This is a proposal. Kalpit decides.** Nothing here is in force until he says
so. Parts 1 to 8 are written for him to read and argue with. Part 11 is build
instructions for coding agents and he can skip it. Once the plan is built, delete
this file, so the repo never has two documents both claiming to say what the
product is.

---

## 1. What we learned

Three colleagues opened the site. None of them wanted it. What they meant,
underneath the politeness:

**"Can't I just ask ChatGPT this?"** They saw a page of calculators. A page of
calculators looks like something a chatbot already does.

**"I need something to get me started."** Their problem was never the maths.
They have wanted to leave for months and have done nothing about it.

**"Most of this only matters once I've started, or once I have an offer."**
There are 28 tools. Someone standing at the front door can use about two.

Here is the mismatch, in one line. **The site was built for the day you get an
offer. The person who shows up has not applied anywhere yet.**

The calculators are not the problem. They are good, they are accurate, and they
cite their sources. They are the wrong thing to show someone first. What is
missing is the thing that moves a stuck person from "I want to leave" to their
first application, and then stays with them for the nine months after.

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

---

## 3. What it looks like for a real person

Meet Ravi. He is 31, works at an IT services company in Pune, and joined on 12
January 2022. That is four years and seven months ago. His notice period is 90
days. He has been saying he will leave since January. It is now September. He has
applied nowhere.

He lands on the site. It asks three things he can answer without opening
anything:

1. When did you join? *12 January 2022*
2. What is your notice period? *90 days*
3. Which month does your hike hit your account? *May* (he can skip this)

### First, dates. No money yet.

> **You become eligible for gratuity on 9 September. That is three days away.**
> Four years and 240 days on a six-day week is the line, not five years.
> **Your hike lands in May.** Resigning before it means you never see it.
>
> Two dates, and they pull in opposite directions. Waiting three days is free.
> Waiting until June for the hike costs you nine months. **That one is your
> call, not ours.**
>
> **Today, fifteen minutes: write the one line reason you are leaving.**

**This is the fix for the hole Kalpit found.** Three questions give dates,
because dates need only a join date and a notice period. They cannot give a
rupee figure, because gratuity is worked out on your last drawn basic plus DA
and nobody asked for it.

### Then, money, if he wants it

Under the calendar, one optional field:

> Add your monthly basic and I will tell you what each of these dates is worth.
> *[ ₹72,000 ]*

> That gratuity is worth about ₹2,07,700 to you. Leaving three days too early
> loses all of it.

**If he has ever used the gratuity, notice buyout, leave encashment or F&F
tools, this field is already filled in.** They all share one saved record of his
current pay, which shipped on 5 September. He is never asked twice. That is
`PRODUCT.md` rule 7, and the plan is the first thing that really uses it.

**Careful with two different "basic" numbers.** Gratuity is worked out on basic
plus dearness allowance. Notice buyout and leave encashment use plain basic. The
saved record keeps those apart on purpose and never copies one into the other.
The plan must respect that, or it hands a wrong number to anyone who has a DA
component.

### The bit that decides whether this works

The site now knows Ravi should resign after 1 June, needs an offer by 18 May,
and should start applying by 23 March. **March is six months away.** A plan that
answers "when do I start" with "March" is a plan he closes and forgets, which is
the exact failure this whole document exists to fix.

So two things have to be true.

**The "start applying by" date is the latest safe start, never an instruction to
wait.** Starting earlier is usually better. It just means holding an offer
longer or negotiating a later joining date. The screen says that.

**Nine of the first ten actions can be done today.** Writing his reason, naming
five companies, messaging an ex-colleague, fixing his headline, researching a
company. Only the last one, actually applying, is timed. So the plan always has
something for today, whatever the calendar says.

### Coming back

He picks 1 June. He writes his reason. He closes the tab. He comes back on
Sunday and the page opens with:

> *"My manager takes credit for my work and I have stopped learning."*
> Day 12. Next: name five companies you would say yes to. Twelve minutes.
> 257 days until 1 June.

**His own sentence, in front of him, is the point.** It is what makes someone
who has drifted for eleven days do the next twelve minutes. Hiding it behind a
tap to protect a stranger's glance would weaken the one thing on the screen that
does any work.

### Why the shoulder-surfing rule was retired

`PRODUCT.md` rule 5 used to say nothing on screen or in browser chrome should
name the job switch to someone glancing over. **Kalpit retired it on
2026-09-06.** Recorded here because a future agent will otherwise re-derive it
from the old text and design timidly again.

His reasoning: most people do this on a personal device, in the evening, on
their own phone. Designing every screen around the few who open it at work taxes
everyone else for a threat most users do not have.

And the rule never held anyway. The site is called Switch Karle. The URL says
`switch-karle`. So does the tab title, and so does the installed app. **A rule
the product's own name breaks on every page is decoration, not a constraint.**
Notes mode was already deleted in August for exactly this reason, recorded in
`docs/ARCHITECTURE.md`: a disguise that leaves the incriminating half on screen
is worse than none, because someone may rely on it.

What does not change. Nothing persists unless the user chose it, and the erase
button stays one click away in the footer of every page. That is a different
rule and it survives untouched. The panic switch stays where it is on the
roadmap, as an **opt-in for the minority who do open this at work**, which is
the same argument applied consistently rather than a default that makes the
product quieter for everyone.

That is the product. The calculators sit underneath and appear when they are
relevant. The decoder shows up when he has an offer. The notice tracker shows up
the day he resigns.

### How he comes back at all

**This is the weakest link in the design, and an outside review found it before
we did.**

There is no account, no email address, no backend, and no notification code
anywhere in the repo. Nothing can reach Ravi. The returning-visitor screen above
assumes he comes back on Sunday, and nothing in the product causes that to
happen. A plan he never reopens is a one-page report with extra steps.

Three answers. None of them is strong, and they are worth having anyway.

**The calendar file is the way back, so it has to carry the link.** A calendar
event can hold a URL and a description, and calendar apps show them. Every event
we generate carries a link straight back to his plan. That is the only reminder
a site with no server can send, which makes `src/lib/ics.ts` matter far more
than a file that writes a date format should.

**The site is installable and nearly nobody knows it.** The manifest is already
there, set to standalone with icons. "Add to home screen" turns it into an app
icon, which is a real way back. Read the first risk in Part 10 before leaning on
this, because of what the icon is currently called.

**The first session has to be worth it even if he never returns.** He should
leave with his dates in his calendar and one thing done, so the visit paid for
itself on its own. Design for one session. Treat every return as a bonus rather
than an assumption.

*The figures above are illustrative. Every real number on the site comes from
the engines, which carry the section of the Act and the date it was checked.*

### Why this is not something a chatbot replaces

This is the answer to the first objection, and it is not "we are more accurate."

**A chatbot cannot hold your date.** It does not know his cliff is on 9
September, that his hike lands in May, that he promised himself he would apply
this Saturday, or that today is day 12 and he has not moved since day 4. A plan
lives across months. A chat window does not.

**Where a chatbot is genuinely better, we hand it the job.** Wording a message
to your manager, researching a company. Prompt Studio already does exactly that:
we write the prompt, you run it in your own AI, in your own account. Admitting
that openly is what makes the rest believable.

**Do not build a page arguing with ChatGPT.** Arguing with the objection
concedes it, and puts a competitor's name above the fold on our own site.

---

## 4. What gets saved, and where

Two records, and the split matters.

**The plan record. No money in it at all.**

| What | Asked when |
|---|---|
| The one line reason he is leaving | First session, after picking a date |
| Join date | Question 1 |
| Notice period | Question 2, and it comes from the shared pay record if it is already there |
| Month the hike lands | Question 3, skippable |
| The date he picked to resign | End of the first session |
| Which actions he has ticked, and when | As he goes |

**The pay record that already exists**, `switchkarle.current-job.v1`, holds
monthly basic, basic plus DA, gross and notice period. The plan reads from it
and writes back to it. It is what makes the optional money field pre-filled.

**Bond end date, joining bonus date and clawback window are not asked up front.**
Most people have neither. Asking everyone about a bond to serve the few who have
one breaks the three-question promise on the first screen. They live behind one
optional line under the calendar: *anything else holding you here? A bond, or a
joining bonus you might have to pay back.* Someone who has one will say so.

**The calendar file we hand him has no money in it and dull event titles**,
because it may end up in his work calendar.

**Two kinds of number, and we must never confuse them.** Gratuity dates come
from the Act and carry a section number. Lead times, like "you need an offer
about eight weeks after you start applying", are conventions from ordinary
experience. Those are labelled as conventions and he can edit them. We never
dress a convention up as a fact.

---

## 5. The first ten actions

Each is fifteen minutes or less. Each has a tick box. Each is either done on the
site or points at a specific place elsewhere.

**Picking the resign date is not on this list.** It happens in the first session,
because it is the thing the calendar exists to produce. Putting it here too
would show him two next things at once, which breaks rule 9 below.

1. Write the one line reason you are leaving. *(on the site)*
2. Read what your bond or joining bonus actually commits you to. *(bond scanner,
   bonus clawback, clause library)*
3. Add your monthly basic, so every number from here on is yours and not an
   example. *(the shared pay record)*
4. Name five companies you would say yes to. *(tracker cards, no job title
   needed)*
5. Tell one person **outside your company**. A partner, a sibling, a friend
   with no line back to your employer. *(a share card with dates only, no money)*
6. Message one ex-colleague about a referral. *(Scripts)*
7. Update your Naukri and LinkedIn headline. **The most visible thing on this
   list**, so the action says so plainly and points at the recruiters-only
   settings before it suggests changing anything. *(a checklist, never
   automation)*
8. Research the first company using your own AI. *(Prompt Studio)*
9. Block two hours on Saturday for applications. *(calendar file)*
10. Apply to one.

After ten, the board takes over. It already knows what to do with an
application, an interview and an offer.

**Action 3 used to say "enter your current in-hand".** It does not, because we
do not store in-hand anywhere. In-hand is something the decoder works out from a
full offer. What we store is monthly basic and gross.

**On the order, where this document disagrees with its outside review.** The
review said "tell one person" at five is too early for an Indian IT employee on
90 days notice, and should move to eight or nine. The secrecy concern is right
and it is why the action now names who to tell. Moving it is wrong. Telling
someone is a commitment device and its whole value is early, when motivation is
the thing that is missing. Moved to nine it arrives after the hard part is
already done. Steps six and seven are the larger disclosures anyway, since an
ex-colleague may still talk to current ones and a jobseeker profile is public by
design. Those two carry the warnings. **Round two settles this, not argument.**

---

## 6. Where the 28 tools go

Nothing gets deleted. Everything gets a home, and only the current stage's tools
are on screen. The rest live behind "All tools", which keeps the search.

| Stage | Shown here |
|---|---|
| "I'm done here" | gratuity, bond scanner, bonus clawback, leave encashment, clause library |
| "Looking, quietly" | tracker, Prompt Studio, redactor |
| "Talking to them" | expected CTC script, real hike |
| "The number on the table" | decoder, offer comparison, variable pay, ESOP, fake offer, relocation |
| "Telling them" | resignation letter, manager script, counter offer, early release, decline accepted, counter offer reply, notice buyout |
| "Serving it out" | notice tracker, handover doc, F&F checker, relieving chaser, insurance gap, buyout ask |
| "The first 90 days" | EPF transfer, BGV prep, tax declaration, Form-16 shock |

Two things to know before treating this table as settled.

**The count is 28 tools across 34 URLs.** The Scripts tool alone serves seven
URLs, one per script. An earlier draft of this document said 27, which was
wrong.

**This table is a proposal, not a finished mapping.** The registry already sorts
tools into four buckets: offer, exit, documents, landing. Those four do not line
up with the seven stages in `PRODUCT.md`, and some rows disagree outright. The
clause library sits in documents, the bond scanner sits in offer, and both
belong at "I'm done here" under the seven-stage model. Reconciling the two is
real work and it is Phase 2, not a footnote.

**No new calculator gets built until the plan exists.** That is the point of
this whole document.

---

## 7. Six rules for building something that gets people moving

These go alongside the eight already in `PRODUCT.md`. Each can be checked
against the code.

**9. One next thing, never a list.** Show the single next action. Finishing it
reveals the next. A list of ten is a reason to close the tab.

**10. Fifteen minutes, or split it.** If an action does not fit in fifteen
minutes it is really two actions.

**11. Dates before money.** The first thing we give back is a calendar. Money
attaches to a date, as in "leaving three days early loses ₹2,07,700". Never the
other way round. This is also why the three questions ask for no salary.

**12. Their words, given back.** The reason they typed opens every visit, on the
screen and not behind a tap. We never write their motivation for them. This rule
briefly yielded to the shoulder-surfing rule, which Kalpit retired on
2026-09-06. See Part 3.

**13. A date is a decision, so keep it visible.** Days remaining, every visit.
Changing it is allowed and recorded. Never nagged about.

**14. Send them out of the site.** The best actions happen on Naukri, in a
WhatsApp message, in their own AI. The plan points and lets go. Automating any
of that stays off the table, permanently.

---

## 8. What goes on the roadmap

For `ROADMAP.md`, if Kalpit accepts this. Settled stays settled. Not Doing stays
there.

### Now

- **The plan becomes the home page.** Three questions, the calendar, the
  optional money field, pick a date, one action. English and Hindi.
  *Why: three out of three people could not get from the thought to an action.*
- **The tagline says what the site is.** The two sentences in Part 2.
- **The ten person test, round two.** Run it the week the plan ships. Not after
  "the site is complete".

### Next

- **The first ten actions**, with tick boxes and the returning-visitor line.
  The tracker accepts a company with no job title.
- **Calendar file, and the "tell one person" card.** Dates only, dull titles.
- **The tools move behind their stages**, which means reconciling the registry's
  four buckets with the seven stages first. The home page stops being a grid.
- **Prompt Studio reads the plan**, so prompts arrive pre-filled with the
  company and the stage. Never with money.

### Also now, because the plan depends on it

- **Rename the installed app.** `public/manifest.webmanifest` still says
  "Decode your CTC", which is the old, narrower product. One file. It blocks
  nothing, but the plan asks people to install the site, and the icon should
  match the tagline it is shipping alongside.

The panic switch stays in Later, unchanged. Retiring the shoulder-surfing rule
does not remove it: it is an opt-in for the people who do open this at work, and
that is a different thing from making every screen quieter by default.

### Later

- **When an offer goes cold.** What to do on day 40 of notice when the new
  employer stops replying. Already on the roadmap. It belongs inside the plan.
- **Reminders that actually reach someone.** A website cannot send one without a
  server. A calendar file is the honest limit today. A real reminder would be
  the first feature moving user data off the device, so it is Kalpit's call
  under `PRIVACY.md`, never an agent's.
- **Native Hindi pass, domain switch, distribution date.** Unchanged, and his.

### Stop doing

- New calculators, until the plan is built.
- Expert panels, unconstrained research audits, multi-agent research documents.
- Process built for a team: the record lane, long decision entries, handoff
  dossiers. Keep decision entries to about five lines.

---

## 9. How we find out if it worked

No analytics, ever. The measurement is ten people and a WhatsApp message.
**Write the pass mark down before showing anyone**, so the result cannot be
argued with afterwards.

**Who.** Ten people who have said in the last six months that they want to leave
their job. Colleagues, ex-colleagues, friends. Not founders. Not people already
interviewing.

**The message.** "Open this, answer the three questions, and do the first thing
if you feel like it. I'll ask you three questions next Sunday."

**Ask a week later.** All four are about what already happened. None asks for a
promise.

1. Did you do the first action?
2. Did you pick a date?
3. Did you put the dates in your calendar?
4. Have you opened it again since that first time?

**The pass mark.** Five of ten did the first action. Four picked a date. Four
saved the calendar. Three opened it again. Miss any one, fix it and run again
with ten new people. **Miss twice and stop building.** The premise is wrong and
another tool will not fix it.

**Question three carries more weight than it looks.** The calendar file is the
only way the product can reach anyone, so someone who did not save it is
someone who is not coming back.

**The earlier version of this list asked "will you open it again this Sunday?"**
An outside review pointed out that this is a promise, and the same page says
compliments are not data. It was inconsistent and it is fixed. A promise made to
the person who built the thing is the least reliable answer anyone gives.

**What does not count.** "Looks clean." "Nice idea." Compliments are not data.

---

## 10. What could go wrong

- **Nothing can bring anyone back.** No account, no email, no notifications, no
  server. The calendar file and an installed icon are the whole answer and both
  are weak. If round two shows people do the first action and never return, the
  honest options are a reminder that needs a server, which is Kalpit's decision
  under `PRIVACY.md` and nobody else's, or accepting that this is a one-session
  product and designing it as one.
- **The installed app describes a narrower product than the one we are
  building.** `public/manifest.webmanifest` calls it "Switch Karle — Decode your
  CTC" and its description is entirely about decoding an offer. That was the old
  product. It matters more under this proposal, because the plan leans on people
  installing the site as a way back, and the icon they install should say what
  the site now does. This was first written up as a privacy problem; that
  reasoning went when rule 5 was retired, and the naming problem is still real.
  **Renaming is branding, so it is Kalpit's call, not an agent's.**
- **The premise might be wrong.** People may take the first action and still not
  switch. Or not take it at all. The pass mark exists so this shows up in two
  weeks instead of two years.
- **The six-month gap is the sharpest risk in the design.** Ravi's honest answer
  is "start applying in March". Part 3 handles it by always having a today
  action, but if round two shows people still drift away between picking a date
  and applying, the plan needs something this document has not thought of.
- **A plan is harder to write than a calculator.** The words carry it.
  Agent-written motivational copy is the fastest way to make it feel like an app
  that wants something from the user. Keep the `PRODUCT.md` voice: plain,
  unhurried, bad news first, no cheerleading.
- **"Tell me what to do next" drifts towards advice.** Stay on dates,
  arithmetic and pointers. Ravi's nine-months-for-one-hike trade is his to make.
  Show both sides, never pick for him.
- **Reminders are genuinely weak without a server.** Do not quietly solve it
  with a push service.
- **This pivot could itself become over-engineering.** The guard is the size of
  Phase 0: three questions, one screen, one calculation. If it takes more than
  two weeks of agent work, it has grown and should be cut back.
- **Two languages while the words change weekly.** The Hindi rule stands. Hindi
  ships as an agent draft, as today, and the native writer's pass stays where it
  is on the roadmap.

---

## 11. Build instructions for coding agents

**Kalpit can stop reading here.**

Every phase is one or two pull requests. Kalpit merges. Before any PR: `test`,
`typecheck`, `lint`, `build`, `check:base`, `check:seo`, `check:csp`. Read
`AGENTS.md`, `PRODUCT.md` and `docs/DECISIONS.md` first. Never edit `PRODUCT.md`
or `ROADMAP.md`.

### Phase 0 — the calendar, and the new front door

*Plain version: work out the dates, save the answers, put them on the home page.*

**The calculation.** New file `src/engine/switchCalendar.ts`, pure TypeScript,
no React, with `switchCalendar.test.ts` written first.

Input: `joinDate`, `noticePeriodDays`, optional `hikeCreditMonth` (1 to 12),
optional `bondEndDate`, optional `joiningBonusDate` plus `clawbackMonths`,
optional `targetResignDate`, `offerLeadWeeks` (default 8), `offerBufferDays`
(default 14), `workWeekDays` (5 or 6, default 6), and `asOf`.

Output: dated cliffs as `{ id, date, kind, daysAway }` where `kind` is
`'statutory' | 'contractual' | 'convention'`. Take the gratuity cliff from
`gratuity()` in `src/engine/gratuity.ts`, which already returns `flipDate` and
already implements the four-years-240-days rule and the five-day-week variant.
Take the clawback end from `bonusClawback()` in `src/engine/clawback.ts`. **Do
not reimplement either.** Then `earliestCleanDate`, and working backwards from
the resign date: `lastWorkingDay`, `needOfferBy`, `startApplyingBy`, each with
`daysAway`.

**Those last three are null until the user picks a date.** Do not silently
substitute `earliestCleanDate` and present the result as their plan. The screen
shows cliffs first and the backward plan only after a date exists.

Rules: engines return ids, the UI maps them through `t()`. Reuse
`src/engine/dates.ts`. Never invent a statutory number. Conventions carry
`kind: 'convention'` and their defaults are exported constants so the UI can
show and edit them. At least eight hand-worked cases, including: no optional
fields; someone already past five years, where there is no cliff and the
backward plan is the whole output; someone inside the 240-day window on a
six-day week; the same person on a five-day week, where the date differs; a
resign date falling before a cliff, which must be listed as forfeited and never
silently dropped; and two cliffs that pull in opposite directions, which is
Ravi's case in Part 3.

**The saved plan.** New file `src/data/plan.ts`, key `switchkarle.plan.v1`,
shape from Part 4, through `src/lib/storage.ts`.

**Read `docs/ARCHITECTURE.md`, section "Nothing is written until the user types",
before writing a line of this.** The plan is written from explicit answers, not
from continuous typing, so it is exactly the shape that loses the first entry. It
must either echo its draft on mount like every existing tool, or call
`releaseBootEcho` and say why in a comment. Pick one deliberately and pin it with
a test that fails without it. `src/data/currentJob.ts` is the worked example and
it is the newer of the two patterns.

`noticePeriodDays`, `monthlyBasic` and `monthlyBasicDA` are **not** stored in the
plan. They live in `src/data/currentJob.ts`. Read and write them there through
`fillFromCurrentJob` and `rememberCurrentJob`. `monthlyBasic` and
`monthlyBasicDA` must never be copied into each other: gratuity uses basic plus
DA, the other exit tools use plain basic, and the record keeps them apart for
that reason.

**The home page.** Needs a high-taste model, because the words are the product.
No saved plan: the two sentences from Part 2, three fields, cliffs with no money,
the optional basic field, the optional bond and joining bonus line, a date
picker, then the first action. With a saved plan: their reason, day count, next
action, date and days remaining, then that stage's tools. The tracker moves under
"Looking, quietly" and is reached from the plan.

Copy in `en.ts` with Hindi pairs in `hi-suite.ts`, code-mixed register, keeping
CTC, PF and notice period in English. `PRODUCT.md` rule 1 holds: a real calendar
renders from example inputs behind the Example chip before anyone types. Check at
375px: the first action must be visible without scrolling.

**The reason for leaving renders on the screen, not behind a tap.** An earlier
draft of this document said the opposite, on a rule Kalpit retired on
2026-09-06. Do not reintroduce it. It still must not reach the tab title or any
meta tag, for the same reason no other user input does.

**The erase control has to survive the change.** It lives in two places today:
`src/components/Shell.tsx` puts it in the footer of every page, which a new home
page inherits for free, and `src/components/Tracker.tsx` puts it in the board's
button row, which moves off the home page when the tracker does. Do not let the
second one disappear silently in the move.

**Done when** a stranger with nothing saved lands, reads two sentences, answers
three questions, sees their own dates and one thing to do, and nobody with
existing saved data notices any change.

### Phase 1 — actions, coming back, calendar, sharing

- `src/data/actions.ts`: the ten actions in order, each with `id`, `stage`,
  `minutes`, `where: 'here' | 'tool:<slug>' | 'external'`. Tested for order and
  that every `tool:` slug exists in the registry.
- The returning-visitor screen from Part 3. Tick boxes record the date.
- Tracker: allow saving a card with a company and no job title. That is
  `PRODUCT.md` rule 2, and it is why someone at stage 0 cannot use it today.
- `src/lib/ics.ts`: pure string builder, tested against a fixed expected output.
  Dull event titles by default. Downloaded the same way the share image is.
  **Every event carries a URL back to the plan**, in both the `URL` property and
  the description, because this file is the only reminder a site with no server
  can send. Test that the link is present in every event and that no event
  contains a rupee figure, a company name or the words that name the job switch.
- The "tell one person" card: dates and stage only. Reuse the share image path.

**Done when** a round-two tester goes from first visit to "applied to one"
without seeing a grid, and nothing with a rupee in it can be shared.

### Phase 2 — the tools take their places

*Plain version: each tool appears at the stage where it is useful. This is
bigger than it sounds.*

The registry already has both a `category` field with four values and a `stage`
field that is **a sort key inside a category, not a journey stage**
(`src/data/home.ts` sorts by it). The seven stages in `PRODUCT.md` are a
different model, and the two disagree on real rows.

**Do not overload the existing `stage` field.** Add a separate field for the
journey stage, migrate the home page onto it, and delete the old sort key only
once nothing reads it. Changing the meaning of a field 34 rows already use, in
place, is how a quiet mis-sort ships.

- Every tool gets exactly one journey stage. The table in Part 6 is the starting
  proposal, not a finished answer. Where it and the registry disagree, the
  disagreement is a decision for Kalpit, not for the agent to settle silently.
- The plan renders the current stage's tools. "All tools" keeps the full list
  and the search.
- Prompt Studio reads company and stage from the plan. Never money.
- A test asserts every tool belongs to exactly one stage and that all 34 URLs
  are still reachable.

**Done when** the home page is no longer a grid, and every tool is two taps from
either the plan or "All tools".

### Phase 3 — Kalpit's

Native Hindi pass. Domain switch. Distribution date. Not agent work.
