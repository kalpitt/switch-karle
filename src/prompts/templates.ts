import type { Application } from '../tracker/types'
import type { RedFlag, SalaryBreakdown } from '../engine/types'
import { formatLPA } from '../engine/format'

/** Everything a template's build() may draw on. All fields optional — every template must degrade gracefully to generic wording when ctx is empty. */
export interface PromptContext {
  app?: Application
  breakdown?: SalaryBreakdown
  flags?: RedFlag[]
}

export interface PromptTemplate {
  id: string
  title: string
  category: 'research' | 'prepare' | 'negotiate' | 'outreach'
  description: string
  build(ctx: PromptContext): string
}

const company = (ctx: PromptContext): string => ctx.app?.company?.trim() || 'the company I\'m targeting'
const role = (ctx: PromptContext): string => ctx.app?.role?.trim() || 'the role I\'m targeting'
const companyCap = (ctx: PromptContext): string => {
  const c = ctx.app?.company?.trim()
  return c || 'This company'
}
const source = (ctx: PromptContext): string => ctx.app?.source?.trim() || 'a source I have not detailed'

function flagsBlock(flags: RedFlag[] | undefined): string {
  if (!flags || flags.length === 0) {
    return '(No specific red flags recorded yet — if I paste offer details later, re-run this with them.)'
  }
  return flags
    .map((f, i) => `${i + 1}. [${f.severity.toUpperCase()}] ${f.title}\n   Why it matters: ${f.detail}\n   My planned angle: ${f.negotiationTip}`)
    .join('\n')
}

