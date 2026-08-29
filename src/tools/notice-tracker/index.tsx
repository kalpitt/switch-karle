import { useEffect, useMemo, useState } from 'react'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, DateField, Disclaimer, NumberField, VerdictBanner } from '../../components/ui'
import { noticeTracker, type NoticeItemId } from '../../engine/noticeTracker'
import { todayUTC } from '../../engine/dates'
import { loadOffer } from '../../data/defaults'
import { readJson, writeJson } from '../../lib/storage'
import { useT, type Lang } from '../../i18n'

const STORAGE_KEY = 'switchkarle.notice.v1' as const

interface Draft {
  resignDate: string
  noticePeriodDays: number
  done: NoticeItemId[]
}

function emptyDraft(): Draft {
  return { resignDate: todayUTC(), noticePeriodDays: 90, done: [] }
}

export default function NoticeTrackerTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="notice-tracker">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [asOf, setAsOf] = useState(() => todayUTC())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const o = loadOffer()
    const saved = readJson<Draft | null>(STORAGE_KEY, null)
    setAsOf(todayUTC())
    setDraft(saved ?? { resignDate: todayUTC(), noticePeriodDays: o.noticePeriodDays, done: [] })
    setHydrated(true)
  }, [])
  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, draft)
  }, [draft, hydrated])

  const result = useMemo(() => {
    try {
      return noticeTracker({ resignDate: draft.resignDate, noticePeriodDays: draft.noticePeriodDays, asOf })
    } catch {
      return null
    }
  }, [draft.resignDate, draft.noticePeriodDays, asOf])

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))
  const toggle = (id: NoticeItemId) =>
    set({ done: draft.done.includes(id) ? draft.done.filter((x) => x !== id) : [...draft.done, id] })

  return (
    <div data-tool="notice-tracker" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('notice-tracker.formTitle')}</h2>
        <DateField label={t('notice-tracker.resign')} value={draft.resignDate} onChange={(v) => set({ resignDate: v })} />
        <NumberField label={t('notice-tracker.notice')} suffix={t('unit.days')} value={draft.noticePeriodDays} onChange={(v) => set({ noticePeriodDays: v })} />
      </Card>
      <div className="-order-1 space-y-4 lg:order-none">
        <VerdictBanner tone={result?.served ? 'leaf' : 'amber'}>
          {result
            ? t(result.served ? 'notice-tracker.verdict.served' : 'notice-tracker.verdict.left', {
                days: Math.max(0, result.daysLeftOnNotice),
                lwd: result.lastWorkingDay,
              })
            : t('notice-tracker.verdict.served', { lwd: draft.resignDate })}
        </VerdictBanner>
        <Card className="space-y-2">
          {result?.milestones.map((m) => {
            const checked = draft.done.includes(m.id)
            return (
              <label key={m.id} className="flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={checked}
                  onChange={() => toggle(m.id)}
                />
                <span className={checked ? 'text-ink-faint line-through' : ''}>
                  {t(`notice-tracker.item.${m.id}`)}
                  <span className="mt-0.5 block tnum text-ink-soft">{t('notice-tracker.due', { date: m.dueDate })}</span>
                </span>
              </label>
            )
          })}
        </Card>
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
