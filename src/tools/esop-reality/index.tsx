import { useEffect, useMemo, useState } from 'react'
import { decodeOffer } from '../../engine/salary'
import { esopReality } from '../../engine/esop'
import { formatINR } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import {
  Card,
  Disclaimer,
  ExampleNote,
  MoneyField,
  NumberField,
  Toggle,
  VerdictBanner,
} from '../../components/ui'
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
  liquid: boolean
}

const DEFAULT_DRAFT: Draft = {
  shares: 1_000,
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

  return (
    <div data-tool="esop-reality" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('esop-reality.formTitle')}</h2>
        <NumberField label={t('esop-reality.shares')} value={draft.shares} onChange={(v) => set({ shares: v })} />
        <MoneyField label={t('esop-reality.strike')} hint={t('esop-reality.perShare')} value={draft.strike} onChange={(v) => set({ strike: v })} />
        <MoneyField label={t('esop-reality.fmv')} hint={t('esop-reality.fmvHint')} value={draft.fmv} onChange={(v) => set({ fmv: v })} />
        <NumberField label={t('esop-reality.cliff')} suffix={t('unit.months')} value={draft.cliffMonths} onChange={(v) => set({ cliffMonths: v })} />
        <NumberField label={t('esop-reality.vest')} suffix={t('unit.months')} value={draft.vestMonths} onChange={(v) => set({ vestMonths: v })} />
        <Toggle label={t('esop-reality.liquid')} hint={t('esop-reality.liquidHint')} checked={draft.liquid} onChange={(v) => set({ liquid: v })} />
      </Card>

      <div className="-order-1 space-y-4 lg:order-none">
        {isExample ? (
          <ExampleNote chip={t('ui.exampleChip')} note={t('ui.exampleNote')} />
        ) : (
          <VerdictBanner tone={result.postExitWindowNote ? 'amber' : 'leaf'}>{verdict}</VerdictBanner>
        )}
        <Card>
          <h3 className="mb-2 text-sm font-bold">{t('esop-reality.vestTitle')}</h3>
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
        {result.postExitWindowNote && <p className="text-[13px] text-amberflag">{t('esop-reality.illiquid')}</p>}
        <p className="text-[13px] text-ink-soft">{t('esop-reality.vestLinear')}</p>
        <p className="text-[13px] text-ink-soft">{t('esop-reality.saleNote')}</p>
        <p className="text-[13px] text-ink-soft">{t('esop-reality.provisional')}</p>
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
