# DIRECTION — what we build next, and why

**In one paragraph.** Switch Karle has 28 tools built for the day you get a job
offer. The people who actually show up have not applied anywhere yet, and three
of them told us so. This document proposes replacing the front door: three
questions, a calendar of your own dates, and one thing to do today. The 28 tools
stay exactly as they are and appear when they become relevant. Nothing is
deleted, and no new calculator gets built until the front door exists.

**Kalpit decides.** This is a proposal, not a decision. Parts 1 to 12 are written
for him. Part 13 is instructions for coding agents and he can skip it.

**Delete this file once the ten-person result is in, whichever way it goes.** One
earlier version said to keep it until the build was finished. The next said to
delete it after four edits made before any code. Both were wrong. The edits that
correct facts already shipped happen now. The one edit that changes what the
product *is* waits for the test, because rewriting `PRODUCT.md` on a proposal and
then failing the test leaves the repo worse than it started. `PRODUCT.md` says why
the deadline matters at all: a second document explaining what the product should
be is how this repo ended up with three contradicting roadmaps in one day. Part 12
carries both lists.

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
| 2026-09-06 d | Rewritten for clarity. App rename opened as PR #41 |
| 2026-09-06 e | Two repo-aware reviews. Eight code-level findings, all verified true, all fixed |
| 2026-09-06 f | Eleven more from the same two reviews. Ten accepted, one disproved |
| 2026-09-06 g | This version. An outside review of f. Part 13 now describes the product Parts 3 to 12 froze, and four first-visit calls are settled |

### Fixed in versions a to f. Please do not re-report these

Headlines only. Each was checked against the code before being accepted, and each
is fixed in the Part named.

- Three questions cannot produce a rupee figure. Part 3.
- The old worked example was arithmetically impossible. Rebuilt in Part 3.
- "27 tools" was wrong. It is 28 tools across 34 URLs.
- Nothing brings the user back. It is Part 4, named as the weakest thing here.
- The pass mark accepted a promise as evidence. Part 9.
- The reason for leaving is no longer hidden behind a tap. Part 4.
- The worked example used the wrong work week. Pune IT services is five days, so
  Ravi's real cliff was 21 July 2026, not 9 September.
- The ten-employee threshold was silently assumed.
- The money field said "monthly basic" and then priced gratuity from it.
- Join date has no shared home. Three tools each keep their own copy.
- The build brief took a clawback end date from `bonusClawback()`, which returns
  no date.
- The app rename was described as done. It is PR #41, open, unmerged.
- Recruiter follow-up was missing from the stage table.
- Phase 0 had grown into the whole plan product.
- A person with no cliffs got a blank timeline, because `gratuity()` returns
  `flipDate: null` for anyone already eligible. Plain runway instead.
- The document contained four different first-session sequences. Frozen in Part 3.
- The first screen could not fit on a phone. Phase 0 is three screens.
- The calendar file was measured in Part 9 and shipped in Next.
- The pass mark scored only a downloaded file. A screenshot counts.
- The hike month had no year.
- "Nine of ten actions can be done today" was false. Only three are.
- The public profile change came before company research. Swapped.
- The bond check was mandatory for everyone. Conditional now.
- The returning screen put the tool grid back. Removed.

**And one that was wrong.** One review said 12 January 2022 to 6 September 2026
is four years and eight months. It is four years, seven months and 25 days: the
eighth month completes on 12 September. The same review's own gratuity arithmetic
depends on it being 237 days into year five, which agrees with seven months.

### Fixed in version g

An outside review of version f. Most of it was one finding wearing several hats:
**Part 13 still described the screen that Parts 3, 4 and 12 had already replaced.**

- **Part 13 rebuilt the one long first screen** Part 3 froze into three, put the
  tool grid back on the returning screen, called Phase 0 "one screen" in Part 10,
  put the money field under the cliffs, and asked one viewport to hold the first
  action at 375px. All deleted.
- **"Always having a today action"** invited invented busywork. Replaced by the
  looking-unlock: the user says they are ready, we do not manufacture a task.
- **The step-one quote printed "May" with no year**, two paragraphs above the rule
  demanding a year.
- **Join date and notice period had two homes**, the plan in Part 5 and
  `currentJob` in Part 13. So did `workWeekDays` and `coveredByAct`, which had
  none. Settled below.
- **`earliestCleanDate` and `forfeited` were named and never defined**, one of
  them inside a required test case. Both defined in Part 13.
- **The calendar spec risked a hardcoded `switchkarle.fyi`.** The live site is
  `kalpit.me/switch-karle/` and the link is built from the Astro config.
- **Phase 1's done-when required "no grid of tools", which is Phase 2's job.**
- **Small ones.** Four tools named and then called "those six tools". "About
  ₹2,07,700" where the engine returns ₹2,07,692. "End of the financial year" with
  no 31 March. "Apply to four more" as a fifteen-minute action. Tracker cards for
  a feature Phase 0 does not ship.
- **Part 12 rewrote `PRODUCT.md` before the test that decides whether the premise
  holds.** Split into before and after.

**And one that was wrong.** The review read "257 days until 1 June" as a
miscounted gratuity day count. It is not a day count into year five. It is the
days from day 12 of Ravi's plan, 17 September 2026, to 1 June 2027, and it is
exactly 257. The text stands. Day 12 is no longer called "Sunday", which it was
not.

### Settled by the owner. Please do not re-open

