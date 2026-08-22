import { useEffect, useMemo, useState } from 'react'
import { epfoDateOverlap, lastWorkingDay } from '../../engine/dates'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, CopyButton, DateField, Disclaimer, NumberField, Select, TextField, VerdictBanner } from '../../components/ui'
import { loadOffer } from '../../data/defaults'
import { readJson, writeJson } from '../../lib/storage'
import { useT } from '../../i18n'

const STORAGE_KEY = 'switchkarle.resignation.v1' as const

type Tone = 'professional' | 'grateful' | 'firm'

interface Draft {
  company: string
  manager: string
  role: string
  resignDate: string
  noticeDays: number
  newJoinDate: string
  tone: Tone
}

function todayISO() {
  const d = new Date()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

export default function ResignationLetterTool() {
  return (
    <IslandRoot current="resignation-letter">
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
    resignDate: todayISO(),
    noticeDays: 90,
    newJoinDate: '',
    tone: 'professional',
  })
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const o = loadOffer()
    const saved = readJson<Draft | null>(STORAGE_KEY, null)
    setDraft(
      saved ?? {
        company: '',
        manager: '',
        role: '',
        resignDate: todayISO(),
        noticeDays: o.noticePeriodDays,
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

  const letter = useMemo(() => buildLetter(draft, lwd, t), [draft, lwd, t])
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  return (
    <div data-tool="resignation-letter" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('resignation-letter.formTitle')}</h2>
        <TextField label={t('resignation-letter.company')} value={draft.company} onChange={(v) => set({ company: v })} />
        <TextField label={t('resignation-letter.manager')} value={draft.manager} onChange={(v) => set({ manager: v })} />
        <TextField label={t('resignation-letter.role')} value={draft.role} onChange={(v) => set({ role: v })} />
        <DateField label={t('resignation-letter.date')} value={draft.resignDate} onChange={(v) => set({ resignDate: v })} />
        <NumberField label={t('resignation-letter.notice')} suffix="days" value={draft.noticeDays} onChange={(v) => set({ noticeDays: v })} />
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
      <div className="space-y-4">
        <VerdictBanner>{t('resignation-letter.verdict', { lwd })}</VerdictBanner>
        {overlap && <p className="text-[13px] text-amberflag">{t('resignation-letter.epfo')}</p>}
        <Card>
          <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed">{letter}</pre>
          <div className="mt-4">
            <CopyButton text={letter} label={t('ui.copy')} copiedLabel={t('ui.copied')} />
          </div>
        </Card>
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}

function buildLetter(d: Draft, lwd: string, t: (k: string, v?: Record<string, string | number>) => string): string {
  const company = d.company.trim() || '[Company]'
  const manager = d.manager.trim() || '[Manager name]'
  const role = d.role.trim() || '[Role]'
  const opening = t(`resignation-letter.body.${d.tone}`, { manager, company, role, date: d.resignDate, lwd })
  return opening
}
