/**
 * Runs the profile fixer's real Worker code against the real model, through
 * Cloudflare's REST API, with a made-up resume. CI runs it on pull requests that
 * change the fixer, so a model or prompt change is tried before it goes live.
 * Needs CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN; without them it skips.
 * The resume below is invented: nobody's data goes into these logs.
 */
import { handleFix, type Env } from '../src/worker/fix'

const account = process.env.CLOUDFLARE_ACCOUNT_ID
const token = process.env.CLOUDFLARE_API_TOKEN
if (!account || !token) {
  console.log('No Cloudflare secrets: probe skipped.')
  process.exit(0)
}

const RESUME = `Asha Menon
asha.menon@example.com | 98260 12345

Customer Support Team Lead, a BPO in Indore (2021 - 2025)
- Led a team of 14 agents handling escalations for a telecom client.
- Prepared daily MIS reports in Excel for 3 managers.
- Cut average handling time from 7 minutes to 5 minutes by rewriting call scripts.
- Responsible for training new joiners on Freshdesk.

Customer Support Executive, same company (2019 - 2021)
- Handled 60 calls a day with a CSAT of 92%.

Skills: Excel, MIS reporting, Freshdesk, team handling, VLOOKUP, pivot tables
Education: B.Com, Indore (2019)`

const env: Env = {
  ALLOWED_ORIGIN: 'https://switchkarle.fyi',
  MODEL: process.env.MODEL || undefined,
  AI: {
    async run(model: string, input: Record<string, unknown>) {
      const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${model}`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify(input),
      })
      const body = (await res.json()) as { success?: boolean; errors?: unknown; result?: unknown }
      if (!body.success) throw new Error(`${res.status} ${JSON.stringify(body.errors).slice(0, 300)}`)
      return body.result
    },
  },
} as Env

const started = Date.now()
const res = await handleFix(
  new Request('https://switchkarle.fyi/api/fix', {
    method: 'POST',
    headers: { origin: 'https://switchkarle.fyi', 'content-type': 'application/json' },
    body: JSON.stringify({ resume: RESUME, role: '' }),
  }),
  env,
)
const text = await res.text()
console.log(`status ${res.status} in ${Math.round((Date.now() - started) / 1000)} s`)
console.log(JSON.stringify(JSON.parse(text), null, 2))
if (res.status !== 200) process.exit(1)