- **One home per fact for the plan and `currentJob`.** Facts about the current
  employer live on `currentJob`. The plan holds only what the plan invents. The
  split is in Part 5 and Part 13 and it is not a matter of taste.
- **The four first-visit calls**, all in Part 3: the work-week **fork** rather
  than a default, date options that are **trades** rather than bare dates, a
  **looking-unlock** the user taps instead of a made-up daily task, and a calendar
  file carrying a **near-term check-in event** rather than only distant ones.
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
3. **Part 6, the order of the ten actions.** Still partly invented. The private
   and outbound split is defensible. The order inside each half is not evidence.
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
| The live site is `kalpit.me/switch-karle/`, not the `.fyi` domain | `site.config.mjs`, `SITE` and `BASE` |
| The gratuity engine defaults to a six-day week because it is more common, not because it is safer | `src/engine/gratuity.ts`, the `workWeekDays` comment |
| `gratuity()` returns no per-cliff forfeited flag | `src/engine/gratuity.ts`, `GratuityResult` |

---

## 1. The problem

Three colleagues opened the site. None of them wanted it. What they meant,
underneath the politeness:

**"Can't I just ask ChatGPT this?"** They saw a decoder and a page of
calculators, which is what the home page was at the time. A page of calculators
looks like something a chatbot already does.

**What a stranger sees today is different, and worse for this person.** Since 30
August the home page has been the application board, with the tools below it
(`src/tools/home/index.tsx` renders `<Tracker />`). Someone who has applied
nowhere now lands on a Kanban of example applications at companies that do not
exist. A reviewer read the old scene and assumed the colleagues had seen the
board. They had not, but the point survives the correction: **the current door is
aimed even further past this person than the one they rejected.**

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

### This does not replace what the product is for

`PRODUCT.md` says the job is "one number they can hold on to, in their own hand,
that nobody else in the conversation has." That stays true. **The plan is the
door. The number is still the job.** If the home page becomes a streak of
fifteen-minute tasks, we have built a habit app that owns some calculators, and
the complaint was paralysis rather than a missing to-do list.

So the sentence in `PRODUCT.md` gains a companion rather than being replaced: the
plan is what the first visit is for. What comes back on the second visit is the
next thing to do, not a number. **The number sits behind a link that says "what
this is worth", and that link only exists once a date does.** An earlier version
said the number was what every visit after the first was for, which is not the
screen Part 4 describes.

**And this is the second front-door rewrite, which is worth saying out loud.**
The tool grid was replaced by the board on 30 August, on the same kind of hallway
feedback that produced this document. The board is now the thing in the way.
Naming that here is the only defence against a third rewrite in October: **the
ten-person test in Part 9 exists so the next change is driven by evidence rather
than by the last conversation.** That is also why `PRODUCT.md` is not rewritten
before the test runs. Part 12 splits what happens now from what waits.

---

## 2. The idea

One sentence for what the product becomes:

> **Switch Karle turns "I'm done here" into a dated plan and one thing you can
> do today, then walks with you until your first day at the new job.**

The home page tagline, replacing today's:

> You have wanted to leave for a while. Three questions. Your dates. One thing to
> do today.

**The old draft promised "the numbers nobody else in the conversation has" here.**
Three questions produce dates, not rupees.

### Why a chatbot does not replace this

This answers the first objection, and the answer is not "we are more accurate".

**A chatbot cannot hold your dates.** It does not know your gratuity cliff is on
9 September, that your hike lands in May 2027, that you promised yourself you would
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
3. Which month does the hike actually reach your account? *May*, and he can
   skip this. Not the appraisal month and not the letter month, because those
   come earlier and people answer with the wrong one.

### Step one: dates, with no money in them

> **Gratuity depends on your week.**
> Five-day week, Saturday and Sunday off: safe since 21 July 2026.
> Six-day week: 9 September 2026.
> **Which is yours?** **[five-day]** **[six-day]**
> *Fewer than ten people at your employer? Then the Act does not cover you.*
>
> **Your hike lands in May 2027.** Resigning before it means you never see it.

**Both readings are shown, and neither is labelled his until he chooses.** A fork,
not a default with a correction toggle. An earlier draft printed "9 September,
three days from now" beside a five-day-week toggle, which is a countdown to a date
Ravi does not have. **No "in three days" line before the choice.**

Ravi works for an IT services company, which is a five-day week. He taps
five-day:

> **Your gratuity was already safe on 21 July 2026, seven weeks ago.**
> That is one thing less holding you here.
> **Your hike lands in May 2027.** That is now the only date holding you.

**His answer is a fact about his employer, so it is stored on the shared
current-job record and never asked again.** The ten-employee line behaves the same
way. **Neither adds a question to screen one**, which stays at three.

**The hike month prints a year, everywhere.** Ravi answers "May" in September
2026, and May 2026 has gone. The rule is the next time that month comes round,
skipping it if this year's has passed, so the screen says "May 2027". Without the
year, "waiting until June costs you nine months" is arithmetic about a date that
already happened.

### Step two: pick a date

Cliffs, then the date. Nothing else in between. **The options are trades, not
dates.** A date on its own says nothing about what it costs.

> **When do you want to be out?**
> **[Keep the hike]** Out on 1 June 2027. Start applying by 23 March 2027.
> **[Keep only what is already earned]** Your gratuity is already safe. Pick any
> date from here and you give up the hike. *You would already be late to start
> applying.*
> **[I already have a date]**

