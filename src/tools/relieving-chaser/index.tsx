import { useEffect, useMemo, useState } from 'react'
import { lastWorkingDay } from '../../engine/dates'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, CopyButton, DateField, Disclaimer, Select, TextField, VerdictBanner } from '../../components/ui'
import { readJson, writeJson } from '../../lib/storage'
import { useT, type Lang } from '../../i18n'

const STORAGE_KEY = 'switchkarle.relieving.v1' as const
/** Read-only pull from the resignation island's own key (allowed per D10). */
const RESIGNATION_KEY = 'switchkarle.resignation.v1' as const

type Day = '7' | '14' | '30'

interface Draft {
  company: string
  hr: string
  role: string
  lwd: string
  day: Day
}

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function RelievingChaserTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="relieving-chaser">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [draft, setDraft] = useState<Draft>({
    company: '',
    hr: '',
    role: '',
    lwd: '',
    day: '7',
  })
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const saved = readJson<Draft | null>(STORAGE_KEY, null)
    if (!saved || !saved.lwd) {
      // Seed LWD read-only from the stored resignation letter, if present.
      const res = readJson<{ resignDate?: string; noticeDays?: number } | null>(RESIGNATION_KEY, null)
      if (res?.resignDate && res.noticeDays) {
        try {
          const seededLwd = lastWorkingDay(res.resignDate, Math.max(1, Math.round(res.noticeDays)))
          setDraft({ ...(saved ?? { company: '', hr: '', role: '', lwd: '', day: '7' }), lwd: seededLwd })
          setHydrated(true)
          return
        } catch {
          /* malformed dates — fall through */
        }
      }
    }
    setDraft(saved ?? { company: '', hr: '', role: '', lwd: '', day: '7' })
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, draft)
  }, [draft, hydrated])

  const mail = useMemo(
    () =>
      t(`relieving-chaser.body.${draft.day}`, {
        hr: draft.hr.trim() || '[HR name]',
        company: draft.company.trim() || '[Company]',
        role: draft.role.trim() || '[Role]',
        lwd: draft.lwd || '[LWD]',
      }),
    [t, draft],
  )
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  /** A chase only makes sense once the LWD has passed, and the paste must
   * never carry leftover [placeholders] (quality bar §3). */
  const lwdReady = /^\d{4}-\d{2}-\d{2}$/.test(draft.lwd) && draft.lwd <= todayISO()
  const canCopy = lwdReady && !mail.includes('[')

  return (
    <div data-tool="relieving-chaser" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('relieving-chaser.formTitle')}</h2>
        <TextField label={t('relieving-chaser.company')} value={draft.company} onChange={(v) => set({ company: v })} />
        <TextField label={t('relieving-chaser.hr')} value={draft.hr} onChange={(v) => set({ hr: v })} />
        <TextField label={t('relieving-chaser.role')} value={draft.role} onChange={(v) => set({ role: v })} />
        <DateField label={t('relieving-chaser.lwd')} value={draft.lwd} onChange={(v) => set({ lwd: v })} />
        <Select
          label={t('relieving-chaser.day')}
          value={draft.day}
          onChange={(v) => set({ day: v })}
          options={[
            { value: '7', label: t('relieving-chaser.day.7') },
            { value: '14', label: t('relieving-chaser.day.14') },
            { value: '30', label: t('relieving-chaser.day.30') },
          ]}
        />
      </Card>
      <div className="space-y-4">
        <VerdictBanner>{t(`relieving-chaser.verdict.${draft.day}`)}</VerdictBanner>
        <Card>
          <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed">{mail}</pre>
          <div className="mt-4">
            {canCopy ? (
              <CopyButton text={mail} label={t('ui.copy')} copiedLabel={t('ui.copied')} />
            ) : (
              <p className="text-[13px] font-semibold text-amberflag">
                {lwdReady ? t('relieving-chaser.fillFields') : t('relieving-chaser.setLwd')}
              </p>
            )}
          </div>
        </Card>
        <Disclaimer>{t('hr.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
