import { useEffect, useMemo, useState } from 'react'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, Disclaimer, Toggle, VerdictBanner } from '../../components/ui'
import { taxDeclaration } from '../../engine/taxDeclaration'
import { formatINR } from '../../engine/format'
import { DEFAULT_OFFER, loadOffer } from '../../data/defaults'
import { readJson, writeJson } from '../../lib/storage'
import { useT } from '../../i18n'
import type { OfferInput } from '../../engine/types'

const STORAGE_KEY = 'switchkarle.tax-declaration.v1' as const

interface Draft {
  claimingHra: boolean
  extra80C: boolean
}

const DEFAULT: Draft = { claimingHra: true, extra80C: false }

export default function TaxDeclarationTool() {
  return (
    <IslandRoot current="tax-declaration">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
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
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  return (
    <div data-tool="tax-declaration" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('tax-declaration.formTitle')}</h2>
        <Toggle
          label={t('tax-declaration.hra')}
          hint={t('tax-declaration.hraHint')}
          checked={draft.claimingHra}
          onChange={(v) => set({ claimingHra: v })}
        />
        <Toggle label={t('tax-declaration.80c')} checked={draft.extra80C} onChange={(v) => set({ extra80C: v })} />
      </Card>
      <div className="space-y-4">
        <VerdictBanner tone={result.recommendedRegime === 'new' ? 'leaf' : 'amber'}>
          {t(result.recommendedRegime === 'new' ? 'tax-declaration.verdict.new' : 'tax-declaration.verdict.old')}
        </VerdictBanner>
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