**Three trades, and none of them is recommended.** A stuck person handed an empty
date picker has been given homework, not help. Naming what each date keeps turns
the arithmetic into a choice. Marking one "recommended" would make the choice for
him, and Part 10 forbids that: nine months against one hike is his trade, not
ours.

**"Keep the hike" is the day after the hike cliff, and the hike cliff is the last
day of the hike month.** For Ravi that is 31 May 2027, so the date is 1 June 2027.
**The second option shows `earliestCleanDate`**, the first day on which nothing
still ahead of him is forfeited. For Ravi that is also 1 June 2027, because the
hike is his only cliff still ahead. For someone with two cliffs ahead the two
differ, and that difference is the reason to print it.

**An option whose `startApplyingBy` has already passed says so, in words, on the
option itself.** Not an icon and not a colour. Hiding it would be choosing for him.

**The "day after your gratuity" chip is gone.** A cliff he has already cleared is
not a date to leave on, and offering it as one told him to hurry for no reason.

**When there are no cliffs at all, the screen must still work.** Someone six
years in who skips the hike month has nothing statutory ahead of them, and
`gratuity()` returns `flipDate: null` once a person is already eligible, so the
cliff list is genuinely empty. That is not a rare case and a blank timeline is
the worst possible answer to it. The date step then offers plain runway instead:
**three months, six months, 31 March, or any date.** 31 March is written as
"31 March, the end of the financial year", because "end of the financial year"
alone is a phrase people read past. The backward plan works identically. It never
needed a cliff, only a date.

### Step three: keep the dates

Only after the date exists:

> **Your dates.** Start applying by 23 March 2027. Offer in hand by 18 May 2027.
> Resign on 1 June 2027. Last working day 30 August 2027, on 90 days' notice.
>
> **[Add these to my calendar]**
>
> Why are you leaving? One line, and you will see it at the top every time you
> come back. *(optional)*
>
> **[I want to start looking now]** *Starting now is allowed. Two things can
> reach your manager: the referral message and a change to your public profile.
> Neither is automatic and both stay your choice.*

**Keeping the dates is the one action.** Rule 9 says one next thing, so there is
one button. The reason box is optional and sits below it, and the looking tap is a
door rather than a task. An earlier draft made writing the reason the one action,
which asks a person who has just decided something to go and journal about it.

**A reason before a date is a journal entry. A reason after a date is a
decision**, which is why the box is here and not on screen one. Earlier drafts of
this document held four different first-session sequences. **This is the one that
counts, and Part 13 matches it: questions, cliffs, pick a date, keep the dates.**

**The work-week fork is not decoration.** The gratuity cliff is four years and 190
days on a five-day week and 240 on a six-day week. Ravi is 21 July on one and 9
September on the other. The engine defaults to six because its own comment says
six is more common, which is not the same as safer: for a Pune IT services
employee that default **invents a cliff that is not there.** The Act's
ten-employee threshold is the same, and the engine comment says it plainly:
*asked, not assumed*. **Three questions, then the assumptions shown next to the
answer they change.** A number whose assumptions are hidden is the thing this
product exists to be better than.

**And this is why the three questions ask for no salary.** A date needs only a
join date and a notice period. A rupee figure needs your last drawn basic plus
dearness allowance, and nobody asked for it. Promising money from three
questions that cannot produce it was the first hole in this document.

### Step four: money, only if he wants it

Not a screen and not a field on one. **A link that says "what this is worth",
which exists only once a date does.** Tapping it opens one optional field.

> Add your monthly **basic plus DA** and I will tell you what each date is
> worth. *[ ₹72,000 ]*

> That gratuity is worth ₹2,07,692.

**It does not sit under the cliffs on screen two.** An earlier draft put it there,
which is a money field in front of someone who has not picked a date. That is rule
11 broken on the screen the rule exists for.

**If he has used the gratuity, notice buyout, leave encashment or F&F tool
before, this field is already filled in.** Six tools share one saved record of his
current pay, which shipped on 5 September. He is never asked twice. That is
`PRODUCT.md` rule 7, and the plan is the first thing that really uses it.

**Two different "basic" numbers, and they must never merge.** Gratuity uses basic
plus dearness allowance. Notice buyout and leave encashment use plain basic. The
saved record keeps them apart deliberately and never copies one into the other.
Merging them hands a wrong number to anyone with a DA component.

**An earlier draft of this document walked straight into that trap**, two
paragraphs after warning about it. It labelled the field "monthly basic" and
then printed a gratuity figure from it. For anyone drawing DA that number is
wrong. The field says basic plus DA, or no gratuity rupee hangs off it.

**Join date has no shared home either, and the plan would be the fourth copy.**
`gratuity`, `fnf-checker` and `epf-transfer` each keep their own. That is rule 7
broken three times over already. Phase 0 adds `joinDate` to
`src/data/currentJob.ts` and the plan reads it from there. **Moving the three
existing tools onto it is Phase 1**, because three tools is a migration and Phase
0 is a two-week slice. The shared record's existing rule covers the gap: the
latest value typed anywhere wins.

### Step five: the gap that decides whether this works

The site now knows Ravi should resign after 1 June, needs an offer by 18 May, and
should start applying by 23 March. **March is six months away.**

A plan that answers "when do I start" with "March" is a plan he closes and
forgets, which is the exact failure this document exists to fix. Two things have
to be true for it to survive that.

**"Start applying by" is the latest safe start, never an instruction to wait.**
Starting earlier is usually better. It only means holding an offer longer or
negotiating a later joining date. **The screen says "starting now is allowed" in
those words**, because a date six months out reads as permission to do nothing.
That sentence is in the screen-three spec in Part 13, not only in this paragraph.