export const TEMPLATES: PromptTemplate[] = [
  {
    id: 'company-research',
    title: 'Company due-diligence brief',
    category: 'research',
    description: 'Funding, culture, comp bands, red flags — a structured brief before you go further.',
    build: (ctx) => {
      const c = company(ctx)
      const r = role(ctx)
      return `You are a sharp, skeptical research analyst helping me decide whether to keep pursuing a job at ${c}, for the role of ${r}. Do not cheerlead — I want the unglamorous truth, including reasons to hesitate. Use your knowledge plus any web search you have access to, and be explicit about what's confirmed vs. inferred vs. unknown.

Research and report on:

1. **Financial health & trajectory** — funding stage/rounds if a startup, revenue/profitability signals if public or disclosed, recent layoffs or hiring freezes, runway concerns, any news of down-rounds, restructuring, or leadership departures in the last 18 months.
2. **Attrition & retention signals** — what does average tenure look like for this function? Any patterns in Glassdoor/Blind/LinkedIn reviews about people leaving quickly, or about a specific team/manager churn? Treat single anecdotes with skepticism; look for repeated patterns across multiple independent reviewers.
3. **Engineering/product/functional culture** — from patterns typically seen on Glassdoor, Blind, and LinkedIn for a company like this: pace of work, on-call/weekend expectations, decision-making speed, politics, how promotions actually happen vs. how they're described. Separate "official story" from "what employees actually say."
4. **Compensation bands for this role** — what a ${r} at a company of this profile typically commands, in the style of Levels.fyi-type bands (base, variable, equity/ESOP structure). Call out where India-specific data is thin and you're extrapolating from adjacent markets.
5. **Recent news** — funding announcements, leadership changes, product launches, controversies, layoffs, lawsuits, or anything material from the last 6-12 months.
6. **Interview process reputation** — typical number of rounds, difficulty, how long the process tends to take, and any complaints about ghosting or slow communication.

Output format — a structured brief with these sections in order:
- **TL;DR verdict** (2-3 sentences, does this look worth pursuing)
- **Financial health**
- **Culture signals**
- **Comp reality check**
- **Recent news**
- **Reasons to hesitate** — this section is mandatory even if the company looks great; if you can't find real concerns, say so explicitly rather than inventing filler.
- **Questions I should ask in interviews to probe the gaps above**

Be concrete. Cite the pattern of evidence (e.g. "multiple reviews mention X") rather than a single unverifiable claim, and flag anywhere you are guessing rather than reporting.`
    },
  },
  {
    id: 'jd-deconstruct',
    title: 'JD deconstructor',
    category: 'prepare',
    description: 'Paste the job description — decode hidden expectations, keywords, and seniority signals.',
    build: (ctx) => {
      const c = company(ctx)
      const r = role(ctx)
      return `You are an expert technical recruiter and hiring manager who has read thousands of job descriptions and knows how they're actually written — including the gap between what's listed and what's truly required. I'm going to paste a job description for the role of ${r} at ${c} below. Deconstruct it for me.

[PASTE THE FULL JOB DESCRIPTION HERE]

Once I paste it, analyze it and give me:

1. **Must-have vs. nice-to-have, re-sorted by actual signal strength.** JDs bury the real bar-raisers in a wall of bullet points. Tell me which 3-5 requirements are truly non-negotiable for getting past the first screen, and which are wish-list items nobody will actually gate on.
2. **Hidden expectations the JD doesn't say out loud.** E.g. if it lists "collaborate cross-functionally" that often means "no dedicated PM, you'll do requirements-gathering yourself"; if it says "fast-paced environment" that often means understaffed and reactive. Translate the corporate euphemisms into what day-to-day likely looks like.
3. **Seniority signals.** Does the language, scope, and requirement list suggest this is really a junior/mid/senior role regardless of the title given? Is there a mismatch between the title and the actual scope described (common in India — "Senior" titles that are really mid-level, or vice versa)?
4. **Likely screening keywords.** If this goes through an ATS or recruiter keyword scan, what exact terms and phrases from the JD should appear in my resume and cover note, verbatim, to pass the filter — without me lying about my experience?
5. **What's conspicuously absent.** Anything a JD like this "should" mention but doesn't (team size, reporting line, tech stack specifics, remote/hybrid policy, growth path) — and what that absence might imply.
6. **Questions this JD raises that I should ask the interviewer**, specifically ones that would reveal whether the hidden expectations in #2 are as I suspect, or whether the seniority mismatch in #3 is real. Give me 5-7 pointed but professional questions.

Keep the tone direct and skeptical, like a recruiter friend leveling with me off the record — not the polished tone of the JD itself.`
    },
  },
  {
    id: 'interview-prep',
    title: 'Stage-aware interview prep plan',
    category: 'prepare',
    description: 'Likely rounds, strong-answer outlines, a STAR story bank, and questions to ask back.',
    build: (ctx) => {
      const c = company(ctx)
      const r = role(ctx)
      const stage = ctx.app?.stage
      const stageLine = stage
        ? `I am currently at the "${stage}" stage of this process.`
        : 'I have not started interviews yet, so plan for the full funnel from screen to offer.'
      return `You are an experienced interview coach who has prepped hundreds of candidates for roles like ${r} at companies like ${c}. ${stageLine}

Build me a complete, stage-aware prep plan:

1. **Likely round structure.** Based on how companies like ${c} typically run hiring for a ${r}-level role in India, lay out the probable rounds in order (e.g. recruiter screen, hiring manager round, technical/functional rounds, case/assignment if applicable, culture/values round, final leadership round). Note where these commonly get compressed or reordered.
2. **Per-round question bank with strong-answer outlines.** For each round, give me 4-6 realistic questions, and for each one a bullet-point outline of what a strong answer covers (not a script to memorize — a structure to reason from). Include at least one curveball/stress question per round type and how to handle it calmly.
3. **STAR story bank prompts.** Don't write my stories for me — instead, ask me a set of targeted prompts that will pull out my best STAR (Situation/Task/Action/Result) stories across these themes: a time I drove impact under ambiguity, a conflict I navigated, a failure I owned and what changed after, a time I influenced without authority, and a time I made a hard prioritization call. After I answer each prompt, tighten my raw answer into a crisp STAR narrative under 90 seconds spoken.
4. **Questions to ask back**, organized by round — different questions for a recruiter screen vs. a hiring manager vs. a skip-level, so I sound like I understand the difference in what each interviewer can actually answer.
5. **Red flags to listen for during the interview itself** — evasive answers about attrition, vague answers about scope, or scripted-sounding culture answers.
6. **A day-before and day-of checklist** specific to interviewing for an Indian company/role like this (logistics, dress norms if in-person, how to handle a panel vs. 1:1 format).

Ask me clarifying questions first if you need more on my background before building the STAR prompts — don't assume details you don't have.`
    },
  },
  {
    id: 'negotiation',
    title: 'Negotiation rehearsal',
    category: 'negotiate',
    description: 'Counter-offers, scripts against every red flag, walk-away math, and email drafts.',
    build: (ctx) => {
      const c = company(ctx)
      const r = role(ctx)
      const ctcLine = ctx.app?.ctcDiscussedAnnual
        ? `The CTC discussed so far is ${formatLPA(ctx.app.ctcDiscussedAnnual)}.`
        : 'I have not logged a specific CTC discussed yet — treat the numbers below as illustrative and ask me to fill in real figures before finalizing scripts.'
      const decoderLine = ctx.breakdown
        ? `My own decoder analysis shows the real monthly in-hand is approximately ₹${Math.round(ctx.breakdown.inHandMonthly).toLocaleString('en-IN')}, which is only ${(ctx.breakdown.inHandRatio * 100).toFixed(1)}% of the headline CTC actually reaching my bank account annually. Use this "truth ratio" as ammunition — most candidates anchor on CTC, but I know the real number.`
        : 'I do not have a decoder breakdown of in-hand pay for this offer yet — if I share the CTC structure, compute an approximate truth ratio (in-hand annual / CTC) and use it in the strategy.'
      return `You are a world-class compensation negotiation coach, the kind top candidates hire before a high-stakes offer conversation. I am negotiating an offer for ${r} at ${c}. ${ctcLine} ${decoderLine}

Here are the specific red flags identified in this offer, each with my own planned angle — use these as the raw material for scripts, don't just repeat generic advice:

${flagsBlock(ctx.flags)}

Run a full negotiation rehearsal with me:

1. **Anchor and counter-offer strategy.** Given typical negotiation headroom in the Indian market for a role at this level (usually 10-20% on fixed, more room on joining bonus/sign-on than on base), suggest a specific counter-offer number and how to justify it without sounding arbitrary.
2. **A script for each red flag above**, phrased as things I can actually say out loud — professional, calm, non-confrontational, but not a pushover. Vary the phrasing so it doesn't sound like a checklist when I say it.
3. **Walk-away math.** Help me think through the real threshold: at what point does this offer stop being worth it once I discount variable pay, illiquid ESOPs, and the notice-period/bond friction? Ask me for my current comp and any competing offers if you need them to do this properly, then show the comparison as a simple table of fixed-cash-equivalent value, not headline CTC.
4. **Objection handling.** If the recruiter says "this is our final offer" or "the band doesn't allow more," give me 2-3 credible responses that keep the conversation open without being pushy.
5. **Email drafts.** Write two drafts: (a) a warm, professional email making the counter-offer ask in writing, and (b) a graceful acceptance email assuming the negotiation succeeds, that confirms all agreed terms explicitly (so there's a paper trail of what was promised).
6. **A go/no-go gut check** at the end — if, after this whole exercise, the numbers or the red flags still look bad, say so plainly rather than only optimizing the ask.

Ask me for my current CTC, competing offers, and any constraints (notice period at current job, urgency) before finalizing the walk-away math — don't assume.`
    },
  },
  {
    id: 'outreach',
    title: 'Referral & recruiter outreach',
    category: 'outreach',
    description: 'Short, non-cringe LinkedIn messages — connection note, InMail, and a follow-up.',
    build: (ctx) => {
      const c = company(ctx)
      const r = role(ctx)
      const sourceLine = ctx.app?.source
        ? `The lead came through ${source(ctx)}, so tailor tone accordingly (e.g. warmer if it's a referral thread, more formal/cold if it's a recruiter I haven't spoken to).`
        : 'I have not specified how this lead originated — draft for a cold outreach scenario, and note where the message would change if it were a warm referral instead.'
      return `You are a career coach who is excellent at writing outreach messages that sound like a real person, not a template — no "I hope this message finds you well," no generic flattery, no desperation. I want to reach out about ${r} at ${c}. ${sourceLine}

Write me three messages:

1. **LinkedIn connection request note (≤300 characters, hard limit).** This has to earn a click-accept from a stranger in one or two sentences. Reference something specific and real about ${c} or the role, not generic praise. No "I'd love to connect and learn more" filler.
2. **A LinkedIn InMail / first message after they accept**, 80-120 words, that: opens with one specific, genuine reason I'm interested in ${c} (not flattery — a real observation about the product, team, or work), states clearly and briefly why my background is relevant to ${r}, and makes a low-friction ask (a 15-minute chat, or a referral if appropriate) rather than an open-ended "let me know your thoughts."
3. **A follow-up message for if I don't hear back in 5-7 days** — short, no guilt-tripping, gives them an easy out, and adds one small new piece of information or context rather than just repeating the first message.

Constraints:
- No corporate buzzwords ("synergy," "passionate about," "leverage my skills").
- No em-dashes or overly polished LinkedIn-influencer cadence — should read like a competent human typed it in one sitting.
- Each message should sound distinct from the others, not just longer/shorter versions of the same text.
- If useful, ask me 2-3 questions about my actual background or the specific person I'm messaging so you can make these genuinely personalized rather than generic.`
    },
  },
  {
    id: 'offer-compare',
    title: 'Offer comparison & decision framework',
    category: 'negotiate',
    description: 'Total-comp truth table, risk-adjusted equity, notice friction — forces an actual recommendation.',
    build: (ctx) => {
      const c = companyCap(ctx)
      const r = role(ctx)
      const ctcLine = ctx.app?.ctcDiscussedAnnual
        ? `${c}'s offer for ${r} has a discussed CTC of ${formatLPA(ctx.app.ctcDiscussedAnnual)}.`
        : `I have not logged a specific CTC for ${c}'s offer yet — ask me for it before building the truth table.`
      const noticeLine = ctx.app?.noticePeriodDays
        ? `Notice period on this offer is ${ctx.app.noticePeriodDays} days.`
        : 'I have not logged the notice period for this offer yet — ask me.'
      const flagLine = ctx.flags && ctx.flags.length > 0
        ? `My own red-flag scan on this offer surfaced: ${ctx.flags.map((f) => f.title).join('; ')}. Weight these explicitly in the risk-adjustment.`
        : ''
      return `You are a rigorous, numbers-first decision coach helping me compare a tracked job offer against my current job and/or other offers in play. ${ctcLine} ${noticeLine} ${flagLine}

I will give you the details of each option (current job and any competing offers) — ask me for whatever you need first: base, variable %, ESOP/RSU details and vesting schedule, joining bonus and clawback terms, notice period at each, and any qualitative factors (team, manager, growth ceiling, commute/remote policy).

Once you have the inputs, build:

1. **Total-comp truth table.** Not headline CTC — a table comparing fixed cash, realistic variable payout (assume 70-90% of target unless told otherwise), and equity value, side by side across all options, in ₹ LPA.
2. **Risk-adjusted equity/variable.** Discount illiquid/unlisted ESOPs heavily (explain your discount logic — e.g. near-zero unless there's a recent liquidity event) and haircut variable pay to a realistic expected value rather than the target figure.
3. **Notice-period and bond friction.** Translate notice periods and any bonds/clawbacks into a concrete "cost of leaving" in both time and money for each option, since this affects how much optionality I'm giving up.
4. **Growth factors, scored explicitly.** For each option, rate (with brief justification): scope/title trajectory, skill development relevance to my longer-term goals, and brand/network value — on a simple scale you define, not vague prose.
5. **A single decision table** that lines up money, risk, and growth side by side so I can see the trade-off at a glance, not three separate paragraphs I have to mentally merge.
6. **A forced recommendation with a confidence level.** Don't hedge into "it depends" — give me your actual pick, state your confidence (low/medium/high) and the single factor that would flip your recommendation if it changed.

Ask clarifying questions about my priorities (e.g. how much I weight money vs. growth vs. stability right now) before finalizing the recommendation, since the right answer depends on what season of life I'm in.`
    },
  },
  {
    id: 'offer-extract',
    title: 'Offer letter → Decoder auto-fill',
    category: 'prepare',
    description:
      'Paste your full offer letter — your AI extracts every field the Decoder needs, ready to paste back.',
    build: (ctx) => {
      const c = company(ctx)
      return `You are a meticulous compensation analyst. I will paste my full offer letter / CTC annexure from ${c} below. Your job is to extract EXACTLY the fields my salary-decoder tool needs, without guessing.

[PASTE YOUR FULL OFFER LETTER / ANNEXURE HERE — include the salary structure table and any bond/notice clauses]

Rules:
- Read the entire document, including fine print and annexures, before answering.
- NEVER guess. If a field is not explicitly stated, use null — do not infer "typical" values.
- Money fields are in LAKHS per year (e.g. ₹24,00,000 → 24). Convert monthly figures to annual first.
- "basic_percent_of_fixed" = annual basic ÷ (CTC − variable − ESOP value) × 100, rounded to the nearest integer.
- "employer_pf_in_ctc" is true if the employer's PF contribution appears as a line item inside the CTC/annexure total.
- "gratuity_in_ctc" is true if gratuity appears as a line item inside the CTC total.
- "pf_on_full_basic" is false if PF is capped at ₹1,800/month (₹15,000 wage ceiling), true if 12% of full basic.
- "state_code": the state of the work location, as one of KA MH TN TG AP WB GJ MP KL OD DL HR UP RJ, or null if unclear.

After reading, respond with exactly two things:

1. A short plain-language summary (5-8 lines): the headline CTC, what's really fixed cash, and anything unusual you noticed (bond, clawback, low basic, unusual components).

2. This JSON block, filled in (null for anything not stated), inside a \`\`\`json code fence:

\`\`\`json
{
  "switchkarle_offer": 1,
  "ctc_lpa": null,
  "variable_lpa": null,
  "basic_percent_of_fixed": null,
  "hra_percent_of_basic": null,
  "employer_pf_in_ctc": null,
  "gratuity_in_ctc": null,
  "pf_on_full_basic": null,
  "notice_days": null,
  "bond_amount_lakh": null,
  "bond_months": null,
  "joining_bonus_lakh": null,
  "clawback_months": null,
  "esop_annual_lakh": null,
  "esop_cliff_months": null,
  "esop_listed": null,
  "state_code": null
}
\`\`\`

3. After the JSON, list "ASK HR:" followed by one line per null field — the exact question I should send HR to pin that number down.

The JSON block must be valid JSON (no comments, no trailing commas) — I will paste it into a tool that parses it mechanically.`
    },
  },
]
