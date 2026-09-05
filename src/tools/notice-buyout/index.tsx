import { useEffect, useMemo, useState } from 'react'
import { buyoutQuote } from '../../engine/noticeBuyout'
import { formatINR } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import {
  Card,
  Disclaimer,
  ExampleNote,
  MoneyField,
  NumberField,
  Select,
  ShareRow,
  VerdictBanner,
} from '../../components/ui'
import { applyCurrentJob, loadCurrentJob, rememberCurrentJob } from '../../data/currentJob'
import { readJson, writeJson } from '../../lib/storage'
import { useT, type Lang } from '../../i18n'

const STORAGE_KEY = 'switchkarle.notice-buyout.v1' as const

interface Draft {
  basis: 'basic' | 'gross'
  mode: 'pay' | 'recover'
  unservedDays: number
  /** Accrued leave the employer agrees to set against the unserved days. */
  leaveDaysApplied: number
  monthlyBasic: number
  monthlyGross: number
}

/** Pure fixture — what first paint shows when neither storage nor the current-job record fills it. */
const PURE_DEFAULT: Draft = {
  basis: 'basic',
  mode: 'pay',
  unservedDays: 30,
  leaveDaysApplied: 0,
  monthlyBasic: 80_000,
  monthlyGross: 150_000,
}

export default function NoticeBuyoutTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="notice-buyout">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [draft, setDraft] = useState<Draft>(PURE_DEFAULT)
  const [hydrated, setHydrated] = useState(false)
  /** What first paint showed when nothing was saved here; the example the user has not yet edited. */
  const [example, setExample] = useState<Draft | null>(PURE_DEFAULT)

  useEffect(() => {
    // Current pay comes from the current-job record, never from the Decoder:
    // a buyout is owed to the current employer out of current pay, and the
    // Decoder holds the NEW offer. Unserved days start at the full notice
    // period — the figure if you walked out today — and are this tool's own.
    const job = loadCurrentJob()
    const fill = (d: Draft) =>
      applyCurrentJob(d, job, {
        monthlyBasic: 'monthlyBasic',
        monthlyGross: 'monthlyGross',
        noticePeriodDays: 'unservedDays',
      })
    const saved = readJson<Partial<Draft> | null>(STORAGE_KEY, null)
    if (saved) {
      // Spread over the fixture so a draft saved before leave netting existed
      // hydrates with zero leave rather than undefined.
      setDraft(fill({ ...PURE_DEFAULT, ...saved }))
      setExample(null)
    } else {
      const boot = fill(PURE_DEFAULT)
      setDraft(boot)
      setExample(boot)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, draft)
  }, [draft, hydrated])

  const result = useMemo(() => buyoutQuote(draft), [draft])
  const resultOnOtherBasis = useMemo(
    () => buyoutQuote({ ...draft, basis: draft.basis === 'basic' ? 'gross' : 'basic' }),
    [draft],
  )
  /** Nothing typed in this tool yet = worked example, even where the record filled a field. */
  const isExample = JSON.stringify(draft) === JSON.stringify(example ?? PURE_DEFAULT)
  const verdict =
    draft.mode === 'pay'
      ? t('notice-buyout.verdict.pay', { amount: formatINR(result.amount) })
      : t('notice-buyout.verdict.recover', { amount: formatINR(result.amount) })
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  const copyText = [
    verdict,
    `${t('notice-buyout.row.basic')}: ${formatINR(result.basis === 'basic' ? result.amount : resultOnOtherBasis.amount)}`,
    `${t('notice-buyout.row.gross')}: ${formatINR(result.basis === 'gross' ? result.amount : resultOnOtherBasis.amount)}`,
    t('ui.disclaimer'),
  ].join('\n')

  return (
    <div data-tool="notice-buyout" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('notice-buyout.formTitle')}</h2>
        <Select
          label={t('notice-buyout.basis')}
          value={draft.basis}
          onChange={(v) => set({ basis: v })}
          options={[
            { value: 'basic', label: t('notice-buyout.basis.basic') },
            { value: 'gross', label: t('notice-buyout.basis.gross') },
          ]}
        />
        <Select
          label={t('notice-buyout.mode')}
          value={draft.mode}
          onChange={(v) => set({ mode: v })}
          options={[
            { value: 'pay', label: t('notice-buyout.mode.pay') },
            { value: 'recover', label: t('notice-buyout.mode.recover') },
          ]}
        />
        <NumberField
          label={t('notice-buyout.days')}
          suffix={t('unit.days')}
          value={draft.unservedDays}
          onChange={(v) => set({ unservedDays: v })}
        />
        <NumberField
          label={t('notice-buyout.leaveDays')}
          hint={t('notice-buyout.leaveDaysHint')}
          suffix={t('unit.days')}
          max={draft.unservedDays}
          value={draft.leaveDaysApplied}
          onChange={(v) => set({ leaveDaysApplied: Math.min(draft.unservedDays, v) })}
        />
        <MoneyField
          label={t('notice-buyout.basic')}
          hint={t('ui.money.hint')}
          value={draft.monthlyBasic}
          onChange={(v) => {
            set({ monthlyBasic: v })
            rememberCurrentJob({ monthlyBasic: v })
          }}
        />
        <MoneyField
          label={t('notice-buyout.gross')}
          hint={t('ui.money.hint')}
          value={draft.monthlyGross}
          onChange={(v) => {
            set({ monthlyGross: v })
            rememberCurrentJob({ monthlyGross: v })
          }}
        />
        <p className="text-xs leading-snug text-ink-faint">{t('ui.currentJob')}</p>
      </Card>
      <div className="-order-1 space-y-4 lg:order-none">
        {isExample ? (
          <ExampleNote chip={t('ui.exampleChip')} note={t('ui.exampleNote')} />
        ) : (
          <VerdictBanner>{verdict}</VerdictBanner>
        )}
        <Card>
          <h3 className="mb-2 text-sm font-bold">{t('notice-buyout.bothBases')}</h3>
          <p className="tnum flex justify-between gap-3 text-[13px]">
            <span>{t('notice-buyout.row.basic')}</span>
            <span>
              {formatINR(result.basis === 'basic' ? result.dailyRate : resultOnOtherBasis.dailyRate)}
              /day →{' '}
              <span className="font-bold">
                {formatINR(result.basis === 'basic' ? result.amount : resultOnOtherBasis.amount)}
              </span>
            </span>
          </p>
          <p className="tnum mt-1 flex justify-between gap-3 text-[13px]">
            <span>{t('notice-buyout.row.gross')}</span>
            <span>
              {formatINR(result.basis === 'gross' ? result.dailyRate : resultOnOtherBasis.dailyRate)}
              /day →{' '}
              <span className="font-bold">
                {formatINR(result.basis === 'gross' ? result.amount : resultOnOtherBasis.amount)}
              </span>
            </span>
          </p>
        </Card>
        {result.leaveDaysApplied > 0 && (
          <p className="tnum text-[13px] text-ink-soft">
            {t('notice-buyout.leaveApplied', {
              days: result.leaveDaysApplied,
              net: result.unservedDaysNet,
              before: formatINR(result.amountBeforeLeave),
            })}
          </p>
        )}
        <p className="text-[13px] text-ink-soft">{t('notice-buyout.leaveCandidate')}</p>
        <p className="text-[13px] text-ink-soft">{t('notice-buyout.divisor')}</p>
        <p className="text-[13px] text-amberflag">{t('notice-buyout.gstNote')}</p>
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