**So the gap is filled by his own tap.** Screen three and every return screen
carry one control: **"I want to start looking now."** It records the day he tapped
it, unlocks the outbound actions, and **does not move his resign date.** He can be
looking in September and still leaving in June. It carries one line of warning,
because two outbound actions are the ones a manager can see: the referral message
and a change to a public profile.

**An earlier draft claimed nine of the ten actions can be done today. That was
false, and a reviewer was right to call it homework.** Messaging an ex-colleague,
changing a public profile, and blocking Saturday for applications are how a
manager finds out six months early, or are empty ritual, or both. Only three are
genuinely safe in September: write the reason, name five companies privately,
tell one person outside the company.

**So the list is date-aware or it is not a list.** Only the private actions appear
until today is on or after `startApplyingBy`, **or** he has tapped "I want to start
looking now". Part 6 sets out which is which. **We do not invent month-by-month
busywork to cover the gap**, and a made-up task is worse than an honest empty
week. An earlier draft filled it by always having a today action, which is the
same thing as inventing one.

**This is still the sharpest risk in the design and it may not be enough.** Three
actions do not fill six months. What might: saying on the screen, plainly, that
most people who set a date this far out do not start on time. If round two shows
people drifting away between picking a date and applying, this needs an idea
nobody has had yet.

---

## 4. Coming back

He picks 1 June 2027. He adds the dates to his calendar. He writes his reason. He
closes the tab. Twelve days later he comes back and the page opens with:

> *"My manager takes credit for my work and I have stopped learning."*
> Day 12. Next: name five companies you would say yes to. Twelve minutes.
> 257 days until 1 June 2027.
> **[I want to start looking now]** · what this is worth

**That is the whole screen, and the restraint is the point.** An earlier draft
added the current stage's tools underneath. At "I'm done here" that is five
calculators sitting next to a twelve-minute action, which is rule 9 broken by the
document that wrote rule 9. People tap the calculator and the plan dies. Stage
tools go behind one tap, or they wait for Phase 2.

**His own sentence, in front of him, is the point.** It is what makes someone who
has drifted for eleven days do the next twelve minutes.

### Why the shoulder-surfing rule was retired

`PRODUCT.md` rule 5 used to say nothing on screen or in browser chrome should
name the job switch to anyone glancing over. **Kalpit retired it on 2026-09-06**,
and it is recorded here because a future agent will otherwise read the old text
and start designing timidly again.

His reasoning: most people do this on a personal device, in the evening. Designing
every screen around the few who open it at work taxes everyone else for a threat
most users do not have. The rule never held anyway. The site is called Switch
Karle, and so are the URL and the tab title. Notes mode was deleted in August for
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

**The calendar file is the way back, so it has to carry the link and it has to
have a near date in it.** A calendar event can hold a URL and a description, and
calendar apps display them. That is the only reminder a site with no server can
send, which makes `src/lib/ics.ts` matter far more than a file that formats dates
should.

**One file, several events.** An earlier draft shipped a single event on the
resign date. For Ravi that is 2027, so a file downloaded in September 2026 does
nothing for nine months. `dates.ics` carries **a check-in event seven days from
today**, each cliff, and the resign date. All all-day, all dull titles. The
check-in is the one that can actually bring him back.

**No reliance on alarms.** Google Calendar drops custom `VALARM` blocks on import,
so a file whose only reminder is an alarm reminds nobody. The event sitting on a
day is the mechanism.

**Say the cost of that out loud.** If he imports it into a work Google account,
the events sit on a company server and the notes carry a link with the site's name
in it. Dull titles reduce what a glance shows. They do not hide where it came
from. That is consistent with retiring the shoulder-surfing rule rather than a
reason to reverse it, and the download button says so in one line.

**And a known limit, not a blocker.** iOS files the download under Files, Android
under Downloads, and some people will not find it. Part 9 counts a screenshot for
exactly this reason.

**The site is installable and almost nobody knows.** The manifest is already
there, set to standalone with icons. Renaming it from "Switch Karle — Decode
your CTC" to plain "Switch Karle" is **proposed in PR #41 and not merged**, so
on `main` the old name still stands. An earlier version of this document said it
was done. It was not, and a reviewer with repo access caught it.

**The first session has to be worth it even if he never returns.** He leaves with
his dates in his calendar, so the visit paid for itself. Design for one session
and treat every return as a bonus.

---

## 5. What gets saved, and where

Two separate records, and **the split is one home per fact**, not a preference.
Facts about his current employer belong to the employer record. The plan owns only
what the plan invented.

**The current-job record owns the employer.** `switchkarle.current-job.v1` already
holds monthly basic, basic plus DA, gross and notice period. Three fields are
added.

| Field | Where it comes from |
|---|---|
| `joinDate` | Question 1, and the three tools that keep their own copy today |
| `noticePeriodDays` | Question 2. Already stored |
| `workWeekDays`, 5 or 6 | The fork on screen two |
| `coveredByAct`, true or false | The ten-employee line on screen two |
| `monthlyBasic`, `monthlyBasicDA`, `monthlyGross` | Already stored |

**The plan record owns the plan, and holds no money at all.**

| What | Asked when |
|---|---|
| The one line reason for leaving | First session, after picking a date, optional |
| Month the hike lands, with its year | Question 3, skippable |
| The date he picked to resign | End of the first session |
| `lookingSince` | The day he taps "I want to start looking now" |
| Which actions he has ticked, and when | As he goes |
| The five company names | Action 2, a plain list |

