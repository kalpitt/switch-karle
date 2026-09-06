# DIRECTION — what we build next, and why

**In one paragraph.** Switch Karle has 28 tools built for the day you get a job
offer. The people who actually show up have not applied anywhere yet, and three
of them told us so. This document proposes replacing the front door: three
questions, a calendar of your own dates, and one thing to do today. The 28 tools
stay exactly as they are and appear when they become relevant. Nothing is
deleted, and no new calculator gets built until the front door exists.

**Kalpit decides.** This is a proposal, not a decision. Parts 1 to 12 are written
for him. Part 13 is instructions for coding agents and he can skip it. When the
work in Part 13 is done, delete this file, so the repo never has two documents
both claiming to say what the product is.

---

## How to review this document

Read this section first if you are reviewing. It exists because the last review
spent half its effort on problems a newer draft had already fixed.

### Version history

| Date | What changed |
|---|---|
| 2026-09-06 a | First draft, after three colleagues rejected the site |
| 2026-09-06 b | Kalpit found the salary hole. Fixing it exposed eight more errors |
| 2026-09-06 c | Gemini 3.8 review. Three findings accepted, one overruled by Kalpit |
| 2026-09-06 d | This version. Rewritten for clarity. App renamed |

### Already fixed. Please do not re-report these

- **Three questions cannot produce a rupee figure.** Correct, and fixed in
  Part 3. Dates come from the three questions. Money needs an optional fourth
  field, pre-filled for anyone who has used an exit tool.
- **The old worked example was arithmetically impossible.** It had someone
  joining in August 2021 described as four years and eight months into the job
  in September 2026, then showed him a gratuity cliff he would already be past.
  Rebuilt in Part 3 with every date checked by hand.
- **"27 tools" was wrong.** It is 28 tools across 34 URLs. The Scripts tool
  alone serves seven URLs.
- **Nothing brings the user back.** Correct, and it is now Part 4, named as the
  weakest thing in the design.
- **The pass mark accepted a promise as evidence.** Fixed in Part 9. Every
  question now asks what already happened.

### Settled by the owner. Please do not re-open

- **The shoulder-surfing rule is retired**, as of 2026-09-06. Reasoning in
  Part 4. A previous review asked for the user's reason for leaving to be
  hidden on screen. Kalpit overruled it.
- **No job listings, aggregation, resume builders, ATS scorers, interview
  banks, recruiter automation, salary bands, or an AI assistant inside the
  page.** Permanent, on reputational grounds. See `PRODUCT.md`.
- **The domain is `switchkarle.fyi` and the cutover is deliberately held.**

### Where challenge is genuinely welcome

1. **Part 4.** Nothing brings anyone back. The three answers given are weak and
   we know it.
2. **Part 3, the six-month gap.** The honest advice to Ravi is "start applying
   in March". A plan that says come back in March is a plan he closes.
3. **Part 6, the order of the ten actions.** Invented, not researched.
4. **Part 9, the pass mark numbers.** Five, four, four and three out of ten are
   judgement calls, not evidence.

### Claims a reviewer can check against the repo

| Claim | Where to verify |
|---|---|
| The gratuity cliff is four years and 240 days, not five years | `src/engine/gratuity.ts`, `FAST_PATH_DAYS` |
| The gratuity engine already returns that cliff date | `src/engine/gratuity.ts`, `flipDate` |
| Six tools already share one record of current pay | `src/data/currentJob.ts` |
| Basic and basic-plus-DA are stored apart and never merged | `src/data/currentJob.ts` |
| There is no notification or push code anywhere | grep for `Notification`, `pushManager` |
| The registry's `stage` field is a sort key, not a journey stage | `src/data/home.ts`, the `sort` call |
| The erase control sits in two places | `src/components/Shell.tsx`, `src/components/Tracker.tsx` |
| 34 URLs across 28 tools | `src/data/tools.ts` |

---

## 1. The problem

