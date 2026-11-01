import { useEffect, useMemo, useState } from 'react'
import type { OfferInput, StateCode } from '../../engine/types'
import { STATE_NAMES } from '../../engine/professionalTax'
import { cityChoicesFor, cityFromLegacyMetro, isHraMetro, normaliseCity, type CityChoice } from '../../engine/city'
import { relocationDelta } from '../../engine/relocation'
import { formatINR } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import {
  Card,
  Disclaimer,
  ExampleNote,
  InheritNote,
  MoneyField,
  Select,
  ShareRow,
  VerdictBanner,
} from '../../components/ui'
import { DEFAULT_OFFER, loadOffer } from '../../data/defaults'
import { readJson, writeJson } from '../../lib/storage'
import { useT, useLang, type Lang } from '../../i18n'
import { withLang } from '../../lib/langPath'

const STORAGE_KEY = 'switchkarle.relocation.v1' as const

interface Draft {
  ctc: number
  fromState: StateCode
  fromCity: CityChoice
  fromRent: number
  toState: StateCode
  toCity: CityChoice
  toRent: number
}

/** Drafts saved before the city field carried `fromMetro` / `toMetro` instead. */
type SavedDraft = Partial<Draft> & {
  ctc: number
  fromState: StateCode
  toState: StateCode
  fromMetro?: boolean
  toMetro?: boolean
  rentPaidMonthly?: number
}

/** What first paint shows when the Decoder has not seeded anything. */
const FIXTURE: Draft = {
  ctc: DEFAULT_OFFER.ctcAnnual,
  fromState: 'KA',
  fromCity: 'bengaluru',
  fromRent: 40_000,
  toState: 'MH',
  toCity: 'mumbai',
  toRent: 40_000,
}

function fromDecoder(): Draft {
  const o = loadOffer()
  const rent = o.old?.rentPaidMonthly || 40_000
  const toState: StateCode = o.state === 'KA' ? 'MH' : 'KA'
  return {
    ctc: o.ctcAnnual,
    fromState: o.state,
    fromCity: o.city !== undefined ? normaliseCity(o.state, o.city) : cityFromLegacyMetro(o.state, o.old?.metro ?? false),
    fromRent: rent,
    toState,
    toCity: cityChoicesFor(toState)[0],
    toRent: rent,
  }
}

function migrateDraft(saved: SavedDraft | null): Draft | null {
  if (!saved) return null
  const shared = typeof saved.rentPaidMonthly === 'number' ? saved.rentPaidMonthly : 40_000
  return {
    ctc: saved.ctc,
    fromState: saved.fromState,
    fromCity:
      saved.fromCity !== undefined
        ? normaliseCity(saved.fromState, saved.fromCity)
        : cityFromLegacyMetro(saved.fromState, saved.fromMetro ?? false),
    fromRent: typeof saved.fromRent === 'number' ? saved.fromRent : shared,
    toState: saved.toState,
    toCity:
      saved.toCity !== undefined
        ? normaliseCity(saved.toState, saved.toCity)
        : cityFromLegacyMetro(saved.toState, saved.toMetro ?? false),
    toRent: typeof saved.toRent === 'number' ? saved.toRent : shared,
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
  const { lang } = useLang()
  const [draft, setDraft] = useState<Draft>(FIXTURE)
  const [template, setTemplate] = useState<OfferInput>(DEFAULT_OFFER)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const offer = loadOffer()
    setTemplate(offer)
    const saved = readJson<SavedDraft | null>(STORAGE_KEY, null)
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
      city: draft.fromCity,
      old: {
        rentPaidMonthly: draft.fromRent,
        metro: isHraMetro(draft.fromState, draft.fromCity),
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
        city: draft.toCity,
        rentPaidMonthly: draft.toRent,
      }),
    [fromOffer, draft.toState, draft.toCity, draft.toRent],
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
  const cities = (state: StateCode) =>
    cityChoicesFor(state).map((c) => ({
      value: c,
      label: c === 'other' ? t('city.other', { state: t(`state.${state}`) }) : t(`city.${c}`),
    }))
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
        <Select
          label={t('relocation.fromState')}
          value={draft.fromState}
          onChange={(v) => set({ fromState: v, fromCity: normaliseCity(v, draft.fromCity) })}
          options={states}
        />
        <Select label={t('relocation.fromCity')} hint={t('relocation.metroHint')} value={draft.fromCity} onChange={(v) => set({ fromCity: v })} options={cities(draft.fromState)} />
        <MoneyField label={t('relocation.fromRent')} hint={t('relocation.rentHint')} value={draft.fromRent} onChange={(v) => set({ fromRent: v })} />
        <Select
          label={t('relocation.toState')}
          value={draft.toState}
          onChange={(v) => set({ toState: v, toCity: normaliseCity(v, draft.toCity) })}
          options={states}
        />
        <Select label={t('relocation.toCity')} hint={t('relocation.metroHint')} value={draft.toCity} onChange={(v) => set({ toCity: v })} options={cities(draft.toState)} />
        <MoneyField label={t('relocation.toRent')} hint={t('relocation.rentHint')} value={draft.toRent} onChange={(v) => set({ toRent: v })} />
        <InheritNote text={t('ui.inherit')} linkLabel={t('ui.inheritLink')} href={withLang(lang, 'decoder')} />
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
