import { useEffect, useMemo, useState } from 'react'
import { decodeOffer } from '../../engine/salary'
import { esopReality, type VestCadence, type VestRow } from '../../engine/esop'
import { formatINR } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import {
  Card,
  Disclaimer,
  MoneyField,
  NumberField,
  Receipt,
  ResultHero,
  Select,
  ShareRow,
  Toggle,
} from '../../components/ui'
import { PrivacyLine } from '../../components/PrivacyLine'
import { TOOL_SOURCES } from '../../data/sources'
import { loadOffer } from '../../data/defaults'
import { readJson, writeJson } from '../../lib/storage'
import { useT, type Lang } from '../../i18n'

const STORAGE_KEY = 'switchkarle.esop.v1' as const

interface Draft {
  shares: number
  strike: number
  fmv: number
  cliffMonths: number
  vestMonths: number
  vestCadence: VestCadence
  liquid: boolean
}

const DEFAULT_DRAFT: Draft = {
  shares: 1_000,
  vestCadence: 'monthly',
  strike: 10,
  fmv: 110,
  cliffMonths: 12,
  vestMonths: 48,
  liquid: false,
}

export default function EsopRealityTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="esop-reality">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT)
  const [taxable, setTaxable] = useState(1_800_000)
  const [regime, setRegime] = useState<'new' | 'old'>('new')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const offer = loadOffer()
    const b = decodeOffer(offer)
    setTaxable(b.recommendedRegime === 'new' ? b.newRegime.taxableIncome : b.oldRegime.taxableIncome)
    setRegime(b.recommendedRegime)
    const saved = readJson<Draft | null>(STORAGE_KEY, null)
    setDraft(saved ?? { ...DEFAULT_DRAFT, cliffMonths: offer.esop?.cliffMonths ?? 12, liquid: offer.esop?.liquid ?? false })
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, draft)
  }, [draft, hydrated])

  const result = useMemo(
    () =>
      esopReality({
        ...draft,
        taxableIncomeWithoutPerq: taxable,
        regime,
      }),
    [draft, taxable, regime],
  )

/** Untouched fixture on first paint = worked example, not the user's data. */
  const isExample = JSON.stringify(draft) === JSON.stringify(DEFAULT_DRAFT)
  const verdict = result.underwater
    ? t('esop-reality.underwater', { cost: formatINR(result.exerciseCost) })
    : t('esop-reality.verdict', {
        perq: formatINR(result.perquisiteTotal),
        tax: formatINR(result.taxOnPerq),
        cost: formatINR(result.exerciseCost),
        cash: formatINR(result.cashNeeded),
      })
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  const copyText = [verdict, t('esop-reality.provisional'), t('ui.disclaimer')].join('\n')

  return (
    <div data-tool="esop-reality" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-20">
        <h2 className="text-[18px] font-semibold leading-snug">{t('esop-reality.formTitle')}</h2>
        <PrivacyLine />
        <NumberField integer label={t('esop-reality.shares')} value={draft.shares} onChange={(v) => set({ shares: v })} />
        <MoneyField label={t('esop-reality.strike')} hint={t('esop-reality.perShare')} value={draft.strike} onChange={(v) => set({ strike: v })} />
        <MoneyField label={t('esop-reality.fmv')} hint={t('esop-reality.fmvHint')} value={draft.fmv} onChange={(v) => set({ fmv: v })} />
        <NumberField integer label={t('esop-reality.cliff')} suffix={t('unit.months')} value={draft.cliffMonths} onChange={(v) => set({ cliffMonths: v })} />
        <NumberField integer label={t('esop-reality.vest')} suffix={t('unit.months')} value={draft.vestMonths} onChange={(v) => set({ vestMonths: v })} />
        <Select
          label={t('esop-reality.cadence')}
          value={draft.vestCadence}
          onChange={(v) => set({ vestCadence: v })}
          options={[
            { value: 'monthly', label: t('esop-reality.cadence.monthly') },
            { value: 'annual', label: t('esop-reality.cadence.annual') },
          ]}
        />
        <Toggle label={t('esop-reality.liquid')} hint={t('esop-reality.liquidHint')} checked={draft.liquid} onChange={(v) => set({ liquid: v })} />
      </Card>

      <div className="-order-1 space-y-4 lg:order-none">
        <ResultHero
          sample={isExample}
          label={t('hero.esop-reality')}
          value={formatINR(result.cashNeeded)}
          verdict={verdict}
          tone={result.postExitWindowNote ? 'amber' : 'leaf'}
        >
          <Receipt ids={TOOL_SOURCES['esop-reality']} />
        </ResultHero>
        <Card>
          <h3 className="mb-2 text-[15px] font-semibold">{t('esop-reality.vestTitle')}</h3>
          <VestChart rows={result.vestTable} total={draft.shares} cliff={draft.cliffMonths} cadence={draft.vestCadence} />
          {result.vestTable.map((row, i) => (
            <p key={`${row.month}-${i}`} className="tnum flex justify-between text-[13px]">
              <span>{t('esop-reality.vestRow', { month: row.month })}</span>
              <span>
                {row.stillCliffed
                  ? t('esop-reality.cliffed')
                  : t('esop-reality.vested', { n: Math.round(row.vestedShares) })}
              </span>
            </p>
          ))}
        </Card>
        {result.postExitWindowNote && <p className="text-[14px] leading-relaxed text-amberflag">{t('esop-reality.illiquid')}</p>}
        <p className="text-[14px] leading-relaxed text-ink-soft">
          {t(draft.vestCadence === 'annual' ? 'esop-reality.vestAnnual' : 'esop-reality.vestLinear')}
        </p>
        <p className="text-[14px] leading-relaxed text-ink-soft">{t('esop-reality.vestLetter')}</p>
        <p className="text-[14px] leading-relaxed text-ink-soft">{t('esop-reality.saleNote')}</p>
        <p className="text-[14px] leading-relaxed text-ink-soft">{t('esop-reality.provisional')}</p>
        {!isExample && (
          <ShareRow
            copyText={copyText}
            copyLabel={t('ui.copyResult')}
            copiedLabel={t('ui.copied')}
            printLabel={t('ui.print')}
          />
        )}
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}