Three colleagues opened the site. None of them wanted it. What they meant,
underneath the politeness:

**"Can't I just ask ChatGPT this?"** They saw a page of calculators, and a page
of calculators looks like something a chatbot already does.

**"I need something to get me started."** Their problem was never the maths.
They have wanted to leave for months and have done nothing.

**"Most of this only matters once I've started, or once I have an offer."**
There are 28 tools. Someone at the front door can use about two of them.

**The mismatch, in one line: the site was built for the day you get an offer,
and the person who shows up has not applied anywhere yet.**

The calculators are not the problem. They are accurate and they cite their
sources. They are the wrong thing to show someone first. What is missing is the
thing that moves a stuck person from "I want to leave" to their first
application, and then stays with them for the nine months after.

That thing is a plan with dates on it, not a page of tools.

---

## 2. The idea

One sentence for what the product becomes:

> **Switch Karle turns "I'm done here" into a dated plan and one thing you can
> do today, then walks with you until your first day at the new job.**

Two sentences for the home page, replacing today's tagline:

> You have wanted to leave for a while. Answer three questions and get your
> switch calendar, the first fifteen-minute thing to do, and the numbers nobody
> else in the conversation has.

### Why a chatbot does not replace this

This answers the first objection, and the answer is not "we are more accurate".

**A chatbot cannot hold your dates.** It does not know your gratuity cliff is on
9 September, that your hike lands in May, that you promised yourself you would
apply on Saturday, or that today is day 12 and you have not moved since day 4. A
plan lives across months. A chat window does not.

**Where a chatbot is genuinely better, we hand it the work.** Wording a message
to your manager. Researching a company. Prompt Studio already does this: we
write the prompt, you run it in your own AI, in your own account. Conceding that
openly is what makes the rest believable.

**Do not build a page arguing with ChatGPT.** Arguing with the objection
concedes it, and puts a competitor's name above the fold on our own site.

---

## 3. Ravi's first visit

Ravi is 31, works at an IT services company in Pune, and joined on 12 January
2022, which is four years and seven months ago. His notice period is 90 days. He
has been saying he will leave since January. It is now September. He has applied
nowhere.

The site asks three things he can answer without opening anything.

1. When did you join? *12 January 2022*
2. What is your notice period? *90 days*
3. Which month does your hike reach your account? *May*, and he can skip this

### Step one: dates, with no money in them

> **You become eligible for gratuity on 9 September, three days from now.**
> The line is four years and 240 days on a six-day week, not five years.
> **Your hike lands in May.** Resigning before it means you never see it.
>
> These two pull in opposite directions. Waiting three days is free. Waiting
> until June for the hike costs you nine months. **That one is your call.**
>
> **Today, fifteen minutes: write the one line reason you are leaving.**

**This is why the three questions ask for no salary.** A date needs only a join
date and a notice period. A rupee figure needs your last drawn basic plus
dearness allowance, and nobody asked for it. Promising money from three
questions that cannot produce it was the first real error in this document.

### Step two: money, only if he wants it

One optional field under the calendar.

> Add your monthly basic and I will tell you what each date is worth.
> *[ ₹72,000 ]*

> That gratuity is worth about ₹2,07,700. Leaving three days too early loses all
> of it.

**If he has used the gratuity, notice buyout, leave encashment or F&F tool
before, this field is already filled in.** Those six tools share one saved record
of his current pay, which shipped on 5 September. He is never asked twice. That
is `PRODUCT.md` rule 7, and the plan is the first thing that really uses it.

**Two different "basic" numbers, and they must never merge.** Gratuity uses basic
plus dearness allowance. Notice buyout and leave encashment use plain basic. The
saved record keeps them apart deliberately and never copies one into the other.
Merging them hands a wrong number to anyone with a DA component.

### Step three: the gap that decides whether this works

The site now knows Ravi should resign after 1 June, needs an offer by 18 May, and
should start applying by 23 March. **March is six months away.**

