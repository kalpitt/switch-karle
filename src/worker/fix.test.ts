import { describe, expect, it, vi } from 'vitest'
import { handleFix, replyText, toJson, type Env } from './fix'

const RESUME = `Priya Nair
priya@example.com | 9876543210

Customer Support Team Lead, a BPO in Indore (2021 - 2025)
- Handled escalations for a telecom client.
- Prepared daily MIS reports in Excel for 3 managers.
- Trained new joiners on the ticketing tool.

Skills: Excel, MIS reporting, Freshdesk, team handling`

const ANSWER = {
  roles: [{ title: 'MIS Analyst', fit: 'strong', why: 'Daily MIS reports in Excel.' }],
  role: 'MIS Analyst',
  naukriHeadline: 'MIS Analyst | Excel, MIS reporting | Daily reports for 3 managers',
  linkedinHeadline: 'MIS Analyst | Excel reporting for a telecom support team',
  skills: ['Excel', 'MIS reporting', 'Power BI'],
  worthShowing: [],
  bullets: [
    {
      before: 'Prepared daily MIS reports in Excel for 3 managers.',
      after: 'Built daily Excel MIS reports that 3 managers used to plan staffing.',
      hint: '',
    },
  ],
  gap: 'MIS roles ask for SQL; your resume does not show it.',
  missing: ['How many tickets did your team handle a day?'],
}

function env(run: Env['AI']['run'], extra: Partial<Env> = {}): Env {
  return { AI: { run }, ...extra }
}

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://switchkarle.fyi/api/fix', {
    method: 'POST',
    headers: { origin: 'https://switchkarle.fyi', 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

describe('handleFix', () => {
  it('cleans the resume again before it reaches the model, and returns a guarded fix', async () => {
    const run = vi.fn(async () => ({ response: JSON.stringify(ANSWER) }))
    const res = await handleFix(post({ resume: RESUME, role: '' }), env(run))
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toBe('no-store')

    const sent = JSON.stringify(run.mock.calls[0])
    expect(sent).not.toContain('Priya Nair')
    expect(sent).not.toContain('priya@example.com')
    expect(sent).not.toContain('9876543210')
    expect(sent).toContain('Prepared daily MIS reports in Excel for 3 managers.')

    const { fix } = (await res.json()) as { fix: typeof ANSWER }
    expect(fix.skills).toEqual(['Excel', 'MIS reporting'])
    expect(fix.worthShowing).toEqual(['Power BI'])
    expect(fix.bullets[0]!.after).toBe('Built daily Excel MIS reports that 3 managers used to plan staffing.')
  })

  it('asks Qwen3 not to think out loud', async () => {
    const run = vi.fn(async (_model: string, _input: Record<string, unknown>) => ({ response: JSON.stringify(ANSWER) }))
    await handleFix(post({ resume: RESUME }), env(run, { MODEL: '@cf/qwen/qwen3.8-27b' }))
    const input = run.mock.calls[0]![1] as unknown as { messages: { content: string }[] }
    expect(input.messages[1]!.content.endsWith('/no_think')).toBe(true)
  })

  it('sends the default model no Qwen-only tag', async () => {
    const run = vi.fn(async (_model: string, _input: Record<string, unknown>) => ({ response: JSON.stringify(ANSWER) }))
    await handleFix(post({ resume: RESUME }), env(run))
    expect(run.mock.calls[0]![0]).toBe('@cf/google/gemma-4-26b-a4b-it')
    const input = run.mock.calls[0]![1] as unknown as { messages: { content: string }[] }
    expect(input.messages[1]!.content).not.toContain('/no_think')
    expect(input).toMatchObject({ chat_template_kwargs: { enable_thinking: false }, response_format: { type: 'json_object' } })
  })

  it('refuses another origin, a GET and other paths', async () => {
    const run = vi.fn()
    expect((await handleFix(post({ resume: RESUME }, { origin: 'https://evil.example' }), env(run))).status).toBe(400)
    expect((await handleFix(new Request('https://switchkarle.fyi/api/fix'), env(run))).status).toBe(404)
    expect((await handleFix(new Request('https://switchkarle.fyi/api/other', { method: 'POST' }), env(run))).status).toBe(404)
    expect(run).not.toHaveBeenCalled()
  })

  it('refuses bad JSON, a missing resume, and text too short or too long', async () => {
    const run = vi.fn()
    const status = async (b: unknown) => (await handleFix(post(b), env(run))).status
    expect(await status('{not json')).toBe(400)
    expect(await status({ role: 'x' })).toBe(400)
    expect(await status({ resume: 'Analyst, five years.' })).toBe(400)
    expect(await status({ resume: 'a '.repeat(7000) })).toBe(413)
    expect(await status({ resume: RESUME, role: 'x'.repeat(81) })).toBe(413)
    expect(run).not.toHaveBeenCalled()
  })

  it('says limit when the visitor is over the rate limit', async () => {
    const run = vi.fn()
    const res = await handleFix(post({ resume: RESUME }), env(run, { LIMITER: { limit: async () => ({ success: false }) } }))
    expect(res.status).toBe(429)
    expect(await res.json()).toEqual({ error: 'limit' })
    expect(run).not.toHaveBeenCalled()
  })

  it('says busy when the free daily quota is used up', async () => {
    const run = vi.fn(async () => {
      throw new Error('4006: you have used up your daily free allocation of 10,000 neurons')
    })
    const res = await handleFix(post({ resume: RESUME }), env(run))
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ error: 'busy' })
  })

  it('retries once when the answer will not parse, then gives up', async () => {
    const run = vi.fn(async () => ({ response: 'Sorry, I cannot help with that.' }))
    const res = await handleFix(post({ resume: RESUME }), env(run))
    expect(res.status).toBe(502)
    expect(run).toHaveBeenCalledTimes(2)
  })

  it('uses the second try when the first will not parse', async () => {
    const run = vi
      .fn()
      .mockResolvedValueOnce({ response: 'no json here' })
      .mockResolvedValueOnce({ response: '```json\n' + JSON.stringify(ANSWER) + '\n```' })
    const res = await handleFix(post({ resume: RESUME }), env(run))
    expect(res.status).toBe(200)
  })
})