**One fact, one home.** An earlier version had join date and notice period in
both records, which is how someone types a join date twice and sees two different
gratuity dates.

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

**Private, and safe the day they arrive.** These are the only ones shown before
the calendar says looking has started.

1. Write the one line reason you are leaving. *(on the site)*
2. Name five companies you would say yes to. *(a plain list on the plan, no job
   title and no tracker card)*
3. Tell one person **outside your company**. A partner, a sibling, a friend with
   no line back to your employer. *(a share card with dates only, no money)*
4. **Only if they said they have a bond or a joining bonus:** read what it
   actually commits you to. *(bond scanner, bonus clawback, clause library)*

**Outbound. These render when today is on or after `startApplyingBy`, or when
`lookingSince` is set.** Two conditions, either one is enough. Pulling the resign
date forward is not required and never was.

5. Research your first two companies using your own AI. *(Prompt Studio)*
6. Message one ex-colleague about a referral. *(Scripts)*
7. Update your Naukri and LinkedIn headline, with notify-your-network off and the
   recruiters-only setting on. **The most visible thing on this list**, and the
   action says so before it suggests any change. *(a checklist, never automation)*
8. Block two hours on Saturday for applications. *(calendar)*
9. Apply to one.
10. Apply to one more. This one repeats until five applications are in.

After ten, the board takes over. It already knows what to do with an application,
an interview and an offer.

**Research comes before the public profile change.** Changing a headline before
you know which companies you want exposes you with nothing in the pipeline. Both
reviewers raised it independently.

**The bond check is conditional**, shown only to people who said they have a bond
or a clawable joining bonus, using the optional line from Part 5. A mandatory step
two that does not apply to you is where someone stops.

**"Enter your monthly basic" is not an action.** That is the product asking for
data, and it fought rule 11. It stays the optional field in Part 3.

**Action 10 is the honest end of the list.** One application is a test. Five is a
pipeline. It asks for **one** more and comes back, because "apply to four more" is
four hours and rule 10 caps an action at fifteen minutes.

**And one disagreement that survives two reviews.** Both said telling someone is
too early and should move near the end. The secrecy concern is right, which is
why the action names who to tell: someone with no line back to the employer.
Moving it is still wrong. Telling a person is a commitment device and its value is
highest while motivation is the thing missing, not after the hard part is done. It
also carries no disclosure risk once the audience is a partner or a sibling. The
real leaks are the referral message and the public profile, and both now sit in
the outbound half behind the applying date. **Round two settles this, not
argument.**

---

## 7. Where the 28 tools go

Nothing is deleted. Everything gets a home, and only the current stage's tools
are on screen. The rest live behind "All tools", which keeps the search.

| Stage | Shown here |
|---|---|
| "I'm done here" | gratuity, bond scanner, bonus clawback, leave encashment, clause library |
| "Looking, quietly" | tracker, Prompt Studio, redactor, recruiter follow-up |
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
attaches to a date, as in "leaving three days early loses ₹2,07,692", never the
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
if you feel like it." **Do not say when you will follow up.**

**Why that last sentence matters more than it looks.** An earlier version
announced "I'll ask you four questions next Sunday", which is exactly the
reminder the product cannot send. Question 4 would then measure Kalpit's
WhatsApp, not the product, and it would measure it as an upper bound because they
knew he was coming. Message on day 8 without warning, or have someone else send
it.

**Ask a week later.** All four are about what already happened. None asks for a
promise.

1. Did you do the first action?
2. Did you pick a date?
3. Where did the dates end up? Added to your calendar, a screenshot, sent to
   someone, or nowhere. Pick one.
4. **Before this message**, had you opened it again?

**The pass mark, split by what the product can actually cause.**

| Measure | Bar | Can the product cause it? |
|---|---|---|
| Did the first action | 5 of 10 | Yes. Phase 0 owns this |
| Picked a date | 4 of 10 | Yes. Phase 0 owns this |
| Recorded the dates somewhere | 4 of 10 | Yes. Phase 0 now ships one add-to-calendar control |
| Opened it again | 3 of 10 | **No. Nothing can reach them** |

**Miss the first two and stop building.** That is the door failing, and the
premise is in trouble.

**Missing the last one is not the same failure and must not be treated as one.**
It means a site with no reminder cannot create a habit, which everyone already
suspects. The answer to that is a reminder that needs a server, which is
Kalpit's decision under `PRIVACY.md`, or accepting that this is a one-session
product. Neither of those is "the plan was the wrong idea".

**And ten people from your own circle will be kinder than strangers.** A pass
here means the door works on friendly traffic. It is not proof the nine-month
walk works.

**Question three carries more weight than it looks, and it was measuring the
wrong thing.** The calendar is the only way this product can reach anyone, so
someone who kept the dates nowhere is someone who is not coming back. But an
earlier version scored only a downloaded `.ics` file. A person who screenshotted
their dates has recorded them; failing them would have marked a file-handling
annoyance as the premise being wrong. Two reviewers caught the same thing and the
question now counts any way of keeping the dates. **It asks which way**, in four
options, because "yes" tells us the bar was cleared and nothing about whether the
control we shipped is what they used.

**The calendar file is Phase 0's only return mechanism, and that has to be said
before the result comes in.** A low score on question 4 is evidence that a file
cannot create a habit. It is **not** evidence for or against building a server,
and must not be read as either. That is Kalpit's call under `PRIVACY.md`.

