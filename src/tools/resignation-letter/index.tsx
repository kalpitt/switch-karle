import { useEffect, useMemo, useState } from 'react'
import { addDays, epfoDateOverlap, lastWorkingDay } from '../../engine/dates'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, CopyButton, DateField, Disclaimer, NumberField, Select, TextField, VerdictBanner } from '../../components/ui'
import { loadCurrentJob, rememberCurrentJob } from '../../data/currentJob'
import { readJson, writeJson } from '../../lib/storage'
import { useT, type Lang } from '../../i18n'

const STORAGE_KEY = 'switchkarle.resignation.v1' as const

type Tone = 'professional' | 'grateful' | 'firm'

interface Draft {
  company: string
  manager: string
  role: string
  yourName: string
  empId: string
  resignDate: string
  noticeDays: number
  newJoinDate: string
  tone: Tone
}

/** Local calendar date, not UTC — a 1 AM IST resignation must not say yesterday. */
function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function ResignationLetterTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="resignation-letter">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [draft, setDraft] = useState<Draft>({
    company: '',
    manager: '',
    role: '',
    yourName: '',
    empId: '',
    resignDate: todayISO(),
    noticeDays: 90,
    newJoinDate: '',
    tone: 'professional',
  })
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // The letter goes to the current employer, so the notice period is the
    // current job's — from the shared record, never the new offer's.
    const job = loadCurrentJob()
    const saved = readJson<Draft | null>(STORAGE_KEY, null)
    setDraft(
      saved
        ? { ...saved, noticeDays: job.noticePeriodDays ?? saved.noticeDays }
        : {
            company: '',
            manager: '',
            role: '',
            yourName: '',
            empId: '',
            resignDate: todayISO(),
            noticeDays: job.noticePeriodDays ?? 90,
            newJoinDate: '',
            tone: 'professional',
          },
    )
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, draft)
  }, [draft, hydrated])

  const notice = Math.max(1, Math.round(draft.noticeDays) || 1)
  const lwd = useMemo(() => {
    try {
      return lastWorkingDay(draft.resignDate, notice)
    } catch {
      return draft.resignDate
    }
  }, [draft.resignDate, notice])

  const overlap =
    draft.newJoinDate.trim().length >= 10 &&
    (() => {
      try {
        return epfoDateOverlap(lwd, draft.newJoinDate)
      } catch {
        return false
      }
    })()

  /** EPFO's portal balks at two employers on overlapping days, so the first
   *  date that cannot overlap is the day after the last working day. */
  const earliestSafeJoin = useMemo(() => {
    try {
      return addDays(lwd, 1)
    } catch {
      return ''
    }
  }, [lwd])

  const letter = useMemo(() => buildLetter(draft, lwd, t), [draft, lwd, t])
  const canCopy =
    draft.yourName.trim() !== '' &&
    draft.manager.trim() !== '' &&
    draft.company.trim() !== '' &&
    draft.role.trim() !== '' &&
    !letter.includes('[')
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  return (
    <div data-tool="resignation-letter" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('resignation-letter.formTitle')}</h2>
        <p className="text-xs leading-snug text-ink-faint">{t('resignation-letter.formHint')}</p>
        <TextField label={t('resignation-letter.company')} value={draft.company} onChange={(v) => set({ company: v })} />
        <TextField label={t('resignation-letter.manager')} value={draft.manager} onChange={(v) => set({ manager: v })} />
        <TextField label={t('resignation-letter.role')} value={draft.role} onChange={(v) => set({ role: v })} />
        <TextField
          label={t('resignation-letter.yourName')}
          hint={t('resignation-letter.yourNameHint')}
          value={draft.yourName}
          onChange={(v) => set({ yourName: v })}
        />
        <TextField
          label={t('resignation-letter.empId')}
          hint={t('resignation-letter.empIdHint')}
          value={draft.empId}
          onChange={(v) => set({ empId: v })}
        />
        <DateField label={t('resignation-letter.date')} value={draft.resignDate} onChange={(v) => set({ resignDate: v })} />
        <NumberField
          label={t('resignation-letter.notice')}
          suffix={t('unit.days')}
          value={draft.noticeDays}
          onChange={(v) => {
            set({ noticeDays: v })
            rememberCurrentJob({ noticePeriodDays: v })
          }}
        />
        <DateField
          label={t('resignation-letter.join')}
          hint={t('resignation-letter.joinHint')}
          value={draft.newJoinDate}
          onChange={(v) => set({ newJoinDate: v })}
        />
        <Select
          label={t('resignation-letter.tone')}
          value={draft.tone}
          onChange={(v) => set({ tone: v })}
          options={[
            { value: 'professional', label: t('resignation-letter.tone.professional') },
            { value: 'grateful', label: t('resignation-letter.tone.grateful') },
            { value: 'firm', label: t('resignation-letter.tone.firm') },
          ]}
        />
      </Card>
      <div className="-order-1 space-y-4 lg:order-none">
        <VerdictBanner>{t('resignation-letter.verdict', { lwd })}</VerdictBanner>
        {overlap && <p className="text-[13px] text-amberflag">{t('resignation-letter.epfo')}</p>}
        {earliestSafeJoin !== '' && (
          <p className="tnum text-[13px] text-ink-soft">
            {t('resignation-letter.earliestJoin', { date: earliestSafeJoin })}
          </p>
        )}
        <Card>
          <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed">{letter}</pre>
          <div className="mt-4">
            {canCopy ? (
              <CopyButton text={letter} label={t('ui.copy')} copiedLabel={t('ui.copied')} />
            ) : (
              <p className="text-[13px] font-semibold text-amberflag">{t('resignation-letter.copyBlocked')}</p>
            )}
          </div>
        </Card>
        <Disclaimer>{t('hr.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}

function buildLetter(d: Draft, lwd: string, t: (k: string, v?: Record<string, string | number>) => string): string {
  const company = d.company.trim() || '[Company]'
  const manager = d.manager.trim() || '[Manager name]'
  const role = d.role.trim() || '[Role]'
  const opening = t(`resignation-letter.body.${d.tone}`, { manager, company, role, date: d.resignDate, lwd })
  const empIdLine = d.empId.trim() ? `\nEmployee ID: ${d.empId.trim()}` : ''
  return `${opening}\n${d.yourName.trim()}${empIdLine}`
}
