import { useEffect, useMemo, useState } from 'react'
import { decodeOffer } from '../../engine/salary'
import { formatINR, formatLPA } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, Disclaimer, InheritNote, MoneyField, ResultHero, ShareRow, Toggle } from '../../components/ui'
import { PrivacyLine } from '../../components/PrivacyLine'
import { DEFAULT_OFFER, loadOffer } from '../../data/defaults'
import { readJson, writeJson } from '../../lib/storage'
import { useT, useLang, type Lang } from '../../i18n'
import { withLang } from '../../lib/langPath'

const STORAGE_KEY = 'switchkarle.counter.v1' as const

interface Draft {
  currentCtc: number
  counterCtc: number
  outsideCtc: number
  promisedPromo: boolean
  teamStay: boolean
}

/** What first paint shows when the Decoder has not seeded anything. */
const FIXTURE: Draft = {
  currentCtc: DEFAULT_OFFER.ctcAnnual,
  counterCtc: Math.round(DEFAULT_OFFER.ctcAnnual * 1.15),
  outsideCtc: Math.round(DEFAULT_OFFER.ctcAnnual * 1.3),
  promisedPromo: false,
  teamStay: false,
}

export default function CounterOfferTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="counter-offer">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const { lang } = useLang()
  const [draft, setDraft] = useState<Draft>(FIXTURE)
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
/** Untouched fixture on first paint = worked example, not the user's data. */
  const isExample = JSON.stringify(draft) === JSON.stringify(FIXTURE)
  const paperGap = draft.outsideCtc - draft.counterCtc
  const bankGap = outside.inHandMonthly - counter.inHandMonthly
  const verdict =
    paperGap > 0
      ? t('counter-offer.verdict.out', { paper: formatLPA(paperGap), bank: formatINR(bankGap) })
      : t('counter-offer.verdict.in')
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  const copyText = [verdict, t('counter-offer.honest'), t('ui.disclaimer')].join('\n')

  return (
    <div data-tool="counter-offer" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-20">
        <h2 className="text-[18px] font-semibold leading-snug">{t('counter-offer.formTitle')}</h2>
        <PrivacyLine />
        <MoneyField label={t('counter-offer.current')} placeholder={t('ui.money.placeholder')} value={draft.currentCtc} onChange={(v) => set({ currentCtc: v })} />
        <MoneyField label={t('counter-offer.counter')} placeholder={t('ui.money.placeholder')} value={draft.counterCtc} onChange={(v) => set({ counterCtc: v })} />
        <MoneyField label={t('counter-offer.outside')} placeholder={t('ui.money.placeholder')} value={draft.outsideCtc} onChange={(v) => set({ outsideCtc: v })} />
        <Toggle label={t('counter-offer.promo')} checked={draft.promisedPromo} onChange={(v) => set({ promisedPromo: v })} />
        <Toggle label={t('counter-offer.team')} checked={draft.teamStay} onChange={(v) => set({ teamStay: v })} />
        <InheritNote text={t('ui.inherit')} linkLabel={t('ui.inheritLink')} href={withLang(lang, 'decoder')} />
      </Card>
      <div className="-order-1 space-y-4 lg:order-none">
        <ResultHero
          sample={isExample}
          label={t('hero.counter-offer')}
          value={paperGap > 0 ? formatINR(bankGap) : undefined}
          unit={t('unit.perMonth')}
          verdict={verdict}
          tone={paperGap > 0 ? 'amber' : 'leaf'}
        />
        <p className="text-[14px] leading-relaxed text-ink-soft">{t('counter-offer.honest')}</p>
        {(draft.promisedPromo || draft.teamStay) && (
          <p className="text-[14px] leading-relaxed text-ink-soft">{t('counter-offer.nonRupee')}</p>
        )}
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
