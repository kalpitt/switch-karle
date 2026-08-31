/**
 * The prompt a user runs in their own AI, connected to their own mailbox.
 *
 * Shaped by measured failure modes, not guesswork. The 60-day window matches
 * `ingest`'s default because recall collapses past it. It asks for a list and
 * never a count, because these assistants are documented as unable to count
 * items in a mailbox. It runs several searches because a single sender filter
 * was measured missing roughly a quarter of real applications.
 */
export const SWEEP_PROMPT = `Search my Gmail for job applications I sent in the last 60 days and return them as JSON.

Run each of these searches separately and combine everything they find. Do not stop after the first one.

1. newer_than:60d ("application" AND ("received" OR "submitted" OR "successfully"))
2. newer_than:60d ("thank you for applying" OR "thanks for applying" OR "we received your application")
3. newer_than:60d from:(naukri.com OR linkedin.com OR indeed.com OR iimjobs.com OR instahyre.com OR hirist.com OR cutshort.io OR foundit.in OR wellfound.com)
4. newer_than:60d subject:(interview OR shortlisted OR "next round" OR assessment)
5. newer_than:60d ("your candidature" OR "your profile has been" OR "shortlisted for")

Rules:

- One entry per company and role. A single email may list several roles: create a separate entry for each one.
- Use only what the email actually says. If the role is not stated, leave "role" out. Never guess a role, a date, or a salary.
- "appliedOn" is the date on the email in YYYY-MM-DD form. If you cannot read a date, leave the field out rather than estimating.
- Skip job alerts, newsletters, "jobs you may like" digests, and recruiter cold outreach for roles I never applied to.
- Two different roles at the same company are two entries. Do not collapse them.
- Do not tell me how many you found, do not summarise, and do not add commentary. Return the JSON and nothing else.

Return exactly this shape, where the first entry shows every field and the second shows an entry that only knew the company and the role:

{"version":1,"applications":[{"company":"Finlytix","role":"Senior Backend Engineer","appliedOn":"2026-07-14","source":"Naukri","status":"Application received","ctcDiscussedLPA":32},{"company":"Nivaan Retail","role":"Product Manager"}]}

Leave a field out entirely when you do not have it. Do not include it as an empty string, a zero, or null. "source" is where I applied from, such as Naukri, LinkedIn, a referral, or the company site. "status" is a short phrase taken from the email, such as "Application received" or "Interview scheduled". Include "ctcDiscussedLPA" only when the email states a number in lakhs per annum.`
