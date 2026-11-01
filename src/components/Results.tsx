import type { RedFlag, SalaryBreakdown } from '../engine/types'
import { formatCompact, formatINR, formatLPA } from '../engine/format'
import { translateOrFallback, useLang, useT } from '../i18n'
import { DEFAULT_OFFER } from '../data/defaults'
import { useId } from 'react'
import { Card, Details, Disclaimer, Receipt, ResultHero, ShareRow } from './ui'
import { ptSourceId, TOOL_SOURCES } from '../data/sources'

export function Results({ b, flags }: { b: SalaryBreakdown; flags: RedFlag[] }) {
  const t = useT()
  const ctcMonthlyIllusion = b.input.ctcAnnual / 12
  const pct = Math.round(b.inHandRatio * 100)
  const realFlagCount = flags.filter((f) => f.severity !== 'info').length
  /** Untouched fixture on first paint = worked example, not the user's data. */
  const isExample = JSON.stringify(b.input) === JSON.stringify(DEFAULT_OFFER)

  return (
    <div className="-order-1 space-y-4 lg:order-none">
      <ResultHero
        sample={isExample}
        sampleChip={t('results.exampleChip')}
        sampleNote={t('results.exampleNote')}
        label={t('results.headline', { ctc: formatLPA(b.input.ctcAnnual) })}
        value={formatINR(b.inHandMonthly)}
        unit={t('unit.perMonth')}
        sub={t('results.headlineSub', { amount: formatINR(ctcMonthlyIllusion) })}
      >
        <CtcBar b={b} pct={pct} />

        <div className="grid grid-cols-2 gap-2 pt-1">
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
        <Receipt ids={[...TOOL_SOURCES.decoder, ptSourceId(b.input.state)]} />

        <ShareRow
          copyText={`${isExample ? `(${t('results.exampleChip')}) ` : ''}${t('results.headline', { ctc: formatLPA(b.input.ctcAnnual) })} ${formatINR(b.inHandMonthly)}${t('unit.perMonth')}`}
          copyLabel={t('ui.copyResult')}
          copiedLabel={t('ui.copied')}
          printLabel={t('ui.print')}
        />
        <p className="max-w-[65ch] text-[13px] leading-relaxed text-ink-faint">{t('decoder.fixedPayNote')}</p>
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </ResultHero>

      <Card>
        <h3 className="text-[15px] font-semibold">{t('results.whereGoes')}</h3>
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
          <Row label={t('results.row.inHand')} value={b.inHandAnnual} strong divider accent />
        </div>
      </Card>

      {flags.length > 0 && (
        <Card>
          <h3 className="text-[15px] font-semibold">
            {t('results.offerCheck')}{' '}
            {realFlagCount > 0 ? (
              <span className="tnum ml-1 rounded-full bg-alarm-soft px-2 py-0.5 text-[12px] font-semibold text-alarm">
                {t('results.flagsBadge', { n: realFlagCount, plural: realFlagCount === 1 ? '' : 's' })}
              </span>
            ) : (
              <span className="ml-1 rounded-full bg-leaf-soft px-2 py-0.5 text-[12px] font-semibold text-leaf">
                {t('results.noAlarming')}
              </span>
            )}
          </h3>
          <div className="mt-3 divide-y divide-line">
            {flags.map((f) => (
              <FlagCard key={f.id} f={f} b={b} />
            ))}
          </div>
        </Card>
      )}

      <Details summary={t('results.howComputed')}>
        <ul className="list-disc space-y-1.5 pl-4 text-[14px] leading-relaxed text-ink-soft">
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
      className={`rounded-xl border p-3 ${recommended ? 'border-leaf bg-leaf-soft' : 'border-line bg-card'}`}
    >
      <p className="flex flex-wrap items-center gap-1.5 text-[13px] font-semibold">
        {name}
        {recommended && (
          <span className="rounded-full bg-leaf px-2 py-px text-[12px] font-semibold text-white">{t('results.cheaper')}</span>
        )}
      </p>
      <p className="tnum mt-1 text-[16px] font-semibold">
        {formatINR(inHand)}
        <span className="text-[13px] font-medium text-ink-soft">{t('unit.perMonth')}</span>
      </p>
      <p className="tnum text-[13px] text-ink-soft">{t('results.taxPerYear', { amount: formatCompact(tax) })}</p>
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
      <span className={`text-[14px] ${strong ? 'font-semibold' : 'text-ink-soft'}`}>{label}</span>
      <span
        className={`tnum text-[14px] ${accent ? 'text-[17px] font-bold text-leaf' : strong ? 'font-semibold' : value < 0 ? 'text-alarm' : ''}`}
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
      ? { chip: 'bg-alarm-soft text-alarm', word: t('flagChip.red') }
      : f.severity === 'amber'
        ? { chip: 'bg-amberflag-soft text-amberflag', word: t('flagChip.amber') }
        : { chip: 'bg-paper text-ink-soft', word: t('flagChip.info') }

  const vars = flagVars(f, b)
  const title = translateOrFallback(lang, `flag.${f.id}.title`, f.title, vars)
  const detail = translateOrFallback(lang, `flag.${f.id}.detail`, f.detail, vars)
  const tip = translateOrFallback(lang, `flag.${f.id}.tip`, f.negotiationTip, vars)

  return (
    <div className="py-4 first:pt-1 last:pb-0">
      <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold leading-snug">
        <span className={`rounded-md px-2 py-0.5 text-[12px] font-semibold ${tone.chip}`}>{tone.word}</span>
        {title}
      </p>
      <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">{detail}</p>
      <p className="mt-2.5 rounded-lg bg-paper p-3 text-[14px] leading-relaxed">
        <span className="font-semibold text-saffron-strong">{t('results.sayThis')} </span>
        {tip}
      </p>
    </div>
  )
}

/**
 * Where the CTC goes, as one bar (VIS-24): every rupee of the CTC in order, what
 * reaches the bank first in ink, then what tax, PF and the rest take. The kept part
 * is no longer painted "good" green against an empty track: the losses are drawn.
 * Widths are SVG attributes (the CSP drops inline styles). The legend says it in words.
 */
function CtcBar({ b, pct }: { b: SalaryBreakdown; pct: number }) {
  const t = useT()
  const hatch = useId().replace(/:/g, '')
  const ctc = Math.max(1, b.input.ctcAnnual)
  const segs = [
    { id: 'in-hand', label: t('results.row.inHand'), value: b.inHandAnnual, cls: 'fill-ink', swatch: 'bg-ink' },
    {
      id: 'tax',
      label: t('results.row.incomeTax', { regime: t(`regime.${b.recommendedRegime}`) }),
      value: taxOf(b),
      cls: 'fill-alarm',
      swatch: 'bg-alarm',
    },
    { id: 'pf', label: t('results.row.employeePf'), value: b.employeePfAnnual, cls: 'fill-ink-faint', swatch: 'bg-ink-faint' },
    {
      id: 'employer-pf',
      label: t('results.row.employerPf'),
      value: b.input.employerPfInCtc ? b.employerPfAnnual : 0,
      cls: 'fill-line-strong',
      swatch: 'bg-line-strong',
    },
    { id: 'variable', label: t('results.row.variable'), value: b.input.variableAnnual, cls: '', swatch: 'bg-amberflag' },
    {
      id: 'other',
      label: [
        b.gratuityAnnual > 0 ? t('results.row.gratuity') : '',
        (b.input.esop?.annualValue ?? 0) > 0 ? t('results.row.esop') : '',
        b.professionalTaxAnnual > 0
          ? t(b.input.state === 'PB' ? 'results.row.professionalTax.pb' : 'results.row.professionalTax')
          : '',
      ]
        .filter(Boolean)
        .join(' · '),
      value: b.gratuityAnnual + (b.input.esop?.annualValue ?? 0) + b.professionalTaxAnnual,
      cls: 'fill-paper',
      swatch: 'bg-paper border border-line-strong',
    },
  ].filter((s) => s.value > 0)
  let x = 0
  return (
    <div>
      <svg className="block h-3 w-full overflow-hidden rounded-full bg-paper" aria-hidden="true">
        <defs>
          <pattern id={hatch} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" className="fill-amberflag-soft" />
            <rect width="3" height="6" className="fill-amberflag" />
          </pattern>
        </defs>
        {segs.map((s) => {
          const w = (s.value / ctc) * 100
          const r = (
            <rect
              key={s.id}
              data-seg={s.id}
              className={`${s.cls} stroke-card`}
              fill={s.id === 'variable' ? `url(#${hatch})` : undefined}
              strokeWidth="1"
              height="100%"
              x={`${x}%`}
              width={`${s.id === 'in-hand' ? Math.max(0, Math.min(100, pct)) : Math.max(0, w)}%`}
            />
          )
          x += s.id === 'in-hand' ? pct : w
          return r
        })}
      </svg>
      <p className="mt-2 text-[13px] text-ink-soft">
        <span className="font-semibold text-ink">{pct}%</span>{' '}
        {t('results.reaches', { pct, amount: formatCompact(b.inHandAnnual) })}
      </p>
      <ul aria-hidden="true" className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-soft">
        {segs.map((s) => (
          <li key={s.id} className="inline-flex items-center gap-1.5">
            <span className={`inline-block h-2.5 w-2.5 rounded-sm ${s.swatch}`} />
            <span>{s.label}</span>
            <span className="tnum text-ink-faint">{formatCompact(s.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

