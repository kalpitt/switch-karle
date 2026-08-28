import { EPFO_MEMBER_PORTAL } from '../engine/epf'

/**
 * CANDIDATE: mirrors epf.ts's primary-source-pending 5-year claim
 * (recollection Fourth Schedule continuous service; s.192A / s.392(7)).
 * JSON-LD is the highest-authority surface for this sentence — keep it
 * hedged the same way as the engine. Q2 is portal behaviour, not a statute.
 */
export function epfFaqJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Should I withdraw my EPF when I switch jobs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Usually no. File an online Form 13 transfer to the new employer. A cash withdrawal before five years of continuous service can be a taxable premature withdrawal. Switch Karle does not invent a TDS rupee — confirm with a CA.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why is my PF transfer stuck?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The usual blockers are an unmarked date of exit on the old establishment, or a name/date-of-birth mismatch versus Aadhaar. Ask old HR to mark the date of exit, fix KYC, then retry on the member portal: ${EPFO_MEMBER_PORTAL}`,
        },
      },
    ],
  }
}