**It also measured something not yet built.** The calendar file sat in Next while
the test runs the week the door ships, so **add-to-calendar moved into Phase 0**.
You cannot measure what you have not shipped.

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
  3 handles it with one tap, "I want to start looking now", which unlocks the
  outbound actions without moving his date. That may not be enough. What it does
  not do is manufacture a task for every empty day, which was the earlier answer
  and was worse.
- **A plan is harder to write than a calculator.** The words carry it.
  Agent-written motivational copy is the fastest way to make this feel like an
  app that wants something from the user. Keep the `PRODUCT.md` voice: plain,
  unhurried, bad news first, no cheerleading.
- **"Tell me what to do next" drifts towards advice.** Stay on dates, arithmetic
  and pointers. Ravi's nine-months-for-one-hike trade is his to make. Show both
  sides and never choose for him.
- **This pivot could itself become over-engineering.** The guard is the size of
  Phase 0: three questions, three screens, one calculation, one file to download.
  If it takes more than two weeks of agent work, it has grown and should be cut
  back.
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

### Edits only Kalpit can make, in two groups

**An earlier version put all four before any code.** That rewrites what the
product is on the strength of a proposal, leaving the Part 9 test nothing to
decide. The five below only correct facts already true in the repo, so they are
safe now.

**Now, before code.**

1. **`PRODUCT.md`**: retire rule 5 in place, keeping its number so the references
   below it survive.
2. **`PRODUCT.md`**: fix the trust section, which still says there is no way to
   erase saved data. Erase shipped on 5 September.
3. **`PRODUCT.md`**: the reader is still described as someone on a company laptop
   on a monitored network. If that is no longer the design centre, that paragraph
   changes too, or agents keep designing timidly from page one.
4. **`docs/DECISIONS.md`**: record retiring the shoulder-surfing rule, in about
   five lines.
5. **`ROADMAP.md`**: one Now entry naming the dated-plan door **as a trial**,
   carrying the pass mark from Part 9 so the result is written down before the
   test runs. The Next, Later and Stop lists below can go in at the same time.

**After the test passes.**

6. **`PRODUCT.md`**: the premise edit. The plan becomes the first-visit job,
   keeping "one number" as what the product is for. This is the only edit that
   changes what the product claims to be, and it waits for evidence.

**If it misses twice**, the door goes to Not Doing and `PRODUCT.md` is never
touched. That is a real outcome, not a formality.

Then delete `docs/DIRECTION.md`, whichever way the test went. Part 13 belongs in
the Phase 0 pull request description, not in a file agents will read as direction.

### Now

- **The thin front door, as a trial with the Part 9 pass mark attached.** The
  three-screen slice in Part 13 and nothing beyond it. Questions, cliffs, pick a
  date, keep the dates. English and Hindi.
  *Why: three out of three people could not get from the thought to an action.*
- **The tagline, title and app name say what the site is.** The tagline in Part 2,
  the home page title in both languages, and the manifest rename already open as
  PR #41.
- **The ten person test, round two.** Run it the week the door ships, not after
  "the site is complete".

### Next

- **The first ten actions**, with tick boxes, the private and outbound split, and
  the returning-visitor line. The tracker accepts a company with no job title.
- **The three tools that keep their own join date move onto the shared record.**
  `gratuity`, `fnf-checker` and `epf-transfer`, using the pattern PR #39 proved.
- **The "tell one person" card**, and any calendar events Phase 0 left out. Dates
  only, dull titles, and every event carries a link back.
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
- **A one-tap Google Calendar template link.** It is genuinely better than a
  downloaded file, and it sends the user's dates to Google before they have chosen
  anything. That fails the test in `PRIVACY.md`. Recorded here so it is not
  proposed again as an obvious improvement.
- **A save-as-picture control.** A screenshot already counts in the Part 9 pass
  mark, and building a second way to keep the dates dilutes what question 3
  measures.
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

### Phase 0: the thin front door

*Plain version: work out the dates, save the answers, put them on the home page,
and stop there.*

**An earlier version of this phase was the whole plan product**, against this
document's own two-week guard. This is the slice that goes in front of ten
people:

**It is three screens, not one, and that correction came from a reviewer doing
the arithmetic on a phone.** The earlier list was eight items on one viewport. Two
sentences, three fields, cliffs, a money field, a bond line, a date picker and an
action is not one screen. It is four. Staged, it fits:

**Screen one.** The tagline from Part 2, and the three questions. Nothing else.

**Screen two.** The cliffs, and nothing else. **The work week is a fork, not a
default**: print both readings, with the question "which is yours?", and label
neither as the user's until they answer. No countdown sentence before the answer.
The ten-employee line sits under the gratuity cliff and works the same way. Both
answers are written to `currentJob`. No rupees on this screen at all.

**Screen three.** The date step, offering **trades, not bare dates**: "keep the
hike" (the day after the hike cliff, which is the last day of the hike month),
"keep only what is already earned" (shows `earliestCleanDate` and asks for a
date), and "I already have a date". **No option is marked recommended, and any
option whose `startApplyingBy` has already passed says so on itself, in words.**
When there are no cliffs at all, which is what `gratuity()` returns for anyone
already past the line, the options become plain runway instead: three months, six
months, **31 March (the end of the financial year)**, any date. **A blank
timeline is never shipped.**

