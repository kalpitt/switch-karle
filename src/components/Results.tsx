import type { RedFlag, SalaryBreakdown } from '../engine/types'
import { formatCompact, formatINR, formatLPA } from '../engine/format'
import { Card, Details } from './ui'

export function Results({ b, flags }: { b: SalaryBreakdown; flags: RedFlag[] }) {
  const ctcMonthlyIllusion = b.input.ctcAnnual / 12
  const pct = Math.round(b.inHandRatio * 100)

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-[13px] font-semibold text-ink-soft">
          Your {formatLPA(b.input.ctcAnnual)} CTC actually pays
        </p>
        <p className="tnum mt-1 text-4xl font-extrabold tracking-tight">
          {formatINR(b.inHandMonthly)}
          <span className="text-lg font-semibold text-ink-faint">/month</span>
        </p>
        <p className="mt-1 text-[13px] text-ink-soft">
          not the {formatINR(ctcMonthlyIllusion)}/month the CTC number suggests.
        </p>

        <div className="mt-4">
          <div className="h-3 w-full overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-leaf" style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
          <p className="mt-1.5 text-xs font-medium text-ink-soft">
            <span className="font-bold text-leaf">{pct}%</span> of CTC reaches your bank ·{' '}
            {formatCompact(b.inHandMonthly * 12)}/year in hand
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <RegimePill
            name="New regime"
            recommended={b.recommendedRegime === 'new'}
            tax={b.newRegime.totalTax}
            inHand={b.inHandMonthlyNew}
          />
          <RegimePill
            name="Old regime"
            recommended={b.recommendedRegime === 'old'}
            tax={b.oldRegime.totalTax}
            inHand={b.inHandMonthlyOld}
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-bold">Where your CTC goes</h3>
        <div className="mt-3 space-y-0.5">
          <Row label={`CTC as quoted`} value={b.input.ctcAnnual} strong />
          {b.input.variableAnnual > 0 && <Row label="Variable (at risk)" value={-b.input.variableAnnual} />}
          {(b.input.esop?.annualValue ?? 0) > 0 && <Row label="ESOPs (paper)" value={-b.input.esop!.annualValue} />}
          {b.input.employerPfInCtc && <Row label="Employer PF (locked till exit/retirement)" value={-b.employerPfAnnual} />}
          {b.gratuityAnnual > 0 && <Row label="Gratuity (only after 5 years)" value={-b.gratuityAnnual} />}
          <Row label="Cash salary (gross)" value={b.grossSalary} strong divider />
          <Row label={`Income tax (${b.recommendedRegime} regime)`} value={-taxOf(b)} />
          <Row label="Your PF contribution" value={-b.employeePfAnnual} />
          {b.professionalTaxAnnual > 0 && <Row label="Professional tax" value={-b.professionalTaxAnnual} />}
          <Row label="In your bank, per year" value={b.inHandMonthly * 12} strong divider accent />
        </div>
      </Card>

      {flags.length > 0 && (
        <Card>
          <h3 className="text-sm font-bold">
            Offer check{' '}
            {flags.some((f) => f.severity !== 'info') ? (
              <span className="tnum ml-1 rounded-full bg-alarm-soft px-2 py-0.5 text-xs font-bold text-alarm">
                {flags.filter((f) => f.severity !== 'info').length} flag
                {flags.filter((f) => f.severity !== 'info').length === 1 ? '' : 's'}
              </span>
            ) : (
              <span className="ml-1 rounded-full bg-leaf-soft px-2 py-0.5 text-xs font-bold text-leaf">
                ✓ nothing alarming
              </span>
            )}
          </h3>
          <div className="mt-3 space-y-3">
            {flags.map((f) => (
              <FlagCard key={f.id} f={f} />
            ))}
          </div>
        </Card>
      )}

      <Details summary="How we computed this (every number, no magic)">
        <ul className="list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed text-ink-soft">
          <li>
            FY 2026-27 rules. New regime: slabs 0–4L nil rising to 30% above ₹24L, ₹75,000 standard
            deduction, rebate u/s 157 (zero tax to ₹12L taxable, with marginal relief). Old regime:
            ₹50,000 standard deduction, HRA exemption, 80C (your PF auto-counted, capped ₹1.5L), 80D,
            professional tax deduction. 4% cess on both; surcharge above ₹50L.
          </li>
          <li>
            In-hand counts <strong>fixed pay only</strong>. Variable and ESOPs are at-risk money — shown
            separately, never in the monthly figure. Tax on them applies when they actually pay out.
          </li>
          <li>PF: 12% of basic, both sides. Gratuity accrual: 4.81% of basic when in CTC.</li>
          <li>
            Professional tax uses your state's published slab (approximate — municipal notifications
            change it slightly).
          </li>
          <li>
            Everything runs in your browser. Your offer never touches a server.{' '}
            <strong>This is an estimate, not tax advice</strong> — your payroll's exact structure will
            differ a little.
          </li>
        </ul>
      </Details>
    </div>
  )
}

function taxOf(b: SalaryBreakdown) {
  return b.recommendedRegime === 'new' ? b.newRegime.totalTax : b.oldRegime.totalTax
}

function RegimePill({
  name,
  recommended,
  tax,
  inHand,
}: {
  name: string
  recommended: boolean
  tax: number
  inHand: number
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${recommended ? 'border-leaf bg-leaf-soft' : 'border-line bg-paper'}`}
    >
      <p className="flex items-center gap-1.5 text-xs font-bold">
        {name}
        {recommended && (
          <span className="rounded-full bg-leaf px-1.5 py-px text-[10px] font-bold text-white">CHEAPER</span>
        )}
      </p>
      <p className="tnum mt-1 text-sm font-bold">{formatINR(inHand)}/mo</p>
      <p className="tnum text-xs text-ink-soft">tax {formatCompact(tax)}/yr</p>
    </div>
  )
}

function Row({
  label,
  value,
  strong,
  divider,
  accent,
}: {
  label: string
  value: number
  strong?: boolean
  divider?: boolean
  accent?: boolean
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-3 py-1.5 ${divider ? 'border-t border-line' : ''}`}
    >
      <span className={`text-[13px] ${strong ? 'font-bold' : 'text-ink-soft'}`}>{label}</span>
      <span
        className={`tnum text-[13px] ${accent ? 'text-base font-extrabold text-leaf' : strong ? 'font-bold' : value < 0 ? 'text-alarm' : ''}`}
      >
        {value < 0 ? `− ${formatINR(-value)}` : formatINR(value)}
      </span>
    </div>
  )
}

function FlagCard({ f }: { f: RedFlag }) {
  const tone =
    f.severity === 'red'
      ? { bg: 'bg-alarm-soft', border: 'border-alarm/30', chip: 'bg-alarm text-white', word: 'RED FLAG' }
      : f.severity === 'amber'
        ? { bg: 'bg-amberflag-soft', border: 'border-amberflag/30', chip: 'bg-amberflag text-white', word: 'CAUTION' }
        : { bg: 'bg-paper', border: 'border-line', chip: 'bg-line text-ink-soft', word: 'KNOW THIS' }
  return (
    <div className={`rounded-xl border ${tone.border} ${tone.bg} p-3.5`}>
      <p className="flex flex-wrap items-center gap-2 text-[13px] font-bold">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wide ${tone.chip}`}>
          {tone.word}
        </span>
        {f.title}
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{f.detail}</p>
      <p className="mt-2 rounded-lg bg-white/70 p-2.5 text-[13px] leading-relaxed">
        <span className="font-bold text-saffron">Say this: </span>
        {f.negotiationTip}
      </p>
    </div>
  )
}