A plan that answers "when do I start" with "March" is a plan he closes and
forgets, which is the exact failure this document exists to fix. Two things have
to be true for it to survive that.

**"Start applying by" is the latest safe start, never an instruction to wait.**
Starting earlier is usually better. It only means holding an offer longer or
negotiating a later joining date. The screen says so.

**Nine of the ten actions can be done today.** Writing his reason, naming five
companies, messaging an ex-colleague, fixing his profile, researching a company.
Only the last one, actually applying, is timed. So the plan always has something
for today, whatever the calendar says.

**This is the sharpest risk in the design and it may not be enough.** If round
two shows people still drift away between picking a date and applying, this needs
an idea nobody has had yet.

---

## 4. Coming back

He picks 1 June. He writes his reason. He closes the tab. On Sunday he comes back
and the page opens with:

> *"My manager takes credit for my work and I have stopped learning."*
> Day 12. Next: name five companies you would say yes to. Twelve minutes.
> 257 days until 1 June.

**His own sentence, in front of him, is the point.** It is what makes someone who
has drifted for eleven days do the next twelve minutes.

### Why the shoulder-surfing rule was retired

`PRODUCT.md` rule 5 used to say nothing on screen or in browser chrome should
name the job switch to anyone glancing over. **Kalpit retired it on 2026-09-06.**
It is recorded here because a future agent will otherwise read the old text and
start designing timidly again.

His reasoning: most people do this on a personal device, in the evening, on their
own phone. Designing every screen around the few who open it at work taxes
everyone else for a threat most users do not have.

The rule never held anyway. The site is called Switch Karle. The URL says
`switch-karle`, and so does the tab title. Notes mode was deleted in August for
the same reason, recorded in `docs/ARCHITECTURE.md`: a disguise that leaves the
incriminating half on screen is worse than none, because someone may rely on it.

**What does not change.** Nothing persists unless the user chose it, and the
erase button stays one click away in the footer of every page. That is a separate
rule and it stands. The panic switch stays on the roadmap as an opt-in for people
who do open this at work, which is the same argument applied consistently rather
than a default that makes the product quieter for everyone.

### The real problem: nothing can bring him back

**This is the weakest link in the whole design, and an outside review found it
before we did.**

There is no account, no email address, no backend, and no notification code
anywhere in the repo. Nothing can reach Ravi. The screen above assumes he returns
on Sunday, and nothing in the product causes that. A plan nobody reopens is a
one-page report with extra steps.

Three answers. None is strong. They are worth having anyway.

**The calendar file is the way back, so it has to carry the link.** A calendar
event can hold a URL and a description, and calendar apps display them. Every
event we generate links straight back to his plan. That is the only reminder a
site with no server can send, which makes `src/lib/ics.ts` matter far more than a
file that formats dates should.

**The site is installable and almost nobody knows.** The manifest is already
there, set to standalone with icons. It was renamed on 2026-09-06 from "Switch
Karle — Decode your CTC" to plain "Switch Karle", because the old name described
a narrower product than the one being built.

**The first session has to be worth it even if he never returns.** He should
leave with his dates in his calendar and one thing done, so the visit paid for
itself. Design for one session. Treat every return as a bonus rather than an
assumption.

---

## 5. What gets saved, and where

Two separate records, and the split matters.

**The plan record holds no money at all.**

| What | Asked when |
|---|---|
| The one line reason for leaving | First session, after picking a date |
| Join date | Question 1 |
| Notice period | Question 2, or taken from the shared pay record if already there |
| Month the hike lands | Question 3, skippable |
| The date he picked to resign | End of the first session |
| Which actions he has ticked, and when | As he goes |

**The pay record already exists.** `switchkarle.current-job.v1` holds monthly
basic, basic plus DA, gross and notice period. The plan reads from it and writes
back to it. It is what makes the optional money field pre-filled.

