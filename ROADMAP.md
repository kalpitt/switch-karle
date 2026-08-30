# ROADMAP — Switch Karle

Kalpit owns this file. Agents never edit it: propose changes in a handoff and
he applies them. When he asks "what's next", answer from here.

## Settled — do not re-open

These have been decided. An agent that raises one of them again is wasting his
time, and two of them have already been re-raised more than once.

- **Domain: `switchkarle.fyi`.** Bought 2026-08-22 on Spaceship, DNS pointed at
  Cloudflare. Nothing to buy, no TLD to choose. Do not check availability, do
  not propose `.com` or `.in`.
- **Connecting the domain is deliberately held.** Kalpit cuts over once the
  site is complete, while user count is still zero and the base-path change
  from `/switch-karle/` to `/` costs nothing. It is not a blocker and not a
  pending action. Do not prompt him about it.
- **The cutover is one file.** `site.config.mjs` holds `SITE` and `BASE`;
  `astro.config.mjs` and `scripts/check-base-build.mjs` both import from it.
- **No redirect from `kalpit.me/switch-karle/`.** Owner decision. Old links
  need no preservation.
- **Notes mode is deleted**, not parked in code. The replacement is in Later.
  Reasoning: `docs/ARCHITECTURE.md`.

## Now

- **Stage doorways.** Each tracker card links to the tools that matter at its
  stage; an offer card carries its CTC to the Decoder without a URL.
  [PR #18](https://github.com/kalpitt/switch-karle/pull/18), open.
- **Data safety in the tracker.** `save()` is unguarded, so a full
  `localStorage` throws and loses the write. Import is a destructive replace
  with no merge and no undo. This is the one place the app can currently lose
  a user's work.

## Next

- **Header bloat on mobile.** Roughly 440px sits above the board at 375px. The
  board is the product; it should not open below the fold.
- **Pure ingest core.** Parse a structured job-application dump into tracker
  applications. Pure functions in `src/engine/**` with golden cases, no UI.
- **Sweep prompt and paste panel.** The user runs a prompt in their own AI,
  pastes the result back. Their AI, their send button.
- **Coverage ledger.** Say honestly how much of a mailbox a sweep actually
  found. Measured ceiling today: about 26% at a one-year scope, about 66% at
  one month. Overclaiming here would be worse than shipping nothing.
- **CSP, plus a `check:csp` gate** in the same shape as `check:seo`.

## Later

- **Native-quality Hindi pass.** Every `en.ts` key has a Hindi pair and the
  parity test enforces it, but the Hindi is agent-written draft, never read by
  a native writer. It ships as draft until this happens.
- **Panic switch.** Browser-level trigger, not a control on the page. Covers
  company names and salary figures rather than site branding; restoring takes
  a deliberate act. Replaces Notes mode. Design notes in
  `docs/ARCHITECTURE.md`.

## Waiting on Kalpit

- **CA Review R1.** A real chartered accountant answering in writing. Every
  constant still marked `CANDIDATE` in `docs/ARCHITECTURE.md` waits on it. An
  AI reading tax blogs does not count and never will.

## Not doing

Rejected on reputational, ethical or privacy grounds. More capacity does not
make any of these a better idea.

- Naukri ranking or Resdex bump automation · LinkedIn automation
- Multi-offer stalling engines and pretextual negotiation scripts
- Resume builders, ATS scorers, cover letters, interview-question banks
- Job aggregators, generic AI chatbot wrappers
- Direct browser-to-LLM-API calls, including with the user's own key
- Salary or personal data in a URL hash or query string, compressed or not
- IndexedDB

**Parked, not rejected.** All distribution activity: promotion, Search Console,
sitemap submission, analytics, pSEO, share-card campaigns, backlinks. Unparks
only when Kalpit sets a date. Building so distribution is easy later is
required; doing it is not.
