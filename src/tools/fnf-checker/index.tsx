import { useEffect, useMemo, useState } from 'react'
import { auditFnF } from '../../engine/fnf'
import { formatINR } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, DateField, Disclaimer, MoneyField, NumberField, Toggle, VerdictBanner } from '../../components/ui'
import { readJson, writeJson } from '../../lib/storage'
import { useT } from '../../i18n'

const STORAGE_KEY = 'switchkarle.fnf.v1' as const

interface Draft {
  joinDate: string
  lastWorkingDay: string
  monthlyBasic: number
  monthlyGross: number
  unpaidLeaveDays: number
  noticeRecovery: number
  gratuityEligible: boolean
}

const DEFAULT_DRAFT: Draft = {
  joinDate: '2021-08-01',
  lastWorkingDay: '2026-08-31',
  monthlyBasic: 80_000,
  monthlyGross: 150_000,
  unpaidLeaveDays: 0,
  noticeRecovery: 0,
  gratuityEligible: true,
}

export default function FnfCheckerTool() {
  return (
    <IslandRoot current="fnf-checker">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setDraft(readJson<Draft>(STORAGE_KEY, DEFAULT_DRAFT))
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, draft)
  }, [draft, hydrated])

  const result = useMemo(
    () =>
      auditFnF({
        joinDate: draft.joinDate,
        lastWorkingDay: draft.lastWorkingDay,
        monthlyBasic: draft.monthlyBasic,
        monthlyGross: draft.monthlyGross,
        unpaidLeaveDays: draft.unpaidLeaveDays,
        payslipLines: [{ id: 'salary', label: t('fnf-checker.salary'), amount: draft.monthlyGross, kind: 'earning' }],
        recoveries:
          draft.noticeRecovery > 0
            ? [{ id: 'notice', label: t('fnf-checker.notice'), amount: draft.noticeRecovery, kind: 'deduction' }]
            : [],
        gratuityEligible: draft.gratuityEligible,
      }),
    [draft, t],
  )

  const verdict =
    result.netPayable < 0
      ? t('fnf-checker.verdict.owe', { amount: formatINR(-result.netPayable) })
      : t('fnf-checker.verdict.pay', { amount: formatINR(result.netPayable) })
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  return (
    <div data-tool="fnf-checker" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('fnf-checker.formTitle')}</h2>
        <DateField label={t('fnf-checker.join')} value={draft.joinDate} onChange={(v) => set({ joinDate: v })} />
        <DateField label={t('fnf-checker.lwd')} value={draft.lastWorkingDay} onChange={(v) => set({ lastWorkingDay: v })} />
        <MoneyField label={t('fnf-checker.basic')} hint={t('ui.money.hint')} value={draft.monthlyBasic} onChange={(v) => set({ monthlyBasic: v })} />
        <MoneyField label={t('fnf-checker.gross')} hint={t('ui.money.hint')} value={draft.monthlyGross} onChange={(v) => set({ monthlyGross: v })} />
        <NumberField label={t('fnf-checker.unpaid')} suffix="days" value={draft.unpaidLeaveDays} onChange={(v) => set({ unpaidLeaveDays: v })} />
        <MoneyField label={t('fnf-checker.noticeAmt')} hint={t('fnf-checker.noticeHint')} value={draft.noticeRecovery} onChange={(v) => set({ noticeRecovery: v })} />
        <Toggle label={t('fnf-checker.gratuity')} checked={draft.gratuityEligible} onChange={(v) => set({ gratuityEligible: v })} />
      </Card>
      <div className="space-y-4">
        <VerdictBanner tone={result.netPayable < 0 ? 'alarm' : 'leaf'}>{verdict}</VerdictBanner>
        <Card>
          <h3 className="mb-2 text-sm font-bold">{t('fnf-checker.audit')}</h3>
          {result.lines.map((line) => (
            <p key={line.label} className="tnum flex justify-between gap-3 text-[13px]">
              <span>{line.label}</span>
              <span>
                {formatINR(line.claimed)} → {formatINR(line.recomputed)}
                {line.delta !== 0 ? ` (${formatINR(line.delta)})` : ''}
              </span>
            </p>
          ))}
        </Card>
        {result.flags.map((f) => (
          <p key={f.id} className={`text-[13px] ${f.severity === 'red' ? 'text-alarm' : 'text-amberflag'}`}>
            {f.title} — {f.detail}
          </p>
        ))}
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
