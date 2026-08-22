import { useEffect, useMemo, useState } from 'react'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, CopyButton, Disclaimer, TextArea, TextField, VerdictBanner } from '../../components/ui'
import { readJson, writeJson } from '../../lib/storage'
import { useT } from '../../i18n'

const STORAGE_KEY = 'switchkarle.handover.v1' as const

interface Draft {
  role: string
  owner: string
  projects: string
  access: string
  risks: string
}

const EMPTY: Draft = { role: '', owner: '', projects: '', access: '', risks: '' }

export default function HandoverDocTool() {
  return (
    <IslandRoot current="handover-doc">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setDraft(readJson<Draft>(STORAGE_KEY, EMPTY))
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, draft)
  }, [draft, hydrated])

  const md = useMemo(() => {
    return [
      `# Handover — ${draft.role || '[Role]'}`,
      '',
      `Owner after I leave: ${draft.owner || '[Name]'}`,
      '',
      '## Projects / status',
      draft.projects || '_Add running work, tickets, and who to ask._',
      '',
      '## Access & artefacts',
      draft.access || '_Repos, dashboards, keys to rotate, docs._',
      '',
      '## Risks if this is dropped',
      draft.risks || '_Dates, customers, audits._',
    ].join('\n')
  }, [draft])

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  return (
    <div data-tool="handover-doc" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('handover-doc.formTitle')}</h2>
        <TextField label={t('handover-doc.role')} value={draft.role} onChange={(v) => set({ role: v })} />
        <TextField label={t('handover-doc.owner')} value={draft.owner} onChange={(v) => set({ owner: v })} />
        <TextArea label={t('handover-doc.projects')} value={draft.projects} onChange={(v) => set({ projects: v })} rows={5} />
        <TextArea label={t('handover-doc.access')} value={draft.access} onChange={(v) => set({ access: v })} rows={4} />
        <TextArea label={t('handover-doc.risks')} value={draft.risks} onChange={(v) => set({ risks: v })} rows={3} />
      </Card>
      <div className="space-y-4">
        <VerdictBanner>{t('handover-doc.verdict')}</VerdictBanner>
        <Card>
          <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed">{md}</pre>
          <div className="mt-4">
            <CopyButton text={md} label={t('ui.copy')} copiedLabel={t('ui.copied')} />
          </div>
        </Card>
        <Disclaimer>{t('handover-doc.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