**Bond and joining bonus are not asked up front.** Most people have neither, and
asking everyone about a bond to serve the few breaks the three-question promise
on the first screen. They sit behind one optional line under the calendar:
*anything else holding you here? A bond, or a joining bonus you might have to pay
back.* Someone who has one will say so.

**The calendar file carries no money and uses dull event titles**, because it may
land in a work calendar.

**Two kinds of number, never to be confused.** Gratuity dates come from the Act
and carry a section number. Lead times, like "an offer takes about eight weeks
from your first application", are conventions from ordinary experience. Those are
labelled as conventions and the user can edit them. We never present a convention
as a fact.

---

## 6. The first ten actions

Each is fifteen minutes or less, has a tick box, and is either done on the site
or points somewhere specific.

**Picking the resign date is not on this list.** It happens in the first session,
because it is what the calendar exists to produce. Putting it here too would show
two next things at once, breaking rule 9 in Part 8.

1. Write the one line reason you are leaving. *(on the site)*
2. Read what your bond or joining bonus actually commits you to. *(bond scanner,
   bonus clawback, clause library)*
3. Add your monthly basic, so every number from here is yours and not an example.
   *(the shared pay record)*
4. Name five companies you would say yes to. *(tracker cards, no job title
   needed)*
5. Tell one person **outside your company**. A partner, a sibling, a friend with
   no line back to your employer. *(a share card with dates only, no money)*
6. Message one ex-colleague about a referral. *(Scripts)*
7. Update your Naukri and LinkedIn headline. **The most visible thing on this
   list**, so the action says so plainly and points at the recruiters-only
   settings before suggesting any change. *(a checklist, never automation)*
8. Research the first company using your own AI. *(Prompt Studio)*
9. Block two hours on Saturday for applications. *(calendar file)*
10. Apply to one.

After ten, the board takes over. It already knows what to do with an application,
an interview and an offer.

**Two corrections worth recording.** Action 3 used to say "enter your current
in-hand". It does not now, because in-hand is something the decoder computes from
a full offer and nothing stores it. What we store is monthly basic and gross.

**And one disagreement with the outside review.** It said "tell one person" at
five is too early for someone on 90 days notice, and should move to eight or
nine. The secrecy concern is right, which is why the action now names who to
tell. Moving it is wrong: telling someone is a commitment device and its value is
highest early, when motivation is the thing missing. At nine it arrives after the
hard part is done. Steps six and seven are the larger disclosures anyway, and
they carry the warnings. **Round two settles this, not argument.**

---

## 7. Where the 28 tools go

Nothing is deleted. Everything gets a home, and only the current stage's tools
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

**This table is a proposal, not a finished mapping.** The registry already sorts
tools into four buckets: offer, exit, documents and landing. Those four do not
line up with the seven stages in `PRODUCT.md`, and some rows disagree outright.
The clause library sits in documents and the bond scanner sits in offer, and both
belong at "I'm done here" under the seven-stage model. Reconciling the two is
real work. It is Phase 2, not a footnote.

**No new calculator until the plan exists.** That is the point of this document.

---

## 8. Six rules for building something that gets people moving

These sit alongside the eight already in `PRODUCT.md`, and each can be checked
against the code.

**9. One next thing, never a list.** Show the single next action. Finishing it
reveals the next. A list of ten is a reason to close the tab.

**10. Fifteen minutes, or split it.** An action that does not fit in fifteen
minutes is really two actions.

**11. Dates before money.** The first thing we hand back is a calendar. Money
attaches to a date, as in "leaving three days early loses ₹2,07,700", never the
other way round. This is also why the three questions ask for no salary.

**12. Their words, given back.** The reason they typed opens every visit, on the
screen and not behind a tap. We never write their motivation for them.

**13. A date is a decision, so keep it visible.** Days remaining, every visit.
Changing it is allowed and recorded, never nagged about.

**14. Send them out of the site.** The best actions happen on Naukri, in a
WhatsApp message, in their own AI. The plan points and lets go. Automating any of
it stays permanently off the table.

