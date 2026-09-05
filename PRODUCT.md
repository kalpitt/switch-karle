# PRODUCT — Switch Karle

What this is, who it is for, and where their journey starts and ends.

**Kalpit owns this file.** Agents never edit it: propose changes in a handoff and
he applies them. It is the first thing to read before building anything, and it
outranks any inference you could draw from the code. If the code and this file
disagree, the code is wrong or this file is stale — say so, do not pick one
silently.

`ROADMAP.md` says what to build next. This says what we are building.

---

## The person

A salaried Indian professional, roughly 26 to 38. IT services, product, BFSI or
analytics. A metro or a tier-2 hub. Two facts shape everything:

**They are still employed.** Sixty or ninety days of notice sit in their
appointment letter. They work on a laptop the company owns, on a network the
company monitors, in an office where someone can walk past the screen.

**Everyone around them is giving them adjectives.** The manager says "we value
you." The recruiter says "great package." A parent says "don't leave a stable
job." Nobody is giving them a number.

That is the product's job. **One number they can hold on to, in their own hand,
that nobody else in the conversation has.**

> ₹1,42,300 lands in your bank on this offer. ₹1,36,900 lands today.
> That is 3.9%, not 30%.

---

## Where the journey starts

**At "I'm done here" — decided to leave, applied nowhere.**

Settled 2026-09-05. That person is a Switch Karle user, and they are the first
user, not an edge case.

The dominant feeling at that moment is not urgency. It is paralysis. They have
had the thought for a month or two and done nothing, because leaving has a cost
they cannot calculate. Four years and 240 days into a job without knowing the
gratuity cliff is in three weeks. A bond signed as a fresher, in a drawer,
unread. An appraisal cycle that makes February the worst month to leave and May
the best. A joining bonus from eighteen months ago that may still be clawable.

They do not need a job board. They need the arithmetic.

**The journey ends** at surviving the first ninety days of the new job: PF
transferred, BGV cleared, the insurance gap counted, and the tax bill from two
Form-16s seen coming before March.

---

## The seven stages

In the user's words, not product jargon. Every tool belongs to exactly one.

| # | Stage | What is happening | What we do |
|---|---|---|---|
| 0 | **"I'm done here"** | Decided to leave, applied nowhere | Price what leaving costs: gratuity earned and the date it flips, notice buyout, leave encashment, what the bond actually says |
| 1 | **"Looking, quietly"** | Applications out, waiting, in secret | Track it privately, research a company through your own AI, mask a payslip before sharing it |
| 2 | **"Talking to them"** | Interview loops, invented leave | Answer expected CTC without boxing yourself in, sanity-check a hike before it is offered |
| 3 | **"The number on the table"** | Offer in hand | Decode CTC to in-hand, compare offers, price variable and ESOP honestly, scan for red flags and scams |
| 4 | **"Telling them"** | Resigning | The letter, the conversation, the counter-offer, the early release ask |
| 5 | **"Serving it out"** | Sixty to ninety days as a dead man walking | Notice checklist, handover, F&F, chasing the relieving letter, insurance gap |
| 6 | **"The first 90 days"** | Landed | PF transfer, BGV, what to tell the new employer about tax, the two-Form-16 bill |

Stage 3 is the product's strongest work today. Stage 0 is the newest and the
thinnest. Stage 5 is the longest and loneliest stretch of a real switch and the
one we currently under-serve most — including the worst fear in the whole arc,
an offer going quiet while you are forty days into notice with no job to go back
to.

**The board is the middle of the journey, not the whole of it.** Stages 1, 2 and
3 are about companies, and a Kanban card fits them. Stages 0, 4, 5 and 6 are
about *you* — there is exactly one resignation, one notice period, one PF
transfer. They cannot be cards in a column because there is only ever one of
each.

---

## What we do not do, and why

We do not help you find a job. You find openings on Naukri, LinkedIn, or through
a referral. We own everything else.

Permanently out of scope, on reputational, ethical or privacy grounds. More
capacity does not make any of these a better idea:

- **Job listings, aggregation, search.** Not our competence and not our value.
- **Resume builders, ATS scorers, cover letters, interview-question banks.**
  There is no primary source for what an ATS scores. Anything we shipped here
  would be invented advice with a confident face on it.
- **Naukri, Resdex or LinkedIn automation.** Gets the user shadowbanned or
  blacklisted. The harm lands on them, not on us.
- **An in-page AI assistant, or any browser-to-LLM call, even with the user's
  own key.** The moment the app can reach a model, the promise that nothing
  leaves the device stops being checkable. Prompt Studio is the sanctioned
  shape: we write the prompt, the user runs it in their own AI, in their own
  account, and pastes the answer back.
- **Multi-offer stalling engines and pretextual negotiation scripts.** We help
  people negotiate honestly. We do not teach them to lie.
- **Salary or personal data in a URL.** Not in a query string, not in a hash,
  not compressed. URLs leak into history, referrers and proxy logs.
- **Market salary bands or percentiles.** There is no permitted source. Bands
  require either crowdsourced payslips, which we will not collect, or a number
  we invented, which we will not ship.

**Say this on the page, not only here.** A visitor who scans for the
getting-hired half and finds nothing cannot tell "refused on principle" from
"not built yet," and marks us down for a choice we made deliberately.

---

## What good feels like

Not delight the way a consumer app means it. This person is doing something
frightening, in secret, about money, on a device they do not own. Good here is
**relief with a number attached** — a competent friend who has done this before,
does not need anything from you, and does not flinch from the bad news.

