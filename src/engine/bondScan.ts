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
 * Associates v. DDA*), and (ii) a training bond's fixed sum as recoverable
 * only for real training and proved loss (*Sicpa India v. Manas Pratim Deb*).
 * Case law is fact-specific. This scanner is a packing list, not legal
 * advice. Retaining original degrees is widely treated as unlawful restraint
 * — still not a substitute for a lawyer.
 *
 * Citations checked 2026-10-24 against the judgment texts (Indian Kanoon
 * mirror):
 * - Kailash Nath Associates v. DDA, Supreme Court, 9 Jan 2015, (2015) 4 SCC
 *   136 (R.F. Nariman, J.), para 43: the named sum is "the upper limit";
 *   "damage or loss caused is a sine qua non for the applicability of the
 *   Section"; where loss can be proved "such proof is not dispensed with",
 *   and only where it is "difficult or impossible to prove" may a genuine
 *   pre-estimate be awarded. https://indiankanoon.org/doc/70828540/
 * - Sicpa India Ltd v. Manas Pratim Deb, Delhi High Court, RFA No. 596/2002,
 *   17 Nov 2011 (Valmiki J. Mehta, J.): liquidated damages "in the nature of
 *   penalty" are "only the upper limit of damages which are awarded once
 *   actual damages are proved"; on the facts "there was no training which was
 *   imparted" — the trips were commercial. The trial court dismissed the
 *   employer's suit for ₹3,95,170 on two ₹2,00,000 bonds, letting it only
 *   adjust the ₹44,330 it owed the employee; the High Court dismissed the
 *   appeal.
 *   It does NOT draw a line between specialised training and onboarding; the
 *   earlier wording here said it did. https://indiankanoon.org/doc/116592600/
 * Still lawyer territory: these are one Supreme Court and one single-judge
 * High Court decision, and later cases were not surveyed.
 */
export function scanBondClause(offerText: string): BondFlag[] {
  const text = offerText.trim()
  if (!text) return []
  return RULES.filter((r) => r.test(text)).map((r) => ({ id: r.id, severity: r.severity }))
}
