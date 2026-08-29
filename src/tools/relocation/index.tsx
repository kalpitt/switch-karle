import { useEffect, useMemo, useState } from 'react'
import type { OfferInput, StateCode } from '../../engine/types'
import { STATE_NAMES } from '../../engine/professionalTax'
import { stateHasHraMetroCity } from '../../engine/salary'
import { relocationDelta } from '../../engine/relocation'
import { formatINR } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import {
  Card,
  Disclaimer,
  ExampleNote,
  MoneyField,
  Select,
  ShareRow,
  Toggle,
  VerdictBanner,
} from '../../components/ui'
import { DEFAULT_OFFER, loadOffer } from '../../data/defaults'
import { readJson, writeJson } from '../../lib/storage'
import { useT, type Lang } from '../../i18n'

const STORAGE_KEY = 'switchkarle.relocation.v1' as const

interface Draft {
  ctc: number
  fromState: StateCode
  fromMetro: boolean
  fromRent: number
  toState: StateCode
  toMetro: boolean
  toRent: number
}

/** What first paint shows when the Decoder has not seeded anything. */
const FIXTURE: Draft = {
  ctc: DEFAULT_OFFER.ctcAnnual,
  fromState: 'KA',
  fromMetro: false,
  fromRent: 40_000,
  toState: 'MH',
  toMetro: false,
  toRent: 40_000,
}

function fromDecoder(): Draft {
  const o = loadOffer()
  const rent = o.old?.rentPaidMonthly || 40_000
  return {
    ctc: o.ctcAnnual,
    fromState: o.state,
    fromMetro: o.old?.metro ?? false,
    fromRent: rent,
    toState: o.state === 'KA' ? 'MH' : 'KA',
    toMetro: false,
    toRent: rent,
  }
}

function migrateDraft(saved: Draft | (Draft & { rentPaidMonthly?: number }) | null): Draft | null {
  if (!saved) return null
  const legacy = saved as Draft & { rentPaidMonthly?: number }
  if (typeof legacy.fromRent === 'number' && typeof legacy.toRent === 'number') return saved
  const shared = typeof legacy.rentPaidMonthly === 'number' ? legacy.rentPaidMonthly : 40_000
  return {
    ctc: saved.ctc,
    fromState: saved.fromState,
    fromMetro: saved.fromMetro,
    fromRent: shared,
    toState: saved.toState,
    toMetro: saved.toMetro,
    toRent: shared,
  }
}

export default function RelocationTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="relocation">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [draft, setDraft] = useState<Draft>(FIXTURE)
  const [template, setTemplate] = useState<OfferInput>(DEFAULT_OFFER)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const offer = loadOffer()
    setTemplate(offer)
    const saved = readJson<Draft | null>(STORAGE_KEY, null)
    setDraft(migrateDraft(saved) ?? fromDecoder())
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
        rentPaidMonthly: draft.fromRent,
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
        rentPaidMonthly: draft.toRent,
      }),
    [fromOffer, draft.toState, draft.toMetro, draft.toRent],
  )

  const delta = result.inHandDeltaMonthly
/** Untouched fixture on first paint = worked example, not the user's data. */
  const isExample = JSON.stringify(draft) === JSON.stringify(FIXTURE)
  const verdict =
    delta === 0
      ? t('relocation.verdict.nil')
      : t('relocation.verdict.delta', {
          amount: formatINR(Math.abs(delta)),
          dir: delta > 0 ? t('relocation.more') : t('relocation.less'),
        })
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))
  const states = (Object.keys(STATE_NAMES) as StateCode[]).map((s) => ({ value: s, label: t(`state.${s}`) }))
  const fromMetroWarn = draft.fromMetro && !stateHasHraMetroCity(draft.fromState)
  const toMetroWarn = draft.toMetro && !stateHasHraMetroCity(draft.toState)
  const hraIsDisplayOnly = result.from.recommendedRegime === 'new' && result.to.recommendedRegime === 'new'

  const copyText = [
    verdict,
    `${t('relocation.row.inHand')}: ${formatINR(result.from.inHandMonthly)} → ${formatINR(result.to.inHandMonthly)}/mo`,
    `${t('relocation.row.pt')}: ${formatINR(result.from.professionalTaxAnnual)} → ${formatINR(result.to.professionalTaxAnnual)}/${t('relocation.year')}`,
    `${t('relocation.row.hra')}: ${formatINR(result.hraExemptionFrom)} → ${formatINR(result.hraExemptionTo)}`,
    t('ui.disclaimer'),
  ].join('\n')

  return (
    <div data-tool="relocation" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('relocation.formTitle')}</h2>
        <MoneyField label={t('decoder.field.ctc.label')} hint={t('ui.money.hint')} value={draft.ctc} onChange={(v) => set({ ctc: v })} />
        <Select label={t('relocation.fromState')} value={draft.fromState} onChange={(v) => set({ fromState: v })} options={states} />
        <Toggle label={t('relocation.fromMetro')} hint={t('relocation.metroHint')} checked={draft.fromMetro} onChange={(v) => set({ fromMetro: v })} />
        <MoneyField label={t('relocation.fromRent')} hint={t('relocation.rentHint')} value={draft.fromRent} onChange={(v) => set({ fromRent: v })} />
        <Select label={t('relocation.toState')} value={draft.toState} onChange={(v) => set({ toState: v })} options={states} />
        <Toggle label={t('relocation.toMetro')} hint={t('relocation.metroHint')} checked={draft.toMetro} onChange={(v) => set({ toMetro: v })} />
        <MoneyField label={t('relocation.toRent')} hint={t('relocation.rentHint')} value={draft.toRent} onChange={(v) => set({ toRent: v })} />
      </Card>

      <div className="-order-1 space-y-4 lg:order-none">
        {isExample ? (
          <ExampleNote chip={t('ui.exampleChip')} note={t('ui.exampleNote')} />
        ) : (
          <VerdictBanner tone={delta < 0 ? 'amber' : 'leaf'}>{verdict}</VerdictBanner>
        )}
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
          {hraIsDisplayOnly && <p className="text-[13px] text-ink-soft">{t('relocation.hraNewRegime')}</p>}
          {(fromMetroWarn || toMetroWarn) && (
            <p className="text-[13px] text-amberflag">
              {t('relocation.metroWarn', {
                state: t(`state.${fromMetroWarn ? draft.fromState : draft.toState}`),
              })}
            </p>
          )}
          <p className="text-[13px] text-ink-soft">{t('relocation.ptApprox')}</p>
          <p className="text-[13px] text-ink-soft">{t('relocation.slabsNil')}</p>
          <p className="text-[13px] text-ink-soft">{t('relocation.noCol')}</p>
        </Card>
        {!isExample && (
          <ShareRow
            copyText={copyText}
            copyLabel={t('ui.copy')}
            copiedLabel={t('ui.copied')}
            printLabel={t('ui.print')}
          />
        )}
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