Eight rules. Each one is checkable against the code.

**1. Answer before you ask.** Every screen shows a real result before it requires
a single field. Sixteen tools already boot on example numbers behind an `Example`
chip. That is the house pattern and it is right. The board breaks it: its first
live interaction is an empty form with two required fields.

**2. Ask only what they know by heart.** Never gate an answer on a field that
needs a document opened. Join date, monthly basic, notice days — all memorised or
one glance at a payslip. Contrast: the tracker will not save a card without a
role, and someone at stage 0 has an employer to escape and no role to apply for.

**3. Every number carries its receipt.** A statutory figure shows its section and
the date it was checked. A conventional figure says it is a convention. We
already do this in code — and the user never sees it. That is backwards.

**4. Bad news first, plainly.** The verdict leads with the number that hurts.
Never a "42% hike!" headline above a 6% in-hand delta.

**5. Closable in one second, and silent when closed.** Design for an interrupted
session on an open-plan floor. Nothing on screen or in browser chrome should
name the job switch to someone glancing over.

**6. Nothing persists unless the user chose persistence.** On a company laptop a
saved file is evidence. Saving is a decision, not a default — and there must
always be a way to erase everything.

**7. One arc, one thread.** A value the user has already typed is never asked for
twice. Today someone types their resignation date into two different tools on
consecutive days of the most stressful week of the switch.

**8. Hindi is the same product, not a translated shell.** Full parity is
test-enforced. The register is code-mixed — *"Courts ने specialised training cost
मांगा है"* — because that is how this audience actually talks about work. A
native-writer pass should keep that, not sanitise it into pure Hindi.

---

## The trust position

The product never sends anything anywhere. No accounts, no analytics, no
backend, no AI calls. That is the strongest thing about it, and it is currently
claimed in a footer, below a page two and a half screens tall, long after the
user has typed a salary.

**Trust belongs at the first money keystroke, not at the bottom.** And it must be
verifiable, not asserted — every data broker also writes "we respect your
privacy." Ours is checkable: no backend, read the source.

### The part we have not been honest about

We tell a frightened user "nothing is uploaded" while writing their salary to a
disk their employer owns. Both halves are true. Only one is said.

Most tools persist to `localStorage`. The home page title names the job switch,
which lands in the tab strip, browser history, bookmarks and most corporate
browsing logs. It is a PWA, so it leaves a service worker and a cache behind.
There is no control anywhere that erases what we have stored.

**This is the only place the product can currently hurt someone.** Fixing it is
one honest sentence at first save, one erase button, and a title that does not
confess. Zero users is the cheapest hour this will ever cost.

---

## "I can just ask ChatGPT this"

The only real user reaction ever recorded — colleagues, informally, reacting to
the tool grid. It deserves an answer, and the answer is not "we are more
accurate."

**Every number here carries a section and the date it was checked.** Ask a
chatbot for the section and it gives you one either way. This product once
shipped a wrong citation and a pass against the primary PDF caught it. That is a
correction a chatbot structurally cannot make, because nothing in it is pinned to
a dated document.

**A chatbot answers the question you asked.** The value in decoding an offer is
not the arithmetic. It is the five questions the form asks that nobody thinks to
type: is employer PF inside the CTC, is gratuity inside it, is PF on full basic
or capped, what is the basic percentage, which state's professional tax. Ask a
chatbot for in-hand on 24 LPA and it answers confidently on assumptions it
invented and did not disclose.

**A chat thread is not a record.** The switch is forty questions across nine
months, each depending on the last. The gratuity date computed in month one and
the F&F checked in month eight have to be the same numbers.

**And where a chatbot is better, say so.** For what to say to your manager, or
researching a company, it genuinely is. Prompt Studio is us handing those off on
purpose. Conceding that is what makes the rest believable.

Put this answer where it is *demonstrated* — a section number under a verdict —
and one positive clause on the home page. **Never build a "Why not ChatGPT?"
section.** Arguing with the objection concedes it, and puts a competitor's name
above the fold on our own page.

---

## The voice

Plain, concrete, unhurried. Short sentences. Name the thing, the number, the
date.

- Say "in-hand", "notice period", "F&F", "relieving letter" — the words the user
  already uses. Keep the English terms in Hindi copy; that is how people say them.
- Never "seamless", "robust", "empower", "unlock", "journey" as a noun in UI copy.
- Never a number without a source, and never a source we have not read.
- Never a rupee figure the page invented. Sample data is labelled as sample.
- Bad news gets the same plain voice as good news, and goes first.

---

## How this file is owned

Kalpit writes it. Agents propose changes in a handoff and never edit it directly,
the same as `ROADMAP.md`.

**If you are about to write a document explaining what this product should be,
stop.** That document is this one. Three earlier strategy documents were deleted
in August 2026 and two more appeared unbidden in September, one declaring itself
authoritative while proposing to reverse decisions only Kalpit makes. Partial
restatements drift, and drifting duplicates once produced three contradicting
roadmaps in a single day.

One home per fact:

| Question | File |
|---|---|
| What is this, who is it for, what does it do at each stage | `PRODUCT.md` |
| What do we build next | `ROADMAP.md` |
| How do agents work here | `AGENTS.md` |
| How does the code work | `docs/ARCHITECTURE.md` |
| What was decided, when, and why | `docs/DECISIONS.md` |
| What do we promise about data | `PRIVACY.md` |