---

## 9. How we find out if it worked

No analytics, ever. The measurement is ten people and a WhatsApp message. **Write
the pass mark down before showing anyone**, so the result cannot be argued with
afterwards.

**Who.** Ten people who have said in the last six months that they want to leave
their job. Colleagues, ex-colleagues, friends. Not founders. Not people already
interviewing.

**The message.** "Open this, answer the three questions, and do the first thing
if you feel like it. I'll ask you four questions next Sunday."

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
only way this product can reach anyone, so a person who did not save it is a
person who is not coming back.

**An earlier version asked "will you open it again this Sunday?"** A review
pointed out that this is a promise, while the same page says compliments are not
data. It was inconsistent and it is fixed. A promise made to the person who built
the thing is the least reliable answer anyone gives.

**What does not count.** "Looks clean." "Nice idea." Compliments are not data.

---

## 10. What could go wrong

- **Nothing can bring anyone back.** No account, no email, no notifications, no
  server. A calendar file and an installed icon are the whole answer and both are
  weak. If round two shows people do the first action and never return, the
  honest options are a reminder that needs a server, which is Kalpit's decision
  under `PRIVACY.md` and nobody else's, or accepting that this is a one-session
  product and designing it as one.
- **The premise might be wrong.** People may take the first action and still not
  switch, or not take it at all. The pass mark exists so that shows up in two
  weeks instead of two years.
- **The six-month gap.** Ravi's honest answer is "start applying in March". Part
  3 handles it by always having a today action, and that may not be enough.
- **A plan is harder to write than a calculator.** The words carry it.
  Agent-written motivational copy is the fastest way to make this feel like an
  app that wants something from the user. Keep the `PRODUCT.md` voice: plain,
  unhurried, bad news first, no cheerleading.
- **"Tell me what to do next" drifts towards advice.** Stay on dates, arithmetic
  and pointers. Ravi's nine-months-for-one-hike trade is his to make. Show both
  sides and never choose for him.
- **This pivot could itself become over-engineering.** The guard is the size of
  Phase 0: three questions, one screen, one calculation. If it takes more than
  two weeks of agent work, it has grown and should be cut back.
- **Two languages while the words change weekly.** The Hindi rule stands. Hindi
  ships as an agent draft, as it does today, and the native writer's pass stays
  where it is on the roadmap.

---

## 11. What we keep

None of this throws away the good work.

The pure calculation engine and its hand-checked test cases. The rule that no
number ships without a source and a date. Local-first with an erase button. Hindi
as the same product rather than a translation. The refusal to do job listings,
automation, resume builders, salary bands, or an AI assistant inside the page.

Those are the parts three colleagues never got far enough to see, and the parts a
chatbot cannot copy. The plan is how they finally get seen.

---

## 12. What goes on the roadmap

For `ROADMAP.md`, if Kalpit accepts this. Settled stays settled. Not Doing stays
where it is.

### Now

- **The plan becomes the home page.** Three questions, the calendar, the optional
  money field, pick a date, one action. English and Hindi.
  *Why: three out of three people could not get from the thought to an action.*
- **The tagline says what the site is.** The two sentences in Part 2. This also
  covers the home page title, which still reads "Decode your CTC" in both
  languages and should change with the tagline rather than before it.
- **The ten person test, round two.** Run it the week the plan ships, not after
  "the site is complete".

### Next

- **The first ten actions**, with tick boxes and the returning-visitor line. The
  tracker accepts a company with no job title.
- **Calendar file, and the "tell one person" card.** Dates only, dull titles, and
  every event carries a link back.
- **The tools move behind their stages**, which means reconciling the registry's
  four buckets with the seven stages first. The home page stops being a grid.
- **Prompt Studio reads the plan**, so prompts arrive pre-filled with the company
  and the stage. Never with money.

### Later

- **When an offer goes cold.** What to do on day 40 of notice when the new
  employer stops replying. Already on the roadmap, and it belongs inside the
  plan.
