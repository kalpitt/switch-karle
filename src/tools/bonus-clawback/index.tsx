import { useEffect, useMemo, useState } from 'react'
import { decodeOffer } from '../../engine/salary'
import { bonusClawback } from '../../engine/clawback'
import { formatINR } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import {
  Card,
  Disclaimer,
  ExampleNote,
  MoneyField,
  NumberField,
  ShareRow,
  Toggle,
  VerdictBanner,
} from '../../components/ui'
import { DEFAULT_OFFER, loadOffer } from '../../data/defaults'
import { readJson, writeJson } from '../../lib/storage'
import { useT, type Lang } from '../../i18n'

const STORAGE_KEY = 'switchkarle.clawback.v1' as const

interface Draft {
  amount: number
  clawbackMonths: number
  plannedTenureMonths: number
  noticePeriodDays: number
  netWording: boolean
}

function fromDecoder(): Draft {
  const o = loadOffer()
  return {
    amount: o.joiningBonus?.amount ?? 200_000,
    clawbackMonths: o.joiningBonus?.clawbackMonths ?? 12,
    plannedTenureMonths: 6,
    noticePeriodDays: o.noticePeriodDays,
    netWording: true,
  }
}

/** What first paint shows when the Decoder has not seeded anything. */
const FIXTURE: Draft = {
  amount: 200_000,
  clawbackMonths: 12,
  plannedTenureMonths: 6,
  noticePeriodDays: DEFAULT_OFFER.noticePeriodDays,
  netWording: true,
}

export default function BonusClawbackTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="bonus-clawback">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [draft, setDraft] = useState<Draft>(FIXTURE)
  const [taxableIncome, setTaxableIncome] = useState(1_800_000)
  const [regime, setRegime] = useState<'new' | 'old'>('new')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const offer = loadOffer()
    const b = decodeOffer(offer)
    setTaxableIncome(b.recommendedRegime === 'new' ? b.newRegime.taxableIncome : b.oldRegime.taxableIncome)
    setRegime(b.recommendedRegime)
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
      bonusClawback({
        amount: draft.amount,
        clawbackMonths: draft.clawbackMonths,
        plannedTenureMonths: draft.plannedTenureMonths,
        taxableIncome,
        regime,
        noticePeriodDays: draft.noticePeriodDays,
      }),
    [draft, taxableIncome, regime],
  )

/** Untouched fixture on first paint = worked example, not the user's data. */
  const isExample = JSON.stringify(draft) === JSON.stringify(FIXTURE)
  const tone = result.effectiveValueAtPlanned < 0 ? 'alarm' : result.repaymentIfLeaveAtPlanned > 0 ? 'amber' : 'leaf'
  const verdict = draft.netWording
    ? t('bonus-clawback.verdict.net', {
        net: formatINR(result.netReceived),
        repay: formatINR(result.repaymentIfLeaveAtPlanned),
        keep: formatINR(result.effectiveValueAtPlanned),
      })
    : t('bonus-clawback.verdict.gross', {
        gross: formatINR(draft.amount),
        repay: formatINR(result.repaymentIfLeaveAtPlanned),
      })

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))
  const wanted = new Set([0, Math.min(draft.plannedTenureMonths, draft.clawbackMonths), draft.clawbackMonths])
  const sample = result.curve.filter((p) => wanted.has(p.exitMonth))

  const copyText = [
    verdict,
    t('bonus-clawback.tax', { amount: formatINR(result.taxOnBonus) }),
    t('bonus-clawback.marginal', { pct: Math.round(result.effectiveRate * 100) }),
    t('ui.disclaimer'),
  ].join('\n')

  return (
    <div data-tool="bonus-clawback" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('bonus-clawback.formTitle')}</h2>
        <MoneyField label={t('bonus-clawback.amount')} hint={t('ui.money.hint')} value={draft.amount} onChange={(v) => set({ amount: v })} />
        <NumberField
          label={t('bonus-clawback.window')}
          suffix={t('unit.months')}
          value={draft.clawbackMonths}
          onChange={(v) => set({ clawbackMonths: v })}
        />
        <NumberField
          label={t('bonus-clawback.tenure')}
          suffix={t('unit.months')}
          value={draft.plannedTenureMonths}
          onChange={(v) => set({ plannedTenureMonths: v })}
        />
        <NumberField
          label={t('bonus-clawback.notice')}
          suffix={t('unit.days')}
          value={draft.noticePeriodDays}
          onChange={(v) => set({ noticePeriodDays: v })}
        />
        <Toggle label={t('bonus-clawback.netMode')} hint={t('bonus-clawback.netModeHint')} checked={draft.netWording} onChange={(v) => set({ netWording: v })} />
      </Card>

      <div className="-order-1 space-y-4 lg:order-none">
        {isExample ? (
          <ExampleNote chip={t('ui.exampleChip')} note={t('ui.exampleNote')} />
        ) : (
          <VerdictBanner tone={tone}>{verdict}</VerdictBanner>
        )}
        <Card className="space-y-2">
          <p className="tnum text-[13px]">{t('bonus-clawback.tax', { amount: formatINR(result.taxOnBonus) })}</p>
          <p className="tnum text-[13px]">{t('bonus-clawback.marginal', { pct: Math.round(result.effectiveRate * 100) })}</p>
          {result.noticeWouldCoverClawback && <p className="text-[13px] text-amberflag">{t('bonus-clawback.noticeOverlap')}</p>}
          <p className="text-[13px] text-ink-soft">{t('bonus-clawback.allOrNothing')}</p>
          <p className="text-[13px] text-ink-soft">{t('bonus-clawback.taxRecovery')}</p>
        </Card>
        <Card>
          <h3 className="mb-2 text-sm font-bold">{t('bonus-clawback.curve')}</h3>
          {sample.map((p) => (
            <p key={p.exitMonth} className="tnum flex justify-between text-[13px]">
              <span>{t('bonus-clawback.point', { month: p.exitMonth })}</span>
              <span>
                {t('bonus-clawback.repay')}: {formatINR(p.repayGross)} · {t('bonus-clawback.keep')}: {formatINR(p.netIfExit)}
              </span>
            </p>
          ))}
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