Then, on the same screen once a date exists, the options give way to the dates
recap and **one button: add these to my calendar.** They are swapped rather than
stacked: leaving five option cards above the recap pushes the one button this
screen is for off a 375px viewport. "Change my date" brings them back. Below the
button, the optional reason box, with one line saying the reason comes back at
the top of the next visit. Below that, the looking tap: **"I want to start
looking now"**, which sets `plan.lookingSince` to today, unlocks the outbound
actions, and **does not move the resign date**. It carries one line of warning
naming the two things that reach a manager: the referral message and a change to
a public profile. **The words "starting now is allowed" appear on this screen.**

Plus, not on any screen: the Example chip working before anyone types, English and
Hindi, the tracker still one tap away, and erase still in the footer.

**The optional basic-plus-DA field is not on screen two.** It is behind a link
that says **"what this is worth"**, which renders only once a resign date exists.
Money follows a date. That is rule 11 and screen two is where it is easiest to
break.

**The add-to-calendar control is in Phase 0 on purpose**, against the instinct to
cut it. It is the only way this product can reach anyone, and the ten-person test
in Part 9 measures it in the same week the door ships.

**Not in Phase 0:** the ten tick-boxes, the share card, the journey-stage
registry work, Prompt Studio wiring, or removing the tool grid. Rule 9 says one
next thing, and that applies to the build as much as to the screen. (An earlier
version of this list also named the returning-visitor layout, which contradicted
the "with a saved plan" paragraph further down the same section. The layout is in
Phase 0: without it, a plan can be saved and never handed back.)

**The calculation.** New file `src/engine/switchCalendar.ts`. Pure TypeScript, no
React, with `switchCalendar.test.ts` written first.

Input: `joinDate`, `noticePeriodDays`, optional `hikeCreditMonth` (1 to 12),
optional `bondEndDate`, optional `joiningBonusDate` with `clawbackMonths`,
optional `targetResignDate`, `offerLeadWeeks` (default 8), `offerBufferDays`
(default 14), `workWeekDays` (5 or 6, default 6), `coveredByAct` (default true),
and `asOf`.

**`workWeekDays` and `coveredByAct` must reach the screen, not sit as silent
defaults, and they are stored on `currentJob`.** They are facts about the
employer, like the join date and the notice period, so they do not belong in the
plan. On a five-day week the cliff is four years and 190 days; on six it is 240.
For someone who joined on 12 January 2022 that is 21 July 2026 against 9 September
2026, and the wrong default invents a cliff seven weeks after the real one has
passed. The engine's comment on `coveredByAct` says *asked, not assumed*, and its
comment on `workWeekDays` says six is the default because it is **more common**,
not because it is safer. The screen forks rather than assuming either.

Output: dated cliffs as `{ id, date, kind, daysAway }` where `kind` is
`'statutory' | 'contractual' | 'convention'`. Take the gratuity cliff from
`gratuity()` in `src/engine/gratuity.ts`, which already returns `flipDate` and
already implements both the four-years-240-days rule and the five-day-week
variant. **The clawback end date is not in `bonusClawback()`.** That function returns
rupees and a repayment curve, and no date at all. An earlier draft told an agent
to take a date from it, which would have left them stalled or inventing one. The
date is `addMonths(joiningBonusDate, clawbackMonths)` from `src/engine/dates.ts`.
**The hike cliff is the last day of the hike month**, in the year the hike-month
rule resolves to, so "keep the hike" is the day after it.

Then `earliestCleanDate`, and working backwards from the resign date:
`lastWorkingDay`, `needOfferBy`, `startApplyingBy`, each with `daysAway`.

**`earliestCleanDate` is defined here because an earlier draft named it and never
said what it was.** It is the day after the latest cliff that has not yet passed.
If every cliff is already past, it is today. It is information on the date step,
never a date the product picks.

**`forfeited` is a per-cliff boolean, true when the chosen resign date falls
before that cliff.** It cannot exist before a date is chosen, so **it never
renders on screen two.** It renders on screen three's recap and on the return
screen, struck through, with the words "you give this up". `gratuity()` returns no
such flag; `switchCalendar.ts` derives it.

**`lastWorkingDay`, `needOfferBy` and `startApplyingBy` are null until the user
picks a date.** Do not quietly substitute `earliestCleanDate` and present the
result as their plan. The screen shows cliffs first, and the backward plan only
once a date exists.

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

**The calendar file.** New file `src/lib/ics.ts`, a pure string builder, tested
against a fixed expected output. One download named `dates.ics`, carrying several
all-day `VEVENT`s:

- **A check-in event seven days from today**, with a dull title such as "Check my
  dates". This is the one that can bring someone back, and without it the file is
  a message to 2027.
- Each cliff.
- The chosen resign date.

**Do not rely on `VALARM`.** Google Calendar drops custom alarms on import, so an
alarm is not a reminder. The event on the day is the mechanism.

**The link is built from `SITE` and `BASE` in `site.config.mjs`, never typed.**
Today that is `kalpit.me/switch-karle/`, and a domain cutover moves it for free.
**A hardcoded `switchkarle.fyi` ships a dead link**, because that domain is not
live. The URL goes in both the `URL` property and the description. The download
button says the notes contain a link with the site's name in it. No rupee figure
and no company name in any event.

**Known limit, not a blocker.** iOS files the download under Files and Android
under Downloads. Part 9 counts a screenshot for that reason, and **no
save-as-picture control is built** to compensate.

