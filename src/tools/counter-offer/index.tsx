import { useEffect, useMemo, useState } from 'react'
import { decodeOffer } from '../../engine/salary'
import { formatINR, formatLPA } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, Disclaimer, MoneyField, Toggle, VerdictBanner } from '../../components/ui'
import { DEFAULT_OFFER, loadOffer } from '../../data/defaults'
import { readJson, writeJson } from '../../lib/storage'
import { useT } from '../../i18n'

const STORAGE_KEY = 'switchkarle.counter.v1' as const

interface Draft {
  currentCtc: number
  counterCtc: number
  outsideCtc: number
  promisedPromo: boolean
  teamStay: boolean
}

export default function CounterOfferTool() {
  return (
    <IslandRoot current="counter-offer">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [draft, setDraft] = useState<Draft>({
    currentCtc: DEFAULT_OFFER.ctcAnnual,
    counterCtc: Math.round(DEFAULT_OFFER.ctcAnnual * 1.15),
    outsideCtc: Math.round(DEFAULT_OFFER.ctcAnnual * 1.3),
    promisedPromo: false,
    teamStay: false,
  })
  const [hydrated, setHydrated] = useState(false)
  const [template, setTemplate] = useState(DEFAULT_OFFER)

  useEffect(() => {
    const o = loadOffer()
    setTemplate(o)
    const saved = readJson<Draft | null>(STORAGE_KEY, null)
    setDraft(
      saved ?? {
        currentCtc: o.ctcAnnual,
        counterCtc: Math.round(o.ctcAnnual * 1.15),
        outsideCtc: Math.round(o.ctcAnnual * 1.3),
        promisedPromo: false,
        teamStay: false,
      },
    )
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, draft)
  }, [draft, hydrated])

  const counter = useMemo(() => decodeOffer({ ...template, ctcAnnual: draft.counterCtc }), [template, draft.counterCtc])
  const outside = useMemo(() => decodeOffer({ ...template, ctcAnnual: draft.outsideCtc }), [template, draft.outsideCtc])
  const paperGap = draft.outsideCtc - draft.counterCtc
  const bankGap = outside.inHandMonthly - counter.inHandMonthly
  const verdict =
    paperGap > 0
      ? t('counter-offer.verdict.out', { paper: formatLPA(paperGap), bank: formatINR(bankGap) })
      : t('counter-offer.verdict.in')
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  return (
    <div data-tool="counter-offer" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('counter-offer.formTitle')}</h2>
        <MoneyField label={t('counter-offer.current')} hint={t('ui.money.hint')} value={draft.currentCtc} onChange={(v) => set({ currentCtc: v })} />
        <MoneyField label={t('counter-offer.counter')} hint={t('ui.money.hint')} value={draft.counterCtc} onChange={(v) => set({ counterCtc: v })} />
        <MoneyField label={t('counter-offer.outside')} hint={t('ui.money.hint')} value={draft.outsideCtc} onChange={(v) => set({ outsideCtc: v })} />
        <Toggle label={t('counter-offer.promo')} checked={draft.promisedPromo} onChange={(v) => set({ promisedPromo: v })} />
        <Toggle label={t('counter-offer.team')} checked={draft.teamStay} onChange={(v) => set({ teamStay: v })} />
      </Card>
      <div className="space-y-4">
        <VerdictBanner tone={paperGap > 0 ? 'amber' : 'leaf'}>{verdict}</VerdictBanner>
        <p className="text-[13px] leading-relaxed text-ink-soft">{t('counter-offer.honest')}</p>
        {(draft.promisedPromo || draft.teamStay) && (
          <p className="text-[13px] text-ink-soft">{t('counter-offer.nonRupee')}</p>
        )}
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
