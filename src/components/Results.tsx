import type { RedFlag, SalaryBreakdown } from '../engine/types'
import { formatCompact, formatINR, formatLPA } from '../engine/format'
import { translateOrFallback, useLang, useT } from '../i18n'
import { DEFAULT_OFFER } from '../data/defaults'
import { Card, Details, Disclaimer, ExampleNote, ShareRow } from './ui'

export function Results({ b, flags }: { b: SalaryBreakdown; flags: RedFlag[] }) {
  const t = useT()
  const ctcMonthlyIllusion = b.input.ctcAnnual / 12
  const pct = Math.round(b.inHandRatio * 100)
  const realFlagCount = flags.filter((f) => f.severity !== 'info').length
  /** Untouched fixture on first paint = worked example, not the user's data. */
  const isExample = JSON.stringify(b.input) === JSON.stringify(DEFAULT_OFFER)

  return (
    <div className="-order-1 space-y-4 lg:order-none">
      <Card>
        {isExample && (
          <ExampleNote chip={t('results.exampleChip')} note={t('results.exampleNote')} className="mb-3" />
        )}
        <p className="text-[13px] font-semibold text-ink-soft">
          {t('results.headline', { ctc: formatLPA(b.input.ctcAnnual) })}
        </p>
        <p className="tnum mt-1 text-4xl font-extrabold tracking-tight">
          {formatINR(b.inHandMonthly)}
          <span className="text-lg font-semibold text-ink-faint">/month</span>
        </p>
        <p className="mt-1 text-[13px] text-ink-soft">
          {t('results.headlineSub', { amount: formatINR(ctcMonthlyIllusion) })}
        </p>

        <div className="mt-4">
          <div className="h-3 w-full overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-leaf" style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
          <p className="mt-1.5 text-xs font-medium text-ink-soft">
            <span className="font-bold text-leaf">{pct}%</span>{' '}
            {t('results.reaches', { pct, amount: formatCompact(b.inHandMonthly * 12) })}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <RegimePill
            name={t('regime.new')}
            recommended={b.recommendedRegime === 'new'}
            tax={b.newRegime.totalTax}
            inHand={b.inHandMonthlyNew}
          />
          <RegimePill
            name={t('regime.old')}
            recommended={b.recommendedRegime === 'old'}
            tax={b.oldRegime.totalTax}
            inHand={b.inHandMonthlyOld}
          />
        </div>

        <div className="mt-4 space-y-3">
          <ShareRow
            copyText={`${isExample ? `(${t('results.exampleChip')}) ` : ''}${t('results.headline', { ctc: formatLPA(b.input.ctcAnnual) })} ${formatINR(b.inHandMonthly)}/month`}
            copyLabel={t('ui.copy')}
            copiedLabel={t('ui.copied')}
            printLabel={t('ui.print')}
          />
          <p className="text-xs leading-relaxed text-ink-faint">{t('decoder.fixedPayNote')}</p>
          <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-bold">{t('results.whereGoes')}</h3>
        <div className="mt-3 space-y-0.5">
          <Row label={t('results.row.ctcQuoted')} value={b.input.ctcAnnual} strong />
          {b.input.variableAnnual > 0 && <Row label={t('results.row.variable')} value={-b.input.variableAnnual} />}
          {(b.input.esop?.annualValue ?? 0) > 0 && (
            <Row label={t('results.row.esop')} value={-b.input.esop!.annualValue} />
          )}
          {b.input.employerPfInCtc && (
            <Row label={t('results.row.employerPf')} value={-b.employerPfAnnual} />
          )}
          {b.gratuityAnnual > 0 && <Row label={t('results.row.gratuity')} value={-b.gratuityAnnual} />}
          <Row label={t('results.row.grossSalary')} value={b.grossSalary} strong divider />
          <Row
            label={t('results.row.incomeTax', { regime: t(`regime.${b.recommendedRegime}`) })}
            value={-taxOf(b)}
          />
          <Row label={t('results.row.employeePf')} value={-b.employeePfAnnual} />
          {b.professionalTaxAnnual > 0 && (
            <Row
              label={
                b.input.state === 'PB'
                  ? t('results.row.professionalTax.pb')
                  : t('results.row.professionalTax')
              }
              value={-b.professionalTaxAnnual}
            />
          )}
          <Row label={t('results.row.inHand')} value={b.inHandMonthly * 12} strong divider accent />
        </div>
      </Card>

      {flags.length > 0 && (
        <Card>
          <h3 className="text-sm font-bold">
            {t('results.offerCheck')}{' '}
            {realFlagCount > 0 ? (
              <span className="tnum ml-1 rounded-full bg-alarm-soft px-2 py-0.5 text-xs font-bold text-alarm">
                {t('results.flagsBadge', { n: realFlagCount, plural: realFlagCount === 1 ? '' : 's' })}
              </span>
            ) : (
              <span className="ml-1 rounded-full bg-leaf-soft px-2 py-0.5 text-xs font-bold text-leaf">
                {t('results.noAlarming')}
              </span>
            )}
          </h3>
          <div className="mt-3 space-y-3">
            {flags.map((f) => (
              <FlagCard key={f.id} f={f} b={b} />
            ))}
          </div>
        </Card>
      )}

      <Details summary={t('results.howComputed')}>
        <ul className="list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed text-ink-soft">
          <li>{t('results.howComputed.bullet1')}</li>
          <li>{t('results.howComputed.bullet2')}</li>
          <li>{t('results.howComputed.bullet3')}</li>
          <li>{t('results.howComputed.bullet4')}</li>
          <li>{t('results.howComputed.bullet5')}</li>
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
  const t = useT()
  return (
    <div
      className={`rounded-xl border p-3 ${recommended ? 'border-leaf bg-leaf-soft' : 'border-line bg-paper'}`}
    >
      <p className="flex items-center gap-1.5 text-xs font-bold">
        {name}
        {recommended && (
          <span className="rounded-full bg-leaf px-1.5 py-px text-[10px] font-bold text-white">
            {t('results.cheaper')}
          </span>
        )}
      </p>
      <p className="tnum mt-1 text-sm font-bold">{formatINR(inHand)}/mo</p>
      <p className="tnum text-xs text-ink-soft">{t('results.taxPerYear', { amount: formatCompact(tax) })}</p>
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

/**
 * Numbers the engine already baked into its English flag copy, re-exposed as
 * {var}-style interpolation vars so a Hindi override can reproduce them
 * without ever showing a stale or wrong figure.
 */
function flagVars(f: RedFlag, b: SalaryBreakdown): Record<string, string | number> {
  const inr = (n: number) => n.toLocaleString('en-IN')
  const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0)
  switch (f.id) {
    case 'notice-period':
      return { days: b.input.noticePeriodDays }
    case 'bond':
      return { amount: inr(b.input.bond?.amount ?? 0), months: b.input.bond?.months ?? 0 }
    case 'variable-heavy':
      return { percent: pct(b.input.variableAnnual, b.input.ctcAnnual), amount: inr(b.input.variableAnnual) }
    case 'gratuity-in-ctc':
      return { amount: inr(b.gratuityAnnual) }
    case 'employer-pf-in-ctc':
      return { amount: inr(b.employerPfAnnual) }
    case 'joining-bonus-clawback':
      return { amount: inr(b.input.joiningBonus?.amount ?? 0), months: b.input.joiningBonus?.clawbackMonths ?? 0 }
    case 'esop-illiquid':
      return { percent: pct(b.input.esop?.annualValue ?? 0, b.input.ctcAnnual), amount: inr(b.input.esop?.annualValue ?? 0) }
    case 'esop-cliff':
      return { months: b.input.esop?.cliffMonths ?? 0 }
    case 'low-basic':
      return { percent: b.input.basicPercent }
    default:
      return {}
  }
}

function FlagCard({ f, b }: { f: RedFlag; b: SalaryBreakdown }) {
  const t = useT()
  const { lang } = useLang()
  const tone =
    f.severity === 'red'
      ? { bg: 'bg-alarm-soft', border: 'border-alarm/30', chip: 'bg-alarm text-white', word: t('flagChip.red') }
      : f.severity === 'amber'
        ? { bg: 'bg-amberflag-soft', border: 'border-amberflag/30', chip: 'bg-amberflag text-white', word: t('flagChip.amber') }
        : { bg: 'bg-paper', border: 'border-line', chip: 'bg-line text-ink-soft', word: t('flagChip.info') }

  const vars = flagVars(f, b)
  const title = translateOrFallback(lang, `flag.${f.id}.title`, f.title, vars)
  const detail = translateOrFallback(lang, `flag.${f.id}.detail`, f.detail, vars)
  const tip = translateOrFallback(lang, `flag.${f.id}.tip`, f.negotiationTip, vars)

  return (
    <div className={`rounded-xl border ${tone.border} ${tone.bg} p-3.5`}>
      <p className="flex flex-wrap items-center gap-2 text-[13px] font-bold">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wide ${tone.chip}`}>
          {tone.word}
        </span>
        {title}
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{detail}</p>
      <p className="mt-2 rounded-lg bg-white/70 p-2.5 text-[13px] leading-relaxed">
        <span className="font-bold text-saffron">{t('results.sayThis')} </span>
        {tip}
      </p>
    </div>
  )
}
