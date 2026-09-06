# ROADMAP — Switch Karle

Kalpit owns this file. Agents never edit it: propose changes in a handoff and
he applies them. 

## Settled — do not re-open

These have been decided. Re-opening them wastes time:

- **Domain: `switchkarle.fyi`.** Bought 2026-08-22 on Spaceship, DNS pointed at
  Cloudflare. Nothing to buy, no TLD to choose.
- **Connecting the domain is deliberately held.** Kalpit cuts over once the
  site is complete, while user count is still zero. Do not prompt him about it.
- **No redirect from `kalpit.me/switch-karle/`.** Owner decision. Old links
  need no preservation.
- **Notes mode is deleted**, not parked in code. The replacement is the
  keyboard panic switch in Later.
- **The journey starts at "I'm done here."** Decided to leave, applied nowhere.
  That person is the first user, not an edge case.
- **The site owns the whole switch, not the listings.** You find openings on
  Naukri or LinkedIn. No job boards, resumes, ATS scoring, or interview banks.
- **Raw text stays saved on device with disclosure.** Disclosed in copy; we do
  not upload anything.
- **The erase button is built.** Shipped 2026-09-05 in PR #38, in the footer of
  every page and again in the tracker. Storage also stopped writing a key just
  because a tool was opened.
- **Current-job pay has its own record**, separate from the new offer. Shipped
  2026-09-06 in PR #39: `switchkarle.current-job.v1`, six tools on it. Notice
  buyout, the resignation letter and the notice tracker no longer inherit the
  new offer's CTC.

## Now

- **The dated-plan front door. A trial, not a settled direction.** Phase 0 of
  `docs/DIRECTION.md` and nothing beyond it. Three screens: the three questions,
  then the dates they produce and a resign date to pick, then the dates recap
  with one button that adds them to a calendar. English and Hindi.
  *Why:* three colleagues out of three could not get from "I want to leave" to a
  first action. The home page is a board of example applications at companies
  that do not exist, and someone who has applied nowhere has nothing to put on it.
  *The pass mark, written down before anyone sees it.* Ten people who have said
  in the last six months that they want to leave. No warning about a follow-up.
  A week later, four questions about what already happened. Did the first
  action: 5 of 10. Picked a date: 4 of 10. Kept the dates somewhere, calendar or
  screenshot or sent to someone: 4 of 10. Opened it again: 3 of 10.
  *Miss the first two and stop building.* That is the door failing. Missing
  "opened it again" is a different failure and must not be read as the same one:
  a site with no server cannot reach anyone, and that is a known limit rather
  than evidence the plan was wrong.
  *Miss twice and the door goes to Not doing*, and the premise in `PRODUCT.md`
  is reversed. That is a real outcome, not a formality.
- **The ten-person test, round two.** Run it the week the door ships, not after
  "the site is complete".
- **Say what the site is, on the home page.** Rewrite the tagline to cover the
  full switch ("From 'I'm done here' to surviving notice and day 90") and show
  it on the home page.
  *Why:* First-time visitors currently land on an empty board and cannot tell
  what the site does.
- **Fix link paths before domain cutover.** Clean up subfolder links and build
  checks across 404, manifest, and share cards.
  *Why:* Moving to `switchkarle.fyi` should be a simple, zero-risk switch.

`docs/DIRECTION.md` is deleted when the trial result is recorded here, whichever
way it goes. Anything in it still worth keeping moves into these lists or into
the pull request that builds it, before it goes.

## Next

- **The ten actions, and the screen you come back to.** *After the trial passes.*
  Phase 1 of `docs/DIRECTION.md`: ten actions with tick boxes, split into private
  ones that show straight away and outbound ones that wait for the applying date
  or a tap of "I want to start looking now". The returning-visitor screen. The
  three tools that keep their own join date move onto the shared record. The
  tracker accepts a company with no job title.
  *Why:* the plan is worth little if nothing follows picking a date.
- **The tools move behind their stages.** *After the trial passes.* Phase 2 of
  `docs/DIRECTION.md`: every tool gets exactly one journey stage, the plan shows
  the current stage's tools, and "All tools" keeps the rest and the search. The
  registry's four buckets and the seven stages in `PRODUCT.md` disagree on real
  rows, and reconciling them is Kalpit's call, not an agent's.
  *Why:* the home page stops being a grid.
- **An archive for closed applications.** Let users mark jobs as rejected,
  ghosted, or withdrawn without deleting the card.
  *Why:* Deleting cards wipes their memory, causing email sweeps to keep
  finding and re-importing rejected jobs.
- **Intent words in tool search.** Make search find tools when users type
  common words like "job", "quit", "hike", or "in-hand".
  *Why:* Typing "quit" or "in hand" currently returns zero results.
- **Notice period fear guide: when an offer goes cold.** Practical advice and
  a prompt template for when a hiring company goes quiet forty days into notice.
  *Why:* An offer disappearing while you have already resigned is the worst fear
  in the whole switch.

## Later

- **Native-quality Hindi review.** A native writer reading every Hindi phrase
  on the site.
  *Why:* Current Hindi is an AI-written draft and needs human verification
  before launch.
- **Browser panic switch.** A quick keyboard shortcut that immediately disguises
  the screen as generic office work.
  *Why:* Open-plan offices need instant camouflage when someone walks past.
- **Surviving the first 90 days.** Tools to handle PF transfer, background
  checks, and the tax shock from two Form-16s.
  *Why:* The switch does not end when you accept the offer; it ends when your
  first tax filing and PF transfer clear.

## Waiting on Kalpit

- **CA Review R1.** A chartered accountant answering tax questions in writing.
  *Why:* Statutory tax numbers must come from official sources, never AI
  guesses.

## Not doing

Permanently rejected on reputational, ethical, or privacy grounds:

- Job listings, aggregation, search · Naukri Resdex or LinkedIn automation
- Resume builders, ATS scorers, cover letters, interview-question banks
- Multi-offer stalling engines and pretextual negotiation scripts
- Generic AI chatbot wrapper, or direct browser-to-LLM-API calls
- Salary or personal data in a URL hash or query string
- IndexedDB
- **A one-tap Google Calendar template link.** It is genuinely better than a
  downloaded file, and it sends the user's dates to Google before they have
  chosen anything. That fails the test in `PRIVACY.md`. Written down so it is
  not proposed again as an obvious improvement.
- **A save-as-picture control.** A screenshot already counts as keeping the
  dates, and a second way to keep them dilutes what the trial's third question
  measures.

**Parked, not rejected.** All promotion, analytics, SEO submission, and
marketing. Unparks only when Kalpit sets a date.
