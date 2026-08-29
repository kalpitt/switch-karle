import { useEffect, useMemo, useState } from 'react'
import type { OfferInput } from '../../engine/types'
import { decodeOffer } from '../../engine/salary'
import { bonusClawback } from '../../engine/clawback'
import { addMonths, monthsBetween, todayUTC } from '../../engine/dates'
import { formatINR } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import {
  Card,
  DateField,
  Disclaimer,
  ExampleNote,
  MoneyField,
  NumberField,
  Select,
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
  /** The day the bonus actually hit the account — the window runs from here. */
  creditDate: string
  /** Planned last working day. Months served is the gap, not a whole-month count. */
  plannedLwd: string
  noticePeriodDays: number
  netWording: boolean
  /** Taxable income without the bonus. Seeded from the Decoder, editable here. */
  taxableIncome: number
  regime: 'new' | 'old'
}

/** A v1 draft, before the tool asked for dates. */
type LegacyDraft = Partial<Draft> & { plannedTenureMonths?: number }

function draftFrom(offer: OfferInput): Draft {
  const b = decodeOffer(offer)
  const today = todayUTC()
  return {
    amount: offer.joiningBonus?.amount ?? 200_000,
    clawbackMonths: offer.joiningBonus?.clawbackMonths ?? 12,
    creditDate: today,
    plannedLwd: addMonths(today, 6),
    noticePeriodDays: offer.noticePeriodDays,
    netWording: true,
    taxableIncome: b.recommendedRegime === 'new' ? b.newRegime.taxableIncome : b.oldRegime.taxableIncome,
    regime: b.recommendedRegime,
  }
}

/** v1 stored whole months. Re-express that as a last working day and keep the draft. */
function migrate(saved: LegacyDraft | null, base: Draft): Draft | null {
  if (!saved) return null
  if (typeof saved.creditDate === 'string' && typeof saved.plannedLwd === 'string') {
    return { ...base, ...saved } as Draft
  }
  if (typeof saved.plannedTenureMonths !== 'number') return null
  const { plannedTenureMonths, ...rest } = saved
  return {
    ...base,
    ...rest,
    plannedLwd: addMonths(base.creditDate, Math.max(0, Math.round(plannedTenureMonths))),
  }
}

/** Months served between the two dates; a half-filled pair reads as zero. */
function monthsServed(draft: Draft): number {
  try {
    return Math.max(0, monthsBetween(draft.creditDate, draft.plannedLwd))
  } catch {
    return 0
  }
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
  const [draft, setDraft] = useState<Draft>(() => draftFrom(DEFAULT_OFFER))
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const base = draftFrom(loadOffer())
    setDraft(migrate(readJson<LegacyDraft | null>(STORAGE_KEY, null), base) ?? base)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, draft)
  }, [draft, hydrated])

  const served = monthsServed(draft)
  const result = useMemo(
    () =>
      bonusClawback({
        amount: draft.amount,
        clawbackMonths: draft.clawbackMonths,
        plannedTenureMonths: monthsServed(draft),
        taxableIncome: draft.taxableIncome,
        regime: draft.regime,
        noticePeriodDays: draft.noticePeriodDays,
      }),
    [draft],
  )

  /** Untouched fixture on first paint = worked example, not the user's data. */
  const isExample = JSON.stringify(draft) === JSON.stringify(draftFrom(DEFAULT_OFFER))
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
  const servedLine = t('bonus-clawback.served', {
    months: served.toFixed(1),
    window: draft.clawbackMonths,
  })

  const copyText = [
    verdict,
    servedLine,
    t('bonus-clawback.tax', { amount: formatINR(result.taxOnBonus) }),
    t('bonus-clawback.marginal', { pct: Math.round(result.effectiveRate * 100) }),
    t('ui.disclaimer'),
  ].join('\n')

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))
  const wanted = new Set([0, Math.min(Math.floor(served), draft.clawbackMonths), draft.clawbackMonths])
  const sample = result.curve.filter((p) => wanted.has(p.exitMonth))

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
        <DateField
          label={t('bonus-clawback.creditDate')}
          hint={t('bonus-clawback.creditDateHint')}
          value={draft.creditDate}
          onChange={(v) => set({ creditDate: v })}
        />
        <DateField
          label={t('bonus-clawback.plannedLwd')}
          hint={t('bonus-clawback.plannedLwdHint')}
          value={draft.plannedLwd}
          onChange={(v) => set({ plannedLwd: v })}
        />
        <NumberField
          label={t('bonus-clawback.notice')}
          suffix={t('unit.days')}
          value={draft.noticePeriodDays}
          onChange={(v) => set({ noticePeriodDays: v })}
        />
        <MoneyField
          label={t('bonus-clawback.taxableIncome')}
          hint={t('bonus-clawback.taxableIncomeHint')}
          value={draft.taxableIncome}
          onChange={(v) => set({ taxableIncome: v })}
        />
        <Select
          label={t('bonus-clawback.regime')}
          value={draft.regime}
          onChange={(v) => set({ regime: v })}
          options={[
            { value: 'new', label: t('regime.new') },
            { value: 'old', label: t('regime.old') },
          ]}
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
          <p className="tnum text-[13px] font-semibold">{servedLine}</p>
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