- **Reminders that actually reach someone.** A website cannot send one without a
  server. A calendar file is the honest limit today. A real reminder would be the
  first feature moving user data off the device, so it is Kalpit's call under
  `PRIVACY.md`, never an agent's.
- **The panic switch**, unchanged, as an opt-in for people who open this at work.
  Retiring the shoulder-surfing rule does not remove it.
- **Native Hindi pass, domain switch, distribution date.** Unchanged, and his.

### Stop doing

- New calculators, until the plan is built.
- Expert panels, unconstrained research audits, multi-agent research documents.
- Process built for a team: the record lane, long decision entries, handoff
  dossiers. Keep decision entries to about five lines.

---

## 13. Build instructions for coding agents

**Kalpit can stop reading here.**

Each phase is one or two pull requests, and Kalpit merges them. Before any pull
request: `test`, `typecheck`, `lint`, `build`, `check:base`, `check:seo`,
`check:csp`. Read `AGENTS.md`, `PRODUCT.md` and `docs/DECISIONS.md` first. Never
edit `PRODUCT.md` or `ROADMAP.md`.

### Phase 0: the calendar and the new front door

*Plain version: work out the dates, save the answers, put them on the home page.*

**The calculation.** New file `src/engine/switchCalendar.ts`. Pure TypeScript, no
React, with `switchCalendar.test.ts` written first.

Input: `joinDate`, `noticePeriodDays`, optional `hikeCreditMonth` (1 to 12),
optional `bondEndDate`, optional `joiningBonusDate` with `clawbackMonths`,
optional `targetResignDate`, `offerLeadWeeks` (default 8), `offerBufferDays`
(default 14), `workWeekDays` (5 or 6, default 6), and `asOf`.

Output: dated cliffs as `{ id, date, kind, daysAway }` where `kind` is
`'statutory' | 'contractual' | 'convention'`. Take the gratuity cliff from
`gratuity()` in `src/engine/gratuity.ts`, which already returns `flipDate` and
already implements both the four-years-240-days rule and the five-day-week
variant. Take the clawback end from `bonusClawback()` in
`src/engine/clawback.ts`. **Do not reimplement either.** Then
`earliestCleanDate`, and working backwards from the resign date:
`lastWorkingDay`, `needOfferBy`, `startApplyingBy`, each with `daysAway`.

**Those last three are null until the user picks a date.** Do not quietly
substitute `earliestCleanDate` and present the result as their plan. The screen
shows cliffs first, and the backward plan only once a date exists.

Rules: engines return ids and the UI maps them through `t()`. Reuse
`src/engine/dates.ts`. Never invent a statutory number. Conventions carry
`kind: 'convention'` and their defaults are exported constants so the UI can show
and edit them.

At least eight hand-worked test cases, including: no optional fields; someone
already past five years, where there is no cliff and the backward plan is the
whole output; someone inside the 240-day window on a six-day week; the same
person on a five-day week, where the date differs; a resign date falling before a
cliff, which must be listed as forfeited and never silently dropped; and two
cliffs pulling in opposite directions, which is Ravi's case in Part 3.

**The saved plan.** New file `src/data/plan.ts`, key `switchkarle.plan.v1`, shape
from Part 5, through `src/lib/storage.ts`.

**Read the section "Nothing is written until the user types" in
`docs/ARCHITECTURE.md` before writing a line of this.** The plan is written from
explicit answers rather than continuous typing, which is exactly the shape that
loses the user's first entry. It must either echo its draft on mount like every
existing tool, or call `releaseBootEcho` and say why in a comment. Choose one
deliberately and pin it with a test that fails without it.
`src/data/currentJob.ts` is the worked example and the newer of the two patterns.

