import { useEffect, useMemo, useState } from 'react'
import { IslandRoot } from '../../components/IslandRoot'
import {
  Card,
  Disclaimer,
  ExampleNote,
  MoneyField,
  NumberField,
  Select,
  Toggle,
  VerdictBanner,
} from '../../components/ui'
import { taxDeclaration } from '../../engine/taxDeclaration'
import { formatINR } from '../../engine/format'
import { STATE_NAMES } from '../../engine/professionalTax'
import type { OfferInput, StateCode } from '../../engine/types'
import { DEFAULT_OFFER, loadOffer } from '../../data/defaults'
import { readJson, writeJson } from '../../lib/storage'
import { withLang } from '../../lib/langPath'
import { useLang, useT, type Lang } from '../../i18n'

const STORAGE_KEY = 'switchkarle.tax-declaration.v1' as const

interface Draft {
  claimingHra: boolean
  extra80C: boolean
}

const DEFAULT: Draft = { claimingHra: true, extra80C: false }

const EMPTY_OLD = { rentPaidMonthly: 0, metro: false, deduction80CExtra: 0, deduction80D: 0 }

export default function TaxDeclarationTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="tax-declaration">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const { lang } = useLang()
  const [draft, setDraft] = useState<Draft>(DEFAULT)
  const [offer, setOffer] = useState<OfferInput>(DEFAULT_OFFER)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setOffer(loadOffer())
    setDraft(readJson<Draft>(STORAGE_KEY, DEFAULT))
    setHydrated(true)
  }, [])
  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, draft)
  }, [draft, hydrated])

  const result = useMemo(() => taxDeclaration({ offer, ...draft }), [offer, draft])
  /** Untouched fixture on first paint = worked example. The money comes from
   *  the Decoder's offer, so both it and the toggles have to be untouched. */
  const isExample =
    JSON.stringify(draft) === JSON.stringify(DEFAULT) &&
    JSON.stringify(offer) === JSON.stringify(DEFAULT_OFFER)
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))
  const old = offer.old ?? EMPTY_OLD
  const states = (Object.keys(STATE_NAMES) as StateCode[]).map((s) => ({ value: s, label: t(`state.${s}`) }))

  return (
    <div data-tool="tax-declaration" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('tax-declaration.formTitle')}</h2>
        <p className="text-[13px] leading-relaxed text-ink-soft">{t('tax-declaration.profileHint')}</p>
        <p className="text-[13px]">
          <a href={withLang(lang, 'decoder')} className="font-semibold underline">
            {t('tax-declaration.openDecoder')}
          </a>
        </p>
        <MoneyField
          label={t('tax-declaration.ctc')}
          value={offer.ctcAnnual}
          onChange={(v) => setOffer((o) => ({ ...o, ctcAnnual: v }))}
        />
        <NumberField
          label={t('tax-declaration.basic')}
          value={offer.basicPercent}
          suffix="%"
          max={100}
          onChange={(v) => setOffer((o) => ({ ...o, basicPercent: v }))}
        />
        <MoneyField
          label={t('tax-declaration.rent')}
          value={old.rentPaidMonthly}
          onChange={(v) => setOffer((o) => ({ ...o, old: { ...old, rentPaidMonthly: v } }))}
        />
        <Select
          label={t('tax-declaration.state')}
          value={offer.state}
          onChange={(v) => setOffer((o) => ({ ...o, state: v }))}
          options={states}
        />
        <Toggle
          label={t('tax-declaration.hra')}
          hint={t('tax-declaration.hraHint')}
          checked={draft.claimingHra}
          onChange={(v) => set({ claimingHra: v })}
        />
        <Toggle label={t('tax-declaration.80c')} checked={draft.extra80C} onChange={(v) => set({ extra80C: v })} />
      </Card>
      <div className="-order-1 space-y-4 lg:order-none">
        {isExample ? (
          <ExampleNote chip={t('ui.exampleChip')} note={t('ui.exampleNote')} />
        ) : (
          <VerdictBanner tone={result.recommendedRegime === 'new' ? 'leaf' : 'amber'}>
            {t(result.recommendedRegime === 'new' ? 'tax-declaration.verdict.new' : 'tax-declaration.verdict.old')}
          </VerdictBanner>
        )}
        <Card className="space-y-2">
          <p className="tnum text-[13px]">{t('tax-declaration.hraRow', { amount: formatINR(result.hraExemptionAnnual) })}</p>
          {result.recommendedRegime === 'new' && <p className="text-[13px] text-ink-soft">{t('tax-declaration.hraUseless')}</p>}
          <h3 className="pt-2 text-sm font-bold">{t('tax-declaration.proofs')}</h3>
          {result.proofIds.map((id) => (
            <p key={id} className="text-[13px] leading-relaxed text-ink-soft">
              {t(`tax-declaration.proof.${id}`)}
            </p>
          ))}
        </Card>
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
