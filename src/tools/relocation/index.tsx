import { useEffect, useMemo, useState } from 'react'
import type { OfferInput, StateCode } from '../../engine/types'
import { STATE_NAMES } from '../../engine/professionalTax'
import { relocationDelta } from '../../engine/relocation'
import { formatINR } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, Disclaimer, MoneyField, Select, Toggle, VerdictBanner } from '../../components/ui'
import { DEFAULT_OFFER, loadOffer } from '../../data/defaults'
import { readJson, writeJson } from '../../lib/storage'
import { useT } from '../../i18n'

const STORAGE_KEY = 'switchkarle.relocation.v1' as const

interface Draft {
  ctc: number
  fromState: StateCode
  fromMetro: boolean
  toState: StateCode
  toMetro: boolean
  rentPaidMonthly: number
}

function fromDecoder(): Draft {
  const o = loadOffer()
  return {
    ctc: o.ctcAnnual,
    fromState: o.state,
    fromMetro: o.old?.metro ?? true,
    toState: o.state === 'KA' ? 'MH' : 'KA',
    toMetro: false,
    rentPaidMonthly: o.old?.rentPaidMonthly || 40_000,
  }
}

export default function RelocationTool() {
  return (
    <IslandRoot current="relocation">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [draft, setDraft] = useState<Draft>({
    ctc: DEFAULT_OFFER.ctcAnnual,
    fromState: 'KA',
    fromMetro: true,
    toState: 'MH',
    toMetro: false,
    rentPaidMonthly: 40_000,
  })
  const [template, setTemplate] = useState<OfferInput>(DEFAULT_OFFER)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const offer = loadOffer()
    setTemplate(offer)
    const saved = readJson<Draft | null>(STORAGE_KEY, null)
    setDraft(saved ?? fromDecoder())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, draft)
  }, [draft, hydrated])

  const fromOffer: OfferInput = useMemo(
    () => ({
      ...template,
      ctcAnnual: draft.ctc,
      state: draft.fromState,
      old: {
        rentPaidMonthly: draft.rentPaidMonthly,
        metro: draft.fromMetro,
        deduction80CExtra: template.old?.deduction80CExtra ?? 0,
        deduction80D: template.old?.deduction80D ?? 0,
      },
    }),
    [template, draft],
  )

  const result = useMemo(
    () =>
      relocationDelta(fromOffer, {
        state: draft.toState,
        metro: draft.toMetro,
        rentPaidMonthly: draft.rentPaidMonthly,
      }),
    [fromOffer, draft.toState, draft.toMetro, draft.rentPaidMonthly],
  )

  const delta = result.inHandDeltaMonthly
  const verdict =
    delta === 0
      ? t('relocation.verdict.nil')
      : t('relocation.verdict.delta', {
          amount: formatINR(Math.abs(delta)),
          dir: delta > 0 ? t('relocation.more') : t('relocation.less'),
        })
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))
  const states = (Object.keys(STATE_NAMES) as StateCode[]).map((s) => ({ value: s, label: t(`state.${s}`) }))

  return (
    <div data-tool="relocation" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('relocation.formTitle')}</h2>
        <MoneyField label={t('decoder.field.ctc.label')} hint={t('ui.money.hint')} value={draft.ctc} onChange={(v) => set({ ctc: v })} />
        <Select label={t('relocation.fromState')} value={draft.fromState} onChange={(v) => set({ fromState: v })} options={states} />
        <Toggle label={t('relocation.fromMetro')} hint={t('relocation.metroHint')} checked={draft.fromMetro} onChange={(v) => set({ fromMetro: v })} />
        <Select label={t('relocation.toState')} value={draft.toState} onChange={(v) => set({ toState: v })} options={states} />
        <Toggle label={t('relocation.toMetro')} hint={t('relocation.metroHint')} checked={draft.toMetro} onChange={(v) => set({ toMetro: v })} />
        <MoneyField label={t('relocation.rent')} hint={t('relocation.rentHint')} value={draft.rentPaidMonthly} onChange={(v) => set({ rentPaidMonthly: v })} />
      </Card>

      <div className="space-y-4">
        <VerdictBanner tone={delta < 0 ? 'amber' : 'leaf'}>{verdict}</VerdictBanner>
        <Card className="space-y-2">
          <p className="tnum text-[13px]">
            {t('relocation.row.inHand')}: {formatINR(result.from.inHandMonthly)} → {formatINR(result.to.inHandMonthly)}/mo
          </p>
          <p className="tnum text-[13px]">
            {t('relocation.row.pt')}: {formatINR(result.from.professionalTaxAnnual)} → {formatINR(result.to.professionalTaxAnnual)}/{t('relocation.year')}
          </p>
          <p className="tnum text-[13px]">
            {t('relocation.row.hra')}: {formatINR(result.hraExemptionFrom)} → {formatINR(result.hraExemptionTo)}
          </p>
          <p className="text-[13px] text-ink-soft">{t('relocation.slabsNil')}</p>
          <p className="text-[13px] text-ink-soft">{t('relocation.noCol')}</p>
        </Card>
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
