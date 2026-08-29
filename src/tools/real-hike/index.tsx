import { useEffect, useMemo, useState } from 'react'
import type { OfferInput, StateCode } from '../../engine/types'
import { STATE_NAMES } from '../../engine/professionalTax'
import { realHike } from '../../engine/hike'
import { formatINR, formatLPA } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import {
  Card,
  Disclaimer,
  ExampleNote,
  InheritNote,
  MoneyField,
  NumberField,
  Select,
  ShareRow,
  Toggle,
  VerdictBanner,
} from '../../components/ui'
import { DEFAULT_OFFER, loadOffer } from '../../data/defaults'
import { readJson, writeJson } from '../../lib/storage'
import { useT, useLang, type Lang } from '../../i18n'
import { withLang } from '../../lib/langPath'

const STORAGE_KEY = 'switchkarle.hike.v1' as const

interface Draft {
  currentCtc: number
  currentVariable: number
  currentState: StateCode
  nextCtc: number
  nextVariable: number
  nextState: StateCode
  /**
   * The new offer's basic as a percent of CTC. Without it the new CTC gets
   * modelled with the current employer's stuffing, which is the thing this
   * tool exists to expose.
   */
  nextBasicPercent: number
  haircut: boolean
}

function fromDecoder(): Draft {
  const o = loadOffer()
  return {
    currentCtc: o.ctcAnnual,
    currentVariable: o.variableAnnual,
    currentState: o.state,
    nextCtc: Math.round(o.ctcAnnual * 1.3),
    nextVariable: o.variableAnnual,
    nextState: o.state,
    nextBasicPercent: o.basicPercent,
    haircut: false,
  }
}

function skeleton(): Draft {
  return {
    currentCtc: DEFAULT_OFFER.ctcAnnual,
    currentVariable: DEFAULT_OFFER.variableAnnual,
    currentState: DEFAULT_OFFER.state,
    nextCtc: Math.round(DEFAULT_OFFER.ctcAnnual * 1.3),
    nextVariable: DEFAULT_OFFER.variableAnnual,
    nextState: DEFAULT_OFFER.state,
    nextBasicPercent: DEFAULT_OFFER.basicPercent,
    haircut: false,
  }
}

function asOffer(
  ctc: number,
  variable: number,
  state: StateCode,
  template: OfferInput,
  kind: 'current' | 'next',
  basicPercent?: number,
): OfferInput {
  const offer: OfferInput = { ...template, ctcAnnual: ctc, variableAnnual: variable, state }
  if (kind === 'next') {
    return {
      ...offer,
      basicPercent: basicPercent ?? offer.basicPercent,
      joiningBonus: undefined,
      old: {
        rentPaidMonthly: 0,
        metro: false,
        deduction80CExtra: 0,
        deduction80D: 0,
      },
    }
  }
  return offer
}

export default function RealHikeTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="real-hike">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const { lang } = useLang()
  const [draft, setDraft] = useState<Draft>(skeleton)
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

  const result = useMemo(
    () =>
      realHike({
        current: asOffer(draft.currentCtc, draft.currentVariable, draft.currentState, template, 'current'),
        next: asOffer(draft.nextCtc, draft.nextVariable, draft.nextState, template, 'next', draft.nextBasicPercent),
        variablePayout: draft.haircut ? 0.7 : 1,
      }),
    [draft, template],
  )

/** Untouched fixture on first paint = worked example, not the user's data. */
  const isExample = JSON.stringify(draft) === JSON.stringify(skeleton())
  const paper = Math.round(result.ctcHikePct)
  const bank = Math.round(result.inHandHikePct)
  const verdict = t('real-hike.verdict', { paper, bank })
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))
  const states = (Object.keys(STATE_NAMES) as StateCode[]).map((s) => ({
    value: s,
    label: t(`state.${s}`),
  }))

  const copyText = [
    verdict,
    `${t('real-hike.row.paper')}: ${formatLPA(result.currentCtc)} → ${formatLPA(result.nextCtc)} (${paper}%)`,
    `${t('real-hike.row.bank')}: ${formatINR(result.currentRunRateMonthly)} → ${formatINR(result.nextRunRateMonthly)}/mo (${bank}%)`,
    t('ui.disclaimer'),
  ].join('\n')

  return (
    <div data-tool="real-hike" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('real-hike.formTitle')}</h2>
        <MoneyField label={t('real-hike.currentCtc')} hint={t('ui.money.hint')} value={draft.currentCtc} onChange={(v) => set({ currentCtc: v })} />
        <MoneyField
          label={t('real-hike.currentVariable')}
          hint={t('ui.money.hint')}
          value={draft.currentVariable}
          onChange={(v) => set({ currentVariable: v })}
        />
        <Select label={t('real-hike.currentState')} value={draft.currentState} onChange={(v) => set({ currentState: v })} options={states} />
        <MoneyField label={t('real-hike.nextCtc')} hint={t('ui.money.hint')} value={draft.nextCtc} onChange={(v) => set({ nextCtc: v })} />
        <MoneyField
          label={t('real-hike.nextVariable')}
          hint={t('ui.money.hint')}
          value={draft.nextVariable}
          onChange={(v) => set({ nextVariable: v })}
        />
        <Select label={t('real-hike.nextState')} value={draft.nextState} onChange={(v) => set({ nextState: v })} options={states} />
        <NumberField
          label={t('real-hike.nextBasic')}
          hint={t('real-hike.nextBasicHint')}
          suffix="%"
          max={100}
          value={draft.nextBasicPercent}
          onChange={(v) => set({ nextBasicPercent: Math.min(100, v) })}
        />
        <Toggle
          label={t('real-hike.haircut')}
          hint={t('real-hike.haircutHint')}
          checked={draft.haircut}
          onChange={(v) => set({ haircut: v })}
        />
        <InheritNote text={t('ui.inherit')} linkLabel={t('ui.inheritLink')} href={withLang(lang, 'decoder')} />
      </Card>

      <div className="-order-1 space-y-4 lg:order-none">
        {isExample ? (
          <ExampleNote chip={t('ui.exampleChip')} note={t('ui.exampleNote')} />
        ) : (
          <VerdictBanner tone={bank < paper ? 'amber' : 'leaf'}>{verdict}</VerdictBanner>
        )}
        <Card className="space-y-2">
          <p className="tnum text-[13px]">
            {t('real-hike.row.paper')}: {formatLPA(result.currentCtc)} → {formatLPA(result.nextCtc)} ({paper}%)
          </p>
          <p className="tnum text-[13px]">
            {t('real-hike.row.bank')}: {formatINR(result.currentRunRateMonthly)} → {formatINR(result.nextRunRateMonthly)}/mo ({bank}%)
          </p>
          {result.joiningBonusExcluded && <p className="text-[13px] text-ink-soft">{t('real-hike.bonusNote')}</p>}
          {result.regimeFlip && <p className="text-[13px] text-amberflag">{t('real-hike.regimeFlip')}</p>}
          {result.haircutApplied && <p className="text-[13px] text-ink-soft">{t('real-hike.haircutNote')}</p>}
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
