# ROADMAP — Switch Karle

Kalpit owns this file. Agents may propose edits only as a pull request that
Kalpit merges himself (decided 2026-11-07).

## Settled — do not re-open

These have been decided. Re-opening them wastes time:

- **Domain: `switchkarle.fyi`.** Bought 2026-08-22 on Spaceship, DNS pointed at
  Cloudflare. Nothing to buy, no TLD to choose.
- **The domain is connected.** The site moved to `switchkarle.fyi` on
  2026-10-31 (PR #71).
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

- **The dated-plan front door. A trial, not a settled direction.** Built and
  live since 2026-11-07; what is left is the test below. Three screens: the three questions,
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
- **Kalpit's own review, first.** Decided 2026-11-13. He goes through the
  site himself, start to finish, when he is free. What he finds gets built on
  before anyone else is asked.
- **The ten-person test, round two. Only once Kalpit is happy.** Decided
  2026-11-13; before that this line said to run it the week the door ships.
  The pass mark above is unchanged. *Status 2026-11-13:* the door shipped on
  2026-11-07 and the test has not started.

`docs/DIRECTION.md` is deleted when the trial result is recorded here, whichever
way it goes. Anything in it still worth keeping moves into these lists or into
the pull request that builds it, before it goes.

## Next

- **The tracker accepts a company with no job title.** The one piece of the
  old Phase 1 that did not ship: a card still needs a role, and someone who has
  applied nowhere has none.
- **An archive for closed applications.** Let users mark jobs as rejected,
  ghosted, or withdrawn without deleting the card.
  *Why:* Deleting cards wipes their memory, causing email sweeps to keep
  finding and re-importing rejected jobs.

## Later

- **Native-quality Hindi review.** A native writer reading every Hindi phrase
  on the site.
  *Why:* Current Hindi is an AI-written draft and needs human verification
  before launch.
- **Browser panic switch.** A quick keyboard shortcut that immediately disguises
  the screen as generic office work.
  *Why:* Open-plan offices need instant camouflage when someone walks past.

## Done

Shipped, kept here so they are not proposed again:

- **The ten actions, and the screen you come back to.** Shipped 2026-11-07
  (PR #69). Plan dates fill gratuity, F&F, the letter and the notice tracker
  (PR #89). Built before the trial result, so it stands or falls with it.
- **The tools sit behind their stages.** Every tool has one journey stage
  (PR #87, mapping approved 2026-10-31), ends with a Next link in stage order
  (PR #89), and `/tools/` lists them by stage (PR #97).
- **Say what the site is, on the home page.** The full-switch line is on the
  home page; since 2026-11-07 it sits above "Find the safest day to resign."
- **Link paths fixed before the domain cutover.** `check:base` guards them.
- **Intent words in tool search.** "quit", "in hand", "hike" and Hindi words
  find tools (`src/lib/palette.test.ts`).
- **When an offer goes cold.** The `offer-goes-cold` tool.
- **Surviving the first 90 days.** PF transfer, BGV prep, tax declaration and
  the two-Form-16 shock all ship.

## Waiting on Kalpit

- **His own review of the site**, then the ten-person test once he is happy.
  See Now.
- **CA Review R1.** A chartered accountant answering tax questions in writing.
  *Why:* Statutory tax numbers must come from official sources, never AI
  guesses. No CA has been found yet; the open questions stay marked
  `CANDIDATE` and are listed in `docs/DECISIONS.md` ("Parked").
- **Two Cloudflare settings.** Required checks on `main` and Cloudflare in
  front of the site are on since 2026-11-13. Still to fix: Web Analytics must
  be off, and the `/_astro/` cache rule needs a one-year browser TTL.

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
