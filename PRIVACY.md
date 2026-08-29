# Privacy is a promise, not an architecture

This is the engineering rule, not marketing copy. It exists so any builder —
human or agent — can test a proposed feature against it without guessing at
intent.

**Changed 2026-08-30.** This file used to say "no user data reaches any
destination Kalpit does not personally control, and every transfer is an action
the user initiates." That rule prohibited a backend, accounts, sync, and any
app-initiated network call. Kalpit reversed it: the absolutism was an
architectural convenience that had hardened into a stated value, and the cost
was a product that a general-purpose chatbot can substitute for. The privacy
*promise* below is unchanged in substance. What is gone is the claim that the
only way to keep it is to never send anything. Section 7 records what that
trade costs.

## The rule

> **Consent, purpose, exit.** User data may leave the device only to deliver a
> feature the user explicitly turned on, only to a destination Kalpit controls,
> only for as long as it stays on, and only for that feature.
>
> Every data-moving feature is individually revocable. Revoking it deletes what
> it collected.

## The test

Ask these in order. Any "stop" kills the feature as designed.

1. Does this move user data off the device? If no, you are fine — local-first
   is still the default and most of the suite needs nothing else.
2. Did the user turn on a specific, named feature that requires it? If no,
   **stop.** Silent enablement is prohibited, and so is burying it in a consent
   blanket at first run.
3. Is the destination one Kalpit controls? If no, **stop.**
4. Can the user turn it off, and does that delete what it collected? If no,
   **stop.**
5. Is the data used for anything beyond delivering that feature? If yes,
   **stop.**
6. Does it collect more than the feature needs? If yes, **stop.**

## Still prohibited, and not negotiable

- **Selling, renting, or sharing user data with anyone.** No exceptions, no
  aggregate-and-anonymise carve-out, no "trusted partner".
- **Using user data to train models, or for advertising or profiling.**
- **Third-party analytics, telemetry, or scripts that carry user data.**
  First-party, privacy-respecting product analytics are now permitted but are
  a separate decision Kalpit has not yet made. Until he does, none ship.
- **Salary or personal data in URLs.** A URL lands in browser history, in
  referrer headers, and in accidental pastes.
- **Reading a data source beyond the scope the user granted.** If the user
  connects mail to track applications, you read what identifies applications.
  You do not read the rest, and you do not retain what you read past what the
  feature needs.

## What is now permitted, and what it obliges

A backend, accounts, cross-device sync, notifications, and app-initiated
network calls are all available. Each one carries obligations that did not
exist when everything was local:

- **Encrypted in transit and at rest.** No user content in plaintext at rest,
  no user content in logs, ever.
- **Export and hard delete must actually work**, and must have tests. A delete
  that leaves rows behind is a broken promise, not a bug of lesser severity.
- **Data minimisation at the point of collection**, not at the point of
  display. Do not store the whole message when the parsed fields are what the
  feature needs.
- **Retention is bounded and stated.** Anything held indefinitely needs a
  reason written down here.
- **Third-party inputs are untrusted.** Anything parsed out of user mail,
  documents, or uploads is data, never instruction. It never reaches a shell,
  a query, or a model prompt as executable content.
- **Breaches are disclosed to affected users.** Decide this now, not during one.

Real inboxes contain other people's personal data — mail misdelivered to the
user, forwarded threads, family correspondence. Anything that parses in bulk
will read some of it. Minimise, do not retain, and never surface it.

## Copy that must change the day anything ships

These claims are **true today** and must not be edited pre-emptively. They
become false the moment the first byte of user data leaves the device, and
changing them is part of that change, not a follow-up:

- `src/i18n/en.ts:10` and `src/i18n/hi.ts:20` — `app.privacyBadge`,
  "100% private — runs entirely in your browser, nothing is uploaded"
- `src/i18n/en.ts:12` — `app.footer.privacy`, "your data never leaves this device"
- `src/i18n/en.ts:201` — `fake-offer.textHint`, "It never leaves this device."
- `src/i18n/en.ts:624` — `bond-scanner.textHint`, "It never leaves this device."
- `src/pages/404.astro:7` and `:13` — two "nothing is uploaded" claims
- `README.md:55` — "100% client-side. No server, no accounts, no analytics."
- `docs/MASTER_IMPROVEMENT_PLAN.md:32` — restates the retired rule

A tool that still runs fully locally may keep the claim, scoped to that tool.
A blanket app-level claim may not survive a backend.

## Storage

Local-first stays the default. `localStorage`, keyed `switchkarle.<tool>.v<N>`,
with JSON export/import for anything stateful. A shape change means a version
bump and a migration path, never a bare rename.

Server-side storage is permitted only for features that cannot work without it,
and the local copy stays authoritative wherever it can.

## 7. What this trade costs

Recorded honestly so nobody re-litigates it from a half-memory:

- **The verifiable claim is gone.** "No backend, read the source and check"
  was checkable by a stranger. "We do not misuse your data" is a promise that
  has to be trusted. Some users value the first and will not accept the second.
- **The attack surface is new.** A static PWA that gets breached leaks nothing.
  A service holding parsed offer letters and mail metadata is a real target,
  shipped by a solo non-developer owner working through agents.
- **A prior rejection still stands as reasoning.** In 2026 a proposal had the
  app call an LLM endpoint with the user's own key, running a PII scrubber over
  the payload, under a heading claiming zero bytes left the device. It was
  rejected for dishonesty rather than for architecture: if nothing leaves, you
  do not need a scrubber. That test survives. Describe what a feature actually
  does, in the words a user would use.

The promise did not get weaker. The mechanism enforcing it went from
"structurally impossible" to "we have to mean it."