describe('reading the model reply', () => {
  it('handles a plain response, a parsed object and OpenAI-style choices', () => {
    expect(replyText({ response: 'x' })).toBe('x')
    expect(replyText({ response: { a: 1 } })).toEqual({ a: 1 })
    expect(replyText({ choices: [{ message: { content: 'y' } }] })).toBe('y')
    expect(replyText(42)).toBe('')
  })

  it('drops a think block and prose around the JSON', () => {
    expect(toJson('<think>hmm {not}</think>Here you go: {"a":1} done')).toEqual({ a: 1 })
    expect(toJson('nothing')).toBeNull()
  })
})

describe('when the answer cannot be used', () => {
  it('reads a Gemma-style choices reply when response is empty', () => {
    expect(replyText({ response: '', choices: [{ message: { content: '{"a":1}' } }] })).toBe('{"a":1}')
  })

  it('finds the JSON after thinking that has braces of its own', () => {
    expect(toJson('Plan: {roles, bullets} first.\n{"a":1}')).toEqual({ a: 1 })
  })

  it('says why, with no resume text in the reason', async () => {
    const run = vi.fn(async () => ({ choices: [{ message: { content: 'Prepared daily MIS reports' }, finish_reason: 'length' }] }))
    const res = await handleFix(post({ resume: RESUME }), env(run))
    const body = (await res.json()) as { error: string; why: string }
    expect(res.status).toBe(502)
    expect(body.why).toMatch(/^failed noJson:choices;length:/)
    expect(body.why).not.toContain('MIS')
  })
})