**The saved plan.** New file `src/data/plan.ts`, key `switchkarle.plan.v1`,
through `src/lib/storage.ts`. It holds **only** what Part 5's plan table lists:
the optional reason, the hike month with its year, the resign date,
`lookingSince`, the ticks, and the five company names as a plain list of strings.

**Read the section "Nothing is written until the user types" in
`docs/ARCHITECTURE.md` before writing a line of this.** The plan is written from
explicit answers rather than continuous typing, which is exactly the shape that
loses the user's first entry. It must either echo its draft on mount like every
existing tool, or call `releaseBootEcho` and say why in a comment. Choose one
deliberately and pin it with a test that fails without it.
`src/data/currentJob.ts` is the worked example and the newer of the two patterns.

**Add `joinDate`, `workWeekDays` and `coveredByAct` to
`src/data/currentJob.ts`.** The plan reads and writes them there, through
`fillFromCurrentJob` and `rememberCurrentJob`. `noticePeriodDays`, `monthlyBasic`
and `monthlyBasicDA` are already there and are **not** duplicated into the plan.
`monthlyBasic` and `monthlyBasicDA` must never be copied into each other: gratuity
uses basic plus DA, the other exit tools use plain basic, and the record keeps them
apart for that reason.

**`sanitise` has to change first, and it fails silently if it does not.** It keeps
a field only when the value is a finite number above zero, so an ISO date string
is dropped and so is `coveredByAct: false`, which is the answer that matters. Make
it per-field: a date string validated as a date, a work week of 5 or 6, a boolean
kept as a boolean including `false`. **Write the test that fails on today's
`sanitise` before the change.** No version bump: adding optional fields to
`switchkarle.current-job.v1` is backward compatible, since old records simply lack
them and unknown fields are already dropped.

**Moving `gratuity`, `fnf-checker` and `epf-transfer` off their own join-date
copies is Phase 1.** Three tools is a migration and Phase 0 is a two-week slice.
Until then the record's existing rule holds the line: the latest value typed
anywhere wins, so the plan and the tools converge rather than fight. PR #39 is the
pattern to copy.

**The home page.** This needs a high-taste model, because the words are the
product here.

**With no saved plan:** the three screens above, in that order, and never rebuilt
as one long page. An earlier version of this paragraph listed the tagline, three
fields, cliffs, the money field, the bond line, a date picker and the first action
as one screen, which is the layout the three-screen list replaced. If the two ever
disagree again, the list wins.

**With a saved plan:** their reason, the day count, the next action, the resign
date and days remaining, the looking tap if `lookingSince` is not set, and the
"what this is worth" link. **No tool grid and no stage tools**, per Part 4: five
calculators next to a twelve-minute action is rule 9 broken. Stage tools are Phase
2. The tracker moves under "Looking, quietly" and is reached from the plan.

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
Example chip before anyone types. **Check at 375px wide, where the one control on
each screen must be visible without scrolling**: "see my dates" on screen one,
"next: pick a date" on screen two, the first date option and then the
add-to-calendar button on screen three. The old rule asked one viewport to hold
the first action along with everything else, which is what forced the split.

**Done when** a stranger with nothing saved lands, reads the tagline, answers
three questions, sees their own dates, and leaves with them in their calendar.

For someone with saved data: **no saved value is lost, every existing URL still
works, and the tracker is one tap from the new home page.** An earlier draft said
nobody would notice any change, which cannot be true when the board leaves the
front page. Saying it anyway would have let an agent mark this done without
checking the thing most likely to break.

### Phase 1: actions, coming back, calendar, sharing

- `src/data/actions.ts`: the ten actions from Part 6, each with `id`, `stage`,
  `minutes`, `where: 'here' | 'tool:<slug>' | 'external'`, and
  **`visibility: 'private' | 'outbound'`**. Private actions show immediately.
  **Outbound ones render when today is on or after `startApplyingBy`, or when
  `plan.lookingSince` is set.** Two conditions, either one is enough, and neither
  moves the resign date. Tested for order, for every `tool:` slug existing in the
  registry, and that **no outbound action renders when both conditions are
  false.** That last test is the point of the field and it is the difference
  between a plan and six months of homework. Action 4, the bond check, renders
  only when the user said they have a bond or a joining bonus. Action 10 asks for
  one more application and repeats until five are in.
- The returning-visitor screen from Part 4. Tick boxes record the date. The
  looking tap sits here too, until `lookingSince` is set.
- Move `gratuity`, `fnf-checker` and `epf-transfer` onto `currentJob.joinDate`,
  using the pattern PR #39 proved. Test that no saved draft loses its join date.
- Tracker: allow saving a card with a company and no job title. That is
  `PRODUCT.md` rule 2, and it is why someone at stage 0 cannot use it today. The
  five names from action 2 stay a plain list on the plan and do not become cards.
- `src/lib/ics.ts` grows to any events Phase 0 left out. Pure string builder,
  tested against a fixed expected output. Dull event titles by default.
  **Every event carries a URL back to the plan**, built from `SITE` and `BASE`,
  in both the `URL` property and the description. Test that the link is in every
  event, that no event contains a rupee figure or a company name, and that no
  event depends on a `VALARM`.
- The "tell one person" card: dates and stage only. Reuse the share image path.

**Done when** a round-two tester goes from first visit to "applied to one", and
nothing with a rupee in it can be shared. **Removing the tool grid is Phase 2's
done-when, not this one.** Phase 1 ships no registry work, so requiring it here
would make the phase unfinishable.

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
