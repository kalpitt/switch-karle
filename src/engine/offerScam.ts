export interface OfferScamInput {
  company: string
  emailDomain: string
  offerText: string
}

export interface ScamFlag {
  id: string
  severity: 'red' | 'amber' | 'info'
  title: string
  detail: string
  verificationHint: string
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
  /(?:must|need\s+to|required\s+to)\s+pay/i,
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
const LEGIT_TLDS = new Set(['com', 'org', 'in', 'net', 'co.in'])

const EPFO_URL = 'https://www.epfindia.gov.in/'
const MCA_URL = 'https://www.mca.gov.in/'

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
    build: () => ({
      severity: 'red',
      title: 'Offer asks you to pay money upfront',
      detail:
        'Legitimate employers do not ask candidates to pay security deposits, joining fees, training fees, or laptop deposits before joining. Any upfront payment request is a common job-scam pattern.',
      verificationHint:
        'Do not pay. Ask for a written offer on company letterhead and verify the recruiter through the company’s official careers page or HR contact.',
    }),
  },
  {
    id: 'free-mail',
    applies: (input) => FREE_MAIL_DOMAINS.has(normalizeDomain(input.emailDomain)),
    build: (input) => ({
      severity: 'red',
      title: `Recruiter email uses a free mailbox (${normalizeDomain(input.emailDomain)})`,
      detail:
        'Corporate hiring teams almost always email from their own company domain. Offers sent from Gmail, Yahoo, Outlook, or similar free providers are a strong impersonation signal.',
      verificationHint:
        'Find the company’s official careers email or HR contact on their website and confirm this recruiter is listed there.',
    }),
  },
  {
    id: 'lookalike-domain',
    applies: (input) => isLookalikeDomain(input.company, input.emailDomain),
    build: (input) => ({
      severity: 'amber',
      title: `Email domain may impersonate ${input.company.trim() || 'the company'}`,
      detail:
        'The sender domain looks like a well-known company name with small changes — digit swaps (o→0), hyphenated “-hr/-careers/-jobs” labels, or unusual TLDs such as .co instead of .com.',
      verificationHint:
        'Compare the domain character-by-character with the company’s official website domain before replying or sharing documents.',
    }),
  },
  {
    id: 'whatsapp-only',
    applies: (input) => WHATSAPP_PATTERNS.some((p) => p.test(input.offerText)),
    build: () => ({
      severity: 'amber',
      title: 'Offer wants to move the process to WhatsApp or Telegram only',
      detail:
        'Scammers often push candidates off email onto messaging apps where conversations are harder to verify and document. Real employers still use formal email for offer letters.',
      verificationHint:
        'Insist on continuing over official company email and ask for a verifiable HR contact on the corporate domain.',
    }),
  },
  {
    id: 'epfo-hint',
    applies: () => true,
    build: (input) => ({
      severity: 'info',
      title: 'Check whether the employer is registered with EPFO',
      detail:
        input.company.trim()
          ? `Search EPFO’s establishment register for “${input.company.trim()}” to see if the company has an active PF registration.`
          : 'Search EPFO’s establishment register by company name to see if the employer has an active PF registration.',
      verificationHint: `EPFO member portal: ${EPFO_URL}`,
    }),
  },
  {
    id: 'mca-hint',
    applies: () => true,
    build: (input) => ({
      severity: 'info',
      title: 'Confirm the company exists on MCA records',
      detail:
        input.company.trim()
          ? `Look up “${input.company.trim()}” on the Ministry of Corporate Affairs portal to confirm it is a registered company in India.`
          : 'Look up the company name on the Ministry of Corporate Affairs portal to confirm it is a registered company in India.',
      verificationHint: `MCA company search: ${MCA_URL}`,
    }),
  },
]

export function scanOfferScam(input: OfferScamInput): ScamFlag[] {
  const severityOrder = { red: 0, amber: 1, info: 2 }
  return RULES.filter((r) => r.applies(input))
    .map((r) => ({ id: r.id, ...r.build(input) }))
    .sort((x, y) => severityOrder[x.severity] - severityOrder[y.severity])
}
