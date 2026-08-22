import { useEffect, useMemo, useState } from 'react'
import type { OfferInput, StateCode } from '../../engine/types'
import { STATE_NAMES } from '../../engine/professionalTax'
import { compareOffers } from '../../engine/compare'
import { formatINR, formatLPA } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import {
  Card,
  DeltaTable,
  Disclaimer,
  MoneyField,
  NumberField,
  Select,
  Toggle,
  VerdictBanner,
} from '../../components/ui'
import { DEFAULT_OFFER, loadOffer } from '../../data/defaults'
import { readJson, writeJson } from '../../lib/storage'
import { useT } from '../../i18n'

const STORAGE_KEY = 'switchkarle.compare.v1' as const
const L = 100_000

type Slot = { label: string; offer: OfferInput }

function defaultSlots(): Slot[] {
  const a = loadOffer()
  const b: OfferInput = {
    ...DEFAULT_OFFER,
    ctcAnnual: Math.round(a.ctcAnnual * 1.2),
    variableAnnual: a.variableAnnual,
    state: a.state,
    gratuityInCtc: true,
  }
  return [
    { label: 'A', offer: a },
    { label: 'B', offer: b },
  ]
}

export default function OfferComparisonTool() {
  return (
    <IslandRoot current="offer-comparison">
      <CompareBody />
    </IslandRoot>
  )
}

function CompareBody() {
  const t = useT()
  const [slots, setSlots] = useState<Slot[]>(() => [
    { label: 'A', offer: DEFAULT_OFFER },
    {
      label: 'B',
      offer: { ...DEFAULT_OFFER, ctcAnnual: 2_880_000, gratuityInCtc: true },
    },
  ])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const saved = readJson<Slot[] | null>(STORAGE_KEY, null)
    setSlots(saved && saved.length >= 2 ? saved : defaultSlots())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, slots)
  }, [slots, hydrated])

  const result = useMemo(() => compareOffers(slots.map((s) => s.offer)), [slots])

  const patch = (i: number, offer: OfferInput) => {
    setSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, offer } : s)))
  }

  const verdict =
    result.verdictIndex === null
      ? t('offer-comparison.verdict.tie')
      : t('offer-comparison.verdict.win', {
          label: slots[result.verdictIndex]!.label,
          amount: formatINR(result.forVerdict[result.verdictIndex]!.inHandMonthly),
        })

  const rows = [
    {
      label: t('offer-comparison.row.ctc'),
      a: formatLPA(slots[0]!.offer.ctcAnnual),
      b: formatLPA(slots[1]!.offer.ctcAnnual),
    },
    {
      label: t('offer-comparison.row.inHand'),
      a: formatINR(result.forVerdict[0]!.inHandMonthly),
      b: formatINR(result.forVerdict[1]!.inHandMonthly),
    },
    {
      label: t('offer-comparison.row.ratio'),
      a: `${Math.round(result.forVerdict[0]!.inHandRatio * 100)}%`,
      b: `${Math.round(result.forVerdict[1]!.inHandRatio * 100)}%`,
    },
    {
      label: t('offer-comparison.row.variable'),
      a: formatLPA(slots[0]!.offer.variableAnnual),
      b: formatLPA(slots[1]!.offer.variableAnnual),
    },
  ]

  return (
    <div data-tool="offer-comparison" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <div className="space-y-4 lg:sticky lg:top-6">
        {slots.map((s, i) => (
          <MiniOffer
            key={s.label}
            title={t('offer-comparison.offer', { label: s.label })}
            offer={s.offer}
            onChange={(o) => patch(i, o)}
          />
        ))}
        {slots.length === 2 ? (
          <button
            type="button"
            className="w-full rounded-xl border border-line px-4 py-2.5 text-[13px] font-bold text-ink-soft"
            onClick={() =>
              setSlots((prev) => [
                ...prev,
                { label: 'C', offer: { ...DEFAULT_OFFER, ctcAnnual: 3_000_000, state: 'MH' } },
              ])
            }
          >
            {t('offer-comparison.addThird')}
          </button>
        ) : (
          <button
            type="button"
            className="w-full rounded-xl border border-line px-4 py-2.5 text-[13px] font-bold text-ink-soft"
            onClick={() => setSlots((prev) => prev.slice(0, 2))}
          >
            {t('offer-comparison.removeThird')}
          </button>
        )}
      </div>

      <div className="space-y-4">
        <VerdictBanner tone={result.verdictIndex === null ? 'amber' : 'leaf'}>{verdict}</VerdictBanner>
        {slots.length === 2 ? (
          <Card>
            <h3 className="mb-3 text-sm font-bold">{t('offer-comparison.delta')}</h3>
            <DeltaTable aLabel={slots[0]!.label} bLabel={slots[1]!.label} rows={rows} />
          </Card>
        ) : (
          <Card className="space-y-2">
            <h3 className="text-sm font-bold">{t('offer-comparison.delta')}</h3>
            {result.forVerdict.map((b, i) => (
              <p key={slots[i]!.label} className="tnum text-[13px]">
                <span className="font-bold">{slots[i]!.label}:</span> {formatINR(b.inHandMonthly)}/mo ·{' '}
                {formatLPA(slots[i]!.offer.ctcAnnual)}
              </p>
            ))}
          </Card>
        )}
        {result.flags.esopZeroed && (
          <p className="text-[13px] text-ink-soft">{t('offer-comparison.esopPolicy')}</p>
        )}
        {result.flags.asymmetricGratuity && (
          <p className="text-[13px] text-amberflag">{t('offer-comparison.flag.gratuity')}</p>
        )}
        {result.flags.asymmetricEmployerPf && (
          <p className="text-[13px] text-amberflag">{t('offer-comparison.flag.pf')}</p>
        )}
        {result.flags.asymmetricPfCeiling && (
          <p className="text-[13px] text-amberflag">{t('offer-comparison.flag.ceiling')}</p>
        )}
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}

function MiniOffer({
  title,
  offer,
  onChange,
}: {
  title: string
  offer: OfferInput
  onChange: (o: OfferInput) => void
}) {
  const t = useT()
  const set = (patch: Partial<OfferInput>) => onChange({ ...offer, ...patch })
  return (
    <Card className="space-y-3">
      <h2 className="text-base font-bold">{title}</h2>
      <MoneyField
        label={t('decoder.field.ctc.label')}
        hint={t('ui.money.hint')}
        value={offer.ctcAnnual}
        onChange={(v) => set({ ctcAnnual: v })}
      />
      <NumberField
        label={t('decoder.field.variable.label')}
        suffix="LPA"
        step={0.5}
        value={offer.variableAnnual / L}
        onChange={(v) => set({ variableAnnual: v * L })}
      />
      <Select
        label={t('decoder.field.state.label')}
        value={offer.state}
        onChange={(v) => set({ state: v })}
        options={(Object.keys(STATE_NAMES) as StateCode[]).map((s) => ({
          value: s,
          label: t(`state.${s}`),
        }))}
      />
      <Toggle
        label={t('decoder.toggle.gratuity.label')}
        checked={offer.gratuityInCtc}
        onChange={(v) => set({ gratuityInCtc: v })}
      />
      <Toggle
        label={t('decoder.toggle.employerPf.label')}
        checked={offer.employerPfInCtc}
        onChange={(v) => set({ employerPfInCtc: v })}
      />
      <Toggle
        label={t('decoder.toggle.pfFull.label')}
        checked={offer.pfOnFullBasic}
        onChange={(v) => set({ pfOnFullBasic: v })}
      />
    </Card>
  )
}