`noticePeriodDays`, `monthlyBasic` and `monthlyBasicDA` are **not** stored in the
plan. They live in `src/data/currentJob.ts`. Read and write them there through
`fillFromCurrentJob` and `rememberCurrentJob`. `monthlyBasic` and
`monthlyBasicDA` must never be copied into each other: gratuity uses basic plus
DA, the other exit tools use plain basic, and the record keeps them apart for
that reason.

**The home page.** This needs a high-taste model, because the words are the
product here. With no saved plan: the two sentences from Part 2, three fields,
cliffs with no money, the optional basic field, the optional bond line, a date
picker, then the first action. With a saved plan: their reason, day count, next
action, date and days remaining, then that stage's tools. The tracker moves under
"Looking, quietly" and is reached from the plan.

**The reason for leaving renders on the screen, not behind a tap.** An earlier
draft said the opposite, based on a rule Kalpit retired on 2026-09-06. Do not
reintroduce it. It still must not reach the tab title or any meta tag, for the
same reason no other user input does.

**The erase control has to survive the change.** It lives in two places:
`src/components/Shell.tsx` puts it in the footer of every page, which a new home
page inherits for free, and `src/components/Tracker.tsx` puts it in the board's
button row, which moves off the home page when the tracker does. Do not let the
second one vanish silently in the move.

Copy goes in `en.ts` with Hindi pairs in `hi-suite.ts`, in the code-mixed
register that file already uses, keeping CTC, PF and notice period in English.
`PRODUCT.md` rule 1 holds: a real calendar renders from example inputs behind the
Example chip before anyone types. Check at 375px wide, where the first action
must be visible without scrolling.

**Done when** a stranger with nothing saved lands, reads two sentences, answers
three questions, sees their own dates and one thing to do, and nobody with
existing saved data notices any change.

### Phase 1: actions, coming back, calendar, sharing

- `src/data/actions.ts`: the ten actions in order, each with `id`, `stage`,
  `minutes`, and `where: 'here' | 'tool:<slug>' | 'external'`. Tested for order,
  and that every `tool:` slug exists in the registry.
- The returning-visitor screen from Part 4. Tick boxes record the date.
- Tracker: allow saving a card with a company and no job title. That is
  `PRODUCT.md` rule 2, and it is why someone at stage 0 cannot use it today.
- `src/lib/ics.ts`: pure string builder, tested against a fixed expected output.
  Dull event titles by default. Downloaded the same way the share image is.
  **Every event carries a URL back to the plan**, in both the `URL` property and
  the description, because this file is the only reminder a site with no server
  can send. Test that the link is in every event, and that no event contains a
  rupee figure or a company name.
- The "tell one person" card: dates and stage only. Reuse the share image path.

**Done when** a round-two tester goes from first visit to "applied to one"
without seeing a grid of tools, and nothing with a rupee in it can be shared.

### Phase 2: the tools take their places

*Plain version: each tool appears at the stage where it is useful. This is bigger
than it sounds.*

The registry already has a `category` field with four values, and a `stage` field
that is **a sort key inside a category, not a journey stage**. `src/data/home.ts`
sorts by it. The seven stages in `PRODUCT.md` are a different model, and the two
disagree on real rows.

**Do not overload the existing `stage` field.** Add a separate field for the
journey stage, migrate the home page onto it, and delete the old sort key only
once nothing reads it. Changing the meaning of a field that 34 rows already use,
in place, is how a quiet mis-sort ships.

- Every tool gets exactly one journey stage. The table in Part 7 is a starting
  proposal, not a finished answer. Where it and the registry disagree, that is a
  decision for Kalpit rather than something an agent settles silently.
- The plan renders the current stage's tools. "All tools" keeps the full list and
  the search.
- Prompt Studio reads company and stage from the plan. Never money.
- A test asserts every tool belongs to exactly one stage, and that all 34 URLs
  are still reachable.

**Done when** the home page is no longer a grid, and every tool is two taps from
either the plan or "All tools".

### Phase 3: Kalpit's

Native Hindi pass. Domain switch. Distribution date. Not agent work.
