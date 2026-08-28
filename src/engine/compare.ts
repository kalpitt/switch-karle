import type { OfferInput, SalaryBreakdown } from './types'
import { decodeOffer } from './salary'

export interface CompareFlags {
  asymmetricGratuity: boolean
  asymmetricEmployerPf: boolean
  asymmetricPfCeiling: boolean
  esopZeroed: boolean
}

export interface CompareResult {
  /** Decode of each offer as quoted (ESOP still visible in the breakdown). */
  breakdowns: SalaryBreakdown[]
  /**
   * Same offers with paper ESOP stripped from CTC so it cannot swing the
   * verdict. Standing symmetric policy — not a valuation of the grant.
   */
  forVerdict: SalaryBreakdown[]
  /** Index of the higher in-hand offer, or null on a tie. */
  verdictIndex: number | null
  flags: CompareFlags
}

function stripEsop(input: OfferInput): OfferInput {
  const esop = input.esop?.annualValue ?? 0
  if (esop <= 0) return { ...input, esop: undefined }
  return {
    ...input,
    ctcAnnual: Math.max(0, input.ctcAnnual - esop),
    esop: undefined,
  }
}

export function compareOffers(offers: OfferInput[]): CompareResult {
  if (offers.length < 2 || offers.length > 3) {
    throw new Error('compareOffers: need 2 or 3 offers')
  }
  const breakdowns = offers.map(decodeOffer)
  const forVerdict = offers.map((o) => decodeOffer(stripEsop(o)))
  const inHands = forVerdict.map((b) => b.inHandMonthly)
  const best = Math.max(...inHands)
  const winners = inHands.map((n, i) => (n === best ? i : -1)).filter((i) => i >= 0)
  const verdictIndex = winners.length === 1 ? winners[0]! : null

  const esopZeroed = offers.some((o) => (o.esop?.annualValue ?? 0) > 0)
  const g = offers.map((o) => o.gratuityInCtc)
  const pf = offers.map((o) => o.employerPfInCtc)
  const ceil = offers.map((o) => o.pfOnFullBasic)

  return {
    breakdowns,
    forVerdict,
    verdictIndex,
    flags: {
      asymmetricGratuity: g.some((v) => v !== g[0]),
      asymmetricEmployerPf: pf.some((v) => v !== pf[0]),
      asymmetricPfCeiling: ceil.some((v) => v !== ceil[0]),
      esopZeroed,
    },
  }
}
