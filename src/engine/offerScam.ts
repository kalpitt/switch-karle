export interface OfferScamInput {
  company: string
  emailDomain: string
  offerText: string
}

/**
 * Engines stay React-free and return IDs (+ interpolation values); the island
 * renders prose through i18n so EN and HI stay in lockstep.
 */
export interface ScamFlag {
  id: string
  severity: 'red' | 'amber' | 'info'
  /** Values interpolated into the i18n strings keyed by this flag's id. */
  params?: Record<string, string>
}

interface Rule {
  id: string
  applies: (input: OfferScamInput) => boolean
  build: (input: OfferScamInput) => Omit<ScamFlag, 'id'>
}

const FREE_MAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'rediffmail.com',
  'proton.me',
  'icloud.com',
])

const DEPOSIT_PATTERNS: RegExp[] = [
  /security\s+deposit/i,
  /joining\s+fee/i,
  /training\s+fee/i,
  /pay\s+to\s+receive\s+(?:a\s+)?laptop/i,
  /registration\s+fee/i,
  /refundable\s+deposit/i,
  /equipment\s+deposit/i,
  /laptop\s+deposit/i,
]

const WHATSAPP_PATTERNS: RegExp[] = [
  /(?:only|exclusively)\s+(?:on\s+)?(?:whatsapp|telegram)/i,
  /(?:whatsapp|telegram)\s+only/i,
  /continue\s+(?:the\s+)?(?:conversation|discussion|process)?\s*(?:only\s+)?on\s+whatsapp/i,
  /contact\s+us\s+(?:only\s+)?on\s+whatsapp/i,
  /reach\s+us\s+(?:only\s+)?on\s+(?:whatsapp|telegram)/i,
]

const LOOKALIKE_SUFFIXES = ['careers', 'hr', 'jobs', 'recruitment', 'hiring'] as const
const LEGIT_TLDS = new Set(['com', 'org', 'in', 'net', 'co.in', 'co.uk', 'com.au'])

function normalizeDomain(domain: string): string {
  return domain.trim().toLowerCase().replace(/^@/, '')
}

function companySlug(company: string): string {
  return company.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function equivChar(c: string): string {
  if (c === '0') return 'o'
  if (c === '1') return 'i'
  return c
}

function isDigitLookalike(domainLabel: string, slug: string): boolean {
  const a = domainLabel.replace(/-/g, '')
  if (a.length !== slug.length || a === slug) return false
  for (let i = 0; i < a.length; i++) {
    if (equivChar(a[i]!) !== equivChar(slug[i]!)) return false
  }
  return true
}

function isLookalikeDomain(company: string, domain: string): boolean {
  const slug = companySlug(company)
  if (slug.length < 3) return false

  const normalized = normalizeDomain(domain)
  const labels = normalized.split('.')
  if (labels.length < 2) return false

  const primary = labels[0]!
  const primaryNorm = primary.replace(/-/g, '')

  for (const suffix of LOOKALIKE_SUFFIXES) {
    if (primary.toLowerCase() === `${slug}-${suffix}`) return true
    if (labels.length >= 3 && labels[0]!.toLowerCase() === suffix && companySlug(labels[1]!) === slug) {
      return true
    }
  }

  if (isDigitLookalike(primaryNorm, slug)) return true

  const baseLabel = primary.replace(/-(?:careers|hr|jobs|recruitment|hiring)$/i, '')
  if (companySlug(baseLabel) === slug) {
    const tld = labels.slice(1).join('.')
    if (labels.length === 2 && labels[1] === 'co') return true
    if (tld && !LEGIT_TLDS.has(tld)) return true
  }

  return false
}

const RULES: Rule[] = [
  {
    id: 'deposit-ask',
    applies: (input) => DEPOSIT_PATTERNS.some((p) => p.test(input.offerText)),
    build: () => ({ severity: 'red' }),
  },
  {
    id: 'free-mail',
    applies: (input) => FREE_MAIL_DOMAINS.has(normalizeDomain(input.emailDomain)),
    build: (input) => ({ severity: 'amber', params: { domain: normalizeDomain(input.emailDomain) } }),
  },
  {
    id: 'lookalike-domain',
    applies: (input) => isLookalikeDomain(input.company, input.emailDomain),
    build: (input) => ({
      severity: 'amber',
      params: { company: input.company.trim() || 'the company' },
    }),
  },
  {
    id: 'whatsapp-only',
    applies: (input) => WHATSAPP_PATTERNS.some((p) => p.test(input.offerText)),
    build: () => ({ severity: 'amber' }),
  },
  {
    id: 'epfo-hint',
    applies: () => true,
    build: (input) => ({
      severity: 'info',
      params: { company: input.company.trim() },
    }),
  },
  {
    id: 'mca-hint',
    applies: () => true,
    build: (input) => ({
      severity: 'info',
      params: { company: input.company.trim() },
    }),
  },
]

export function scanOfferScam(input: OfferScamInput): ScamFlag[] {
  const severityOrder = { red: 0, amber: 1, info: 2 }
  return RULES.filter((r) => r.applies(input))
    .map((r) => ({ id: r.id, ...r.build(input) }))
    .sort((x, y) => severityOrder[x.severity] - severityOrder[y.severity])
}

export const OFFER_SCAM_RULE_IDS = RULES.map((r) => r.id)
