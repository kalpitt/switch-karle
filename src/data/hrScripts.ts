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
  body: string
}

export const HR_SCRIPTS: Record<HrScriptSlug, HrScript> = {
  'expected-ctc': {
    slug: 'expected-ctc',
    titleKey: 'hr.expected-ctc.title',
    descKey: 'hr.expected-ctc.desc',
    seoTitle: 'Expected CTC script',
    seoDescription: 'A copy-paste reply when a recruiter asks for your expected CTC. Stays on this device.',
    body: `Thank you for the conversation.

I'm looking at this role on total compensation and the work, not a single CTC number. For a similar scope in this city my current range is [current CTC] and I would look for a meaningful step-up on in-hand, not only on the headline.

If you can share the band for this level, I can tell you quickly whether we are in range. Happy to talk through structure (fixed vs variable, notice, joining bonus) once the band is on the table.`,
  },
  'early-release': {
    slug: 'early-release',
    titleKey: 'hr.early-release.title',
    descKey: 'hr.early-release.desc',
    seoTitle: 'Early release script',
    seoDescription: 'Ask your current employer to shorten notice. Copy, then send from your own mail.',
    body: `Hi [Manager name],

I have shared my resignation dated [date], with last working day [LWD] as per my notice.

The new employer has asked if an earlier joining date is possible. I will complete a written handover and be available for questions after I leave. Could we look at an early release or a buyout of the remaining notice so my last day can be [proposed LWD]?

I will follow whatever the appointment letter allows. Thank you for considering it.`,
  },
  'buyout-ask': {
    slug: 'buyout-ask',
    titleKey: 'hr.buyout-ask.title',
    descKey: 'hr.buyout-ask.desc',
    seoTitle: 'Notice buyout ask',
    seoDescription: 'Ask HR whether unserved notice can be bought out, and on what basis.',
    body: `Hi [HR name],

Could you confirm how notice buyout works in my letter — is it on basic or on gross, and is the divisor 30 days?

I am hoping to make [proposed last day] my last working day. If buyout is allowed, please share the amount and whether it will be recovered from F&F or paid by me before relieving.

I will complete the handover either way.`,
  },
  'decline-accepted': {
    slug: 'decline-accepted',
    titleKey: 'hr.decline-accepted.title',
    descKey: 'hr.decline-accepted.desc',
    seoTitle: 'Decline after accepting',
    seoDescription: 'A careful decline after you already said yes. Not legal advice.',
    body: `Hi [Recruiter / HR name],

Thank you again for the offer for [role] at [company]. After thinking it through with my family, I need to withdraw my acceptance. This is not a negotiation — I will not be joining.

I am sorry for the disruption. I have not signed a delayed joining bond, and I have not collected any joining bonus. Please treat this mail as my formal decline.

I appreciate the time you spent, and I wish the team well.`,
  },
  'counter-offer-reply': {
    slug: 'counter-offer-reply',
    titleKey: 'hr.counter-offer-reply.title',
    descKey: 'hr.counter-offer-reply.desc',
    seoTitle: 'Counter-offer reply',
    seoDescription: 'Reply to a counter-offer from your current employer — accept or decline, in writing.',
    body: `Hi [Manager name],

Thank you for the counter-offer and for making time to talk.

I have thought about the rupee gap and about the work itself. I am going to go ahead with the new role. This is not a tactic to raise the counter.

I will keep the handover clean and stick to the notice we agreed. Thank you for the years here — I am leaving on good terms and I hope we stay in touch.`,
  },
  'recruiter-followup': {
    slug: 'recruiter-followup',
    titleKey: 'hr.recruiter-followup.title',
    descKey: 'hr.recruiter-followup.desc',
    seoTitle: 'Recruiter follow-up',
    seoDescription: 'A short follow-up after an interview or a promised offer timeline.',
    body: `Hi [Name],

Checking in on [role] at [company], as discussed on [date]. I remain interested and can share any extra document you need.

If the timeline has moved, a one-line update helps me plan notice with my current employer. Thank you.`,
  },
}

export function isHrScriptSlug(slug: string): slug is HrScriptSlug {
  return (HR_SCRIPT_SLUGS as readonly string[]).includes(slug)
}
