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
- **No human CA review.** Decided 2026-11-28: an AI specialist review against
  primary sources (Acts, Rules, notifications, judgments) closed the CA
  questions. Every number still traces to a primary source; a point the law
  leaves open says so on the site. See `docs/DECISIONS.md` 2026-11-28.
- **Notes mode is deleted**, not parked in code. The replacement is the
  keyboard panic switch in Later.
- **The journey starts at "I'm done here."** Decided to leave, applied nowhere.
  That person is the first user, not an edge case.
- **The site owns the whole switch, not the listings.** You find openings on
  Naukri or LinkedIn. No job boards, resume builders, ATS scoring, or interview
  banks. (Since 2026-11-26 the callback fixer rewrites the user's own profile
  lines; see Now.)
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

- **The callback fixer.** Decided 2026-11-26. One page, one job: paste or
  upload a resume, optionally name a role, and get the roles it fits best, a
  Naukri and a LinkedIn headline, skills to add, the top three bullets
  rewritten and the biggest gap. Only facts already in the resume; anything
  missing is flagged, never invented. Contact details are removed on the device
  before the text goes to our own server (Kalpit's Cloudflare account, Workers
  AI free plan), which stores nothing. Optional after the result: match one job
  post, a "when can you join?" answer for any notice period or for someone laid
  off, a referral message, and a WhatsApp share of the link.
  *Why:* people get stuck in the middle of the search, with no recruiter calls
  and momentum gone by week two, not at the exit where most tools sit.
  *Before launch:* on ten resumes Kalpit already fixed by hand, ours is at least
  as good as plain ChatGPT on 7 and invents nothing on all 10.
  *Then:* 15 to 20 people Kalpit knows, at least 5 of them friends of friends.
  Day 3: did you update Naukri? Day 14: recruiter calls, against the two weeks
  before. No email sign-up and no counters.
- **A front door that says what the site is and asks which step you are at.**
  Decided 2026-11-16, after the first cold viewing of the site. A new home
  page, five step pages, the plan on its own page, all tools regrouped under
  the five steps, plain names. The plan is moved, not removed: it is the first
  tool for someone thinking of leaving.
  *Why:* the first person shown the site cold could not tell what it was, and
  four reviewers who knew only its name read the home page as a resign-date
  calculator.
  *The pass mark, written down before anyone sees it.* Reviewers who know only
  the site's name see the first phone screen. 7 of 8 can say what the site is,
  and every reviewer who is at a step taps the card for that step. Then people
  Kalpit has told nothing: they can say what it is and which they would tap.
  *Status 2026-11-16:* a mock-up of the home page passed with 8 of 8
  reviewers. Nothing is built yet.
- **Kalpit's own review, first.** Decided 2026-11-13. He goes through the
  site himself, start to finish, when he is free. What he finds gets built on
  before anyone else is asked.
- **The ten-person test. Only once Kalpit is happy, and run on the new front
  door.** Decided 2026-11-13; rewritten 2026-11-16 when the plan stopped being
  the home page. Ten people who have said in the last six months that they
  want to leave. No warning about a follow-up. A week later, four questions
  about what already happened. Did the first action: 5 of 10. Picked a date:
  4 of 10. Kept the dates somewhere, calendar or screenshot or sent to
  someone: 4 of 10. Opened it again: 3 of 10.
  *Miss the first two and stop building.* Missing "opened it again" is a
  different failure and must not be read as the same one: a site with no
  server cannot reach anyone, and that is a known limit.
  *Status 2026-11-16:* not started. The plan was live as the home page from
  2026-11-07 to the rebuild and was never put to the ten.

## Next

- **A list of companies that hire people on a long notice period.** Its own
  page, separate from the fixer, each entry backed by a dated public source
  (a job post or careers page) and re-checked every six months. Nothing
  negative about a named company.
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
- **Say what the site is, on the home page.** Reopened 2026-11-16, see Now.
  The line shipped on 2026-11-07 sat above "Find the safest day to resign",
  and no reviewer who came to the site cold understood from it what the site
  was.
- **Link paths fixed before the domain cutover.** `check:base` guards them.
- **Intent words in tool search.** "quit", "in hand", "hike" and Hindi words
  find tools (`src/lib/palette.test.ts`).
- **When an offer goes cold.** The `offer-goes-cold` tool.
- **Surviving the first 90 days.** PF transfer, BGV prep, tax declaration and
  the two-Form-16 shock all ship.

## Waiting on Kalpit

- **His own review of the site**, then the ten-person test once he is happy.
  See Now.
- **Two Cloudflare settings.** Required checks on `main` and Cloudflare in
  front of the site are on since 2026-11-13. Still to fix: Web Analytics must
  be off, and the `/_astro/` cache rule needs a one-year browser TTL.

## Not doing

Permanently rejected on reputational, ethical, or privacy grounds:

- Job listings, aggregation, search · Naukri Resdex or LinkedIn automation
- Resume builders, ATS scorers, cover letters, interview-question banks (the
  callback fixer edits the user's own lines and gives no score)
- Multi-offer stalling engines and pretextual negotiation scripts
- Generic AI chatbot wrapper, or direct browser-to-LLM-API calls (the callback
  fixer calls our own server, never a provider from the browser)
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
