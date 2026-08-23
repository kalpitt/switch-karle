export const HR_SCRIPT_SLUGS = [
  'expected-ctc',
  'early-release',
  'buyout-ask',
  'decline-accepted',
  'counter-offer-reply',
  'recruiter-followup',
] as const

export type HrScriptSlug = (typeof HR_SCRIPT_SLUGS)[number]

export interface HrScript {
  slug: HrScriptSlug
  titleKey: string
  descKey: string
  seoTitle: string
  seoDescription: string
  /**
   * Unused since slice 4.3/audit: bodies render from i18n keys
   * `hr.<slug>.body` (en.ts + hi-suite.ts) so /hi/ pages get real letters.
   * Kept as an empty field only for type compatibility with the registry.
   */
  body: string
}

export const HR_SCRIPTS: Record<HrScriptSlug, HrScript> = {
  'expected-ctc': {
    slug: 'expected-ctc',
    titleKey: 'hr.expected-ctc.title',
    descKey: 'hr.expected-ctc.desc',
    seoTitle: 'Expected CTC script',
    seoDescription: 'A copy-paste reply when a recruiter asks for your expected CTC. Stays on this device.',
    body: '',
  },
  'early-release': {
    slug: 'early-release',
    titleKey: 'hr.early-release.title',
    descKey: 'hr.early-release.desc',
    seoTitle: 'Early release script',
    seoDescription: 'Ask your current employer to shorten notice. Copy, then send from your own mail.',
    body: '',
  },
  'buyout-ask': {
    slug: 'buyout-ask',
    titleKey: 'hr.buyout-ask.title',
    descKey: 'hr.buyout-ask.desc',
    seoTitle: 'Notice buyout ask',
    seoDescription: 'Ask HR whether unserved notice can be bought out, and on what basis.',
    body: '',
  },
  'decline-accepted': {
    slug: 'decline-accepted',
    titleKey: 'hr.decline-accepted.title',
    descKey: 'hr.decline-accepted.desc',
    seoTitle: 'Decline after accepting',
    seoDescription: 'A careful decline after you already said yes. Not legal advice.',
    body: '',
  },
  'counter-offer-reply': {
    slug: 'counter-offer-reply',
    titleKey: 'hr.counter-offer-reply.title',
    descKey: 'hr.counter-offer-reply.desc',
    seoTitle: 'Counter-offer reply',
    seoDescription: 'Reply to a counter-offer from your current employer — accept or decline, in writing.',
    body: '',
  },
  'recruiter-followup': {
    slug: 'recruiter-followup',
    titleKey: 'hr.recruiter-followup.title',
    descKey: 'hr.recruiter-followup.desc',
    seoTitle: 'Recruiter follow-up',
    seoDescription: 'A short follow-up after an interview or a promised offer timeline.',
    body: '',
  },
}

export function isHrScriptSlug(slug: string): slug is HrScriptSlug {
  return (HR_SCRIPT_SLUGS as readonly string[]).includes(slug)
}
