/**
 * The callback fixer's server: one Cloudflare Worker on switchkarle.fyi/api/*,
 * in Kalpit's Cloudflare account (PRIVACY.md, "The callback fixer").
 *
 * It takes resume text the page already cleaned, cleans it again, asks one
 * model on Workers AI, checks the answer against the resume, and returns it.
 * It stores nothing: no KV, no database, no file, and no `console.log` of
 * anything the user sent. Workers Logs is switched off in wrangler.toml.
 *
 * Kept free of Cloudflare's type package on purpose: `Env` below names only
 * what this file uses, so `npm run typecheck` covers it with the site.
 */
import { extractJsonObject } from '../lib/extractJsonObject'
import {
  cleanResume,
  guardFacts,
  JOB_POST_MAX_CHARS,
  parseProfileFix,
  resumeProblem,
  ROLE_MAX_CHARS,
  type ProfileFix,
} from '../engine/profileFix'
import { FIX_SYSTEM, fixUserMessage } from '../prompts/profileFix'

export interface Env {
  AI: { run(model: string, input: Record<string, unknown>): Promise<unknown> }
  /** Cloudflare's rate-limit binding; absent in tests that do not need it. */
  LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> }
  /** Which Workers AI model, from wrangler.toml so it can change without code. */
  MODEL?: string
  /** The page's own origin. Requests from anywhere else are refused. */
  ALLOWED_ORIGIN?: string
}

// Qwen3 30B left the Workers AI catalog in November 2026; Gemma 4 26B (A4B) is the plan's other pick.
export const DEFAULT_MODEL = '@cf/google/gemma-4-26b-a4b-it'
export const DEFAULT_ORIGIN = 'https://switchkarle.fyi'
const MAX_BODY_BYTES = 40_000

/** What the page can be told. Ids only; the page words them. */
export type FixError = 'badRequest' | 'tooShort' | 'tooLong' | 'limit' | 'busy' | 'failed' | 'notFound'

export interface FixReply {
  fix: ProfileFix
}

const STATUS: Record<FixError, number> = {
  badRequest: 400,
  tooShort: 400,
  tooLong: 413,
  notFound: 404,
  limit: 429,
  busy: 503,
  failed: 502,
}

const HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
}

const fail = (error: FixError) => new Response(JSON.stringify({ error }), { status: STATUS[error], headers: HEADERS })

/** The model's text, whichever shape this model replies in. */
export function replyText(res: unknown): unknown {
  if (typeof res === 'string') return res
  if (typeof res !== 'object' || res === null) return ''
  const r = res as Record<string, unknown>
  // Workers AI's own shape. An empty `response` falls through to the others.
  if (typeof r.response === 'object' && r.response !== null) return r.response
  if (typeof r.response === 'string' && r.response.trim() !== '') return r.response
  // OpenAI-style, which newer Workers AI models (Gemma 4) answer in.
  const choice = Array.isArray(r.choices) ? (r.choices[0] as Record<string, unknown> | undefined) : undefined
  const message = choice?.message as Record<string, unknown> | undefined
  if (typeof message?.content === 'string' && message.content.trim() !== '') return message.content
  if (typeof choice?.text === 'string') return choice.text
  return typeof r.response === 'string' ? r.response : ''
}

/**
 * Why an answer could not be used, as a fixed word and the reply's top-level
 * keys: never any of the resume or the model's text. Sent back only on failure,
 * so the next fix can be aimed without logs.
 */
export function replyShape(res: unknown): string {
  if (typeof res !== 'object' || res === null) return typeof res
  const r = res as Record<string, unknown>
  const keys = Object.keys(r).slice(0, 8)
  const choice = Array.isArray(r.choices) ? (r.choices[0] as Record<string, unknown> | undefined) : undefined
  const finish = typeof choice?.finish_reason === 'string' ? choice.finish_reason.slice(0, 20) : ''
  return [keys.join(','), finish].filter(Boolean).join(';')
}

/** Text or an already-parsed object, minus any thinking, as JSON. */
export function toJson(reply: unknown): unknown {
  if (typeof reply === 'object' && reply !== null) return reply
  if (typeof reply !== 'string') return null
  const text = reply.replace(/<think>[\s\S]*?<\/think>/gi, '')
  try {
    return JSON.parse(extractJsonObject(text))
  } catch {
    // Thinking or prose with braces of its own: try from each later "{".
    for (let i = text.indexOf('{', 1); i !== -1; i = text.indexOf('{', i + 1)) {
      try {
        return JSON.parse(extractJsonObject(text.slice(i)))
      } catch {
        /* keep looking */
      }
    }
    return null
  }
}