/**
 * The vest schedule drawn as a step chart (VIS-24): flat at zero until the cliff,
 * then the shares that vest after it. Drawn from the engine's own vest table, so the
 * picture and the rows under it cannot disagree. Hidden from screen readers: the rows
 * say the same thing in words.
 */
function VestChart({
  rows,
  total,
  cliff,
  cadence,
}: {
  rows: VestRow[]
  total: number
  cliff: number
  cadence: VestCadence
}) {
  const t = useT()
  const sorted = [...rows].sort((a, b) => a.month - b.month)
  const end = Math.max(1, sorted[sorted.length - 1]?.month ?? 1)
  const top = Math.max(1, total)
  const x = (m: number) => (m / end) * 100
  const y = (n: number) => 40 - (Math.max(0, n) / top) * 38
  const pts: string[] = [`0,${y(0)}`]
  let prev = 0
  for (const r of sorted) {
    if (r.month === 0) continue
    const v = r.vestedShares
    if (cadence === 'annual' || r.month === cliff || prev === 0) pts.push(`${x(r.month)},${y(prev)}`)
    pts.push(`${x(r.month)},${y(v)}`)
    prev = v
  }
  return (
    <div className="mb-3">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="block h-28 w-full" aria-hidden="true">
        <line x1="0" y1="40" x2="100" y2="40" className="stroke-line" vectorEffect="non-scaling-stroke" />
        {cliff > 0 && cliff < end && (
          <line
            x1={x(cliff)}
            y1="0"
            x2={x(cliff)}
            y2="40"
            className="stroke-ink-faint"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        )}
        <polyline points={pts.join(' ')} fill="none" className="stroke-ink" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <p className="tnum mt-1.5 flex justify-between gap-3 text-[12px] text-ink-faint">
        <span>{t('esop-reality.vestRow', { month: 0 })}</span>
        {cliff > 0 && (
          <span>
            {t('esop-reality.cliff')} · {t('esop-reality.vestRow', { month: cliff })}
          </span>
        )}
        <span>{t('esop-reality.vestRow', { month: end })}</span>
      </p>
    </div>
  )
}
