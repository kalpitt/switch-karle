export interface Clause {
  id: string
  category: 'notice' | 'bond' | 'variable' | 'pf' | 'probation'
}

/**
 * Plain-English readings of clauses that show up in Indian appointment letters.
 * Not legal advice; not a substitute for the letter you actually signed.
 */
export const CLAUSES: readonly Clause[] = [
  { id: 'notice-90', category: 'notice' },
  { id: 'notice-buyout', category: 'notice' },
  { id: 'bond-training', category: 'bond' },
  { id: 'variable-discretion', category: 'variable' },
  { id: 'pf-transfer', category: 'pf' },
  { id: 'probation-confirm', category: 'probation' },
]
