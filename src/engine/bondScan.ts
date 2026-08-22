export type BondFlagId =
  | 'original-certificates'
  | 'post-exit-noncompete'
  | 'training-bond'
  | 'liquidated-damages'
  | 'probation-extend'

export interface BondFlag {
  id: BondFlagId
  severity: 'red' | 'amber'
}

interface Rule {
  id: BondFlagId
  severity: 'red' | 'amber'
  test: (text: string) => boolean
}

const RULES: Rule[] = [
  {
    id: 'original-certificates',
    severity: 'red',
    test: (t) =>
      /original\s+(?:degree|certificates?|mark\s*sheets?)/i.test(t) &&
      /(?:deposit|submit|surrender|retain|withhold|keep)/i.test(t),
  },
  {
    id: 'post-exit-noncompete',
    severity: 'red',
    test: (t) =>
      /(?:after\s+(?:leaving|cessation|resignation)|post[\s-]?employment)/i.test(t) &&
      /(?:not\s+(?:join|work\s+with|take\s+up)|non[\s-]?compete|restrain)/i.test(t),
  },
  {
    id: 'training-bond',
    severity: 'amber',
    test: (t) => /(?:service\s+bond|training\s+bond|bond\s+amount|liquidated\s+damages.{0,40}train)/i.test(t),
  },
  {
    id: 'liquidated-damages',
    severity: 'amber',
    test: (t) => /liquidated\s+damages/i.test(t) || /penalty\s+of\s+(?:rs\.?|₹)/i.test(t),
  },
  {
    id: 'probation-extend',
    severity: 'amber',
    test: (t) => /probation/i.test(t) && /(?:extend|at\s+the\s+(?:sole\s+)?discretion)/i.test(t),
  },
]

/**
 * Scan pasted appointment-letter text for bond / restraint patterns.
 *
 * CANDIDATE / not a holding: Indian courts have treated (i) s.74 liquidated
 * damages as a ceiling that needs proof of actual loss (*Kailash Nath
 * Associates v. DDA*), and (ii) training-bond recoveries as requiring
 * specialised training cost, not ordinary onboarding (*Sicpa India v. Manas
 * Pratim Deb*). Case law is fact-specific. This scanner is a packing list,
 * not legal advice. Retaining original degrees is widely treated as unlawful
 * restraint — still not a substitute for a lawyer.
 */
export function scanBondClause(offerText: string): BondFlag[] {
  const text = offerText.trim()
  if (!text) return []
  return RULES.filter((r) => r.test(text)).map((r) => ({ id: r.id, severity: r.severity }))
}
