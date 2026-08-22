# Privacy is the architecture

This is the engineering rule, not marketing copy. It exists so any builder —
human or agent — can test a proposed feature against it without guessing at
intent.

## The rule

> **Who presses send.** No user data reaches any destination Kalpit does not
> personally control, and every transfer is an action the user initiates and
> names the destination of.
>
> **Sanctioned pathways, exhaustively:**
> 1. Pasting engine-generated text into the user's own AI chat tab (BYO-PROMPT).
> 2. The user manually exporting their data.
> 3. The user manually sharing a generated image or text block.
>
> **Any network call the app itself initiates carrying user data is
> prohibited — including to an endpoint keyed with the user's own credential.**

All three sanctioned pathways already ship: `src/prompts/` generates text the
user pastes into their own AI, `src/tracker/store.ts` does JSON export/import,
and `src/components/ShareCard.tsx` renders an image the user chooses to share.

## The test

**Who presses send — the user, in the moment, naming where it goes?** If the
answer is anything else, the feature is prohibited. Not "the user consented
once in settings." Not "the user supplied the API key." Not "we scrub the
personal fields first."

Ask it in this order:

1. Does this cause a network request carrying user data? If no, you are fine.
2. Does the user personally trigger that specific request, knowing its
   destination? If no, **stop — the feature is prohibited.**
3. Is the destination one the user owns or chose? If no, **stop.**

## Prohibited, with the reasoning

- **No backend, no accounts, no server that can read user data.** Not a cost
  decision — money is available and does not buy past this. On-device *is* the
  product's differentiation.
- **No analytics, no telemetry, no third-party scripts.** Including cookieless
  ones, until the owner reopens that decision.
- **No app-initiated AI API calls.** A rejected 2026 proposal had the app call
  an LLM endpoint with the user's own key, running a PII scrubber over the
  payload first — under a heading claiming zero bytes left the device. If
  nothing leaves, you do not need a scrubber. BYO-PROMPT stays the only
  sanctioned AI pattern.
- **No cross-device sync.** Owner decided against it in August 2026. Do not
  reintroduce it, in any form, without him saying so directly.
- **No salary data in URLs.** A URL lands in browser history, in referrer
  headers, and in accidental pastes.

## Why the wording is "who presses send"

The rule used to read "100% client-side, forever." That version could not
answer whether a user manually exporting their own data was allowed — it
clearly is — while also failing to rule out an app-initiated API call dressed
up as a user feature. Naming the *actor* rather than the *architecture* closes
both gaps: local-only storage stays the default, deliberate user-initiated
transfers stay legal, and anything the app decides to send on its own is
prohibited regardless of how it is implemented.

## Storage

Local only. `localStorage`, keyed `switchkarle.<tool>.v<N>`, with JSON
export/import for anything stateful. A shape change means a version bump and a
migration path, never a bare rename.