/** Workers AI says the free daily allocation is used up (error 4006). */
function isQuotaError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e)
  return /4006|daily free allocation|neurons/i.test(msg)
}

export async function handleFix(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  if (url.pathname !== '/api/fix') return fail('notFound')
  if (request.method !== 'POST') return fail('notFound')

  // Same-origin only. A browser always sends Origin on a cross-origin POST, and
  // on a same-origin fetch POST too, so a missing or foreign one is not our page.
  if (request.headers.get('origin') !== (env.ALLOWED_ORIGIN ?? DEFAULT_ORIGIN)) return fail('badRequest')

  const declared = Number(request.headers.get('content-length') ?? '0')
  if (declared > MAX_BODY_BYTES) return fail('tooLong')

  if (env.LIMITER) {
    // The address is used as a counter key for this minute and kept nowhere else.
    const key = request.headers.get('cf-connecting-ip') ?? 'unknown'
    const { success } = await env.LIMITER.limit({ key })
    if (!success) return fail('limit')
  }

  let body: Record<string, unknown>
  try {
    const raw = await request.text()
    if (raw.length > MAX_BODY_BYTES) return fail('tooLong')
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return fail('badRequest')
    body = parsed as Record<string, unknown>
  } catch {
    return fail('badRequest')
  }

  if (typeof body.resume !== 'string') return fail('badRequest')
  const role = typeof body.role === 'string' ? body.role.replace(/\s+/g, ' ').trim() : ''
  const jobPost = typeof body.jobPost === 'string' ? body.jobPost.trim() : ''
  if (role.length > ROLE_MAX_CHARS || jobPost.length > JOB_POST_MAX_CHARS) return fail('tooLong')

  // Cleaned again here, so a page that skipped it cannot send more than this allows.
  const resume = cleanResume(body.resume).text
  const problem = resumeProblem(resume)
  if (problem === 'empty' || problem === 'tooShort') return fail('tooShort')
  if (problem === 'tooLong') return fail('tooLong')
  const cleanJob = jobPost ? cleanResume(jobPost).text : ''

  const model = env.MODEL ?? DEFAULT_MODEL
  // Qwen3 thinks out loud unless told not to; the thinking costs tokens we pay for.
  const noThink = model.includes('qwen3') ? '\n\n/no_think' : ''
  const messages = [
    { role: 'system', content: FIX_SYSTEM },
    { role: 'user', content: fixUserMessage({ resume, role, jobPost: cleanJob }) + noThink },
  ]

  // One retry, only when the answer would not parse. Each try costs quota.
  let why = ''
  for (let attempt = 0; attempt < 2; attempt++) {
    let res: unknown
    try {
      res = await env.AI.run(model, {
        messages,
        max_tokens: 2500,
        temperature: attempt === 0 ? 0.3 : 0.1,
        // Gemma 4 and newer Qwen think by default and spent the whole budget on it,
        // leaving an empty answer (live test, 2026-11-28). JSON mode keeps it to the object.
        chat_template_kwargs: { enable_thinking: false },
        response_format: { type: 'json_object' },
      })
    } catch (e) {
      if (isQuotaError(e)) return fail('busy')
      // Cloudflare's own error text (model, binding, limits), not the visitor's.
      return failWhy('threw', (e instanceof Error ? e.message : String(e)).slice(0, 160))
    }
    const text = replyText(res)
    const json = toJson(text)
    const fix = parseProfileFix(json)
    if (fix) {
      const reply: FixReply = { fix: guardFacts(resume, fix, cleanJob).fix }
      return new Response(JSON.stringify(reply), { status: 200, headers: HEADERS })
    }
    const stage = text === '' ? 'empty' : json === null ? 'noJson' : 'shape'
    why = `${stage}:${replyShape(res)}:${typeof text === 'string' ? text.length : 'obj'}`
  }
  return failWhy('failed', why)
}

/** A failure with a short reason that holds nothing the visitor sent. */
function failWhy(stage: string, detail: string) {
  return new Response(JSON.stringify({ error: 'failed', why: `${stage} ${detail}`.slice(0, 200) }), {
    status: STATUS.failed,
    headers: HEADERS,
  })
}
