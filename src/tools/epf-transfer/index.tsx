import { useEffect, useMemo, useState } from 'react'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, DateField, Disclaimer, ExampleNote, Select, Toggle, VerdictBanner } from '../../components/ui'
import { epfGuide, EPFO_MEMBER_PORTAL, type EpfIntent } from '../../engine/epf'
import { readJson, writeJson } from '../../lib/storage'
import { useT, type Lang } from '../../i18n'

const STORAGE_KEY = 'switchkarle.epf.v1' as const

interface Draft {
  intent: EpfIntent
  joinDate: string
  exitDate: string
  dateOfExitMarked: boolean
  nameMatchesAadhaar: boolean
  dobMatchesAadhaar: boolean
}

const DEFAULT: Draft = {
  intent: 'transfer',
  joinDate: '2023-04-01',
  exitDate: '2026-08-31',
  dateOfExitMarked: false,
  nameMatchesAadhaar: true,
  dobMatchesAadhaar: true,
}

export default function EpfTransferTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="epf-transfer">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [draft, setDraft] = useState<Draft>(DEFAULT)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setDraft(readJson<Draft>(STORAGE_KEY, DEFAULT))
    setHydrated(true)
  }, [])
  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, draft)
  }, [draft, hydrated])

  const result = useMemo(() => {
    try {
      return epfGuide(draft)
    } catch {
      return null
    }
  }, [draft])

/** Untouched fixture on first paint = worked example, not the user's data. */
  const isExample = JSON.stringify(draft) === JSON.stringify(DEFAULT)
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))
  const verdictKey = result
    ? result.prematureWithdrawalTrap
      ? 'epf-transfer.verdict.withdraw'
      : result.recommendedIntent === 'withdraw'
        ? 'epf-transfer.verdict.okWithdraw'
        : 'epf-transfer.verdict.transfer'
    : 'epf-transfer.verdict.transfer'

  return (
    <div data-tool="epf-transfer" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('epf-transfer.formTitle')}</h2>
        <Select
          label={t('epf-transfer.intent')}
          value={draft.intent}
          onChange={(v) => set({ intent: v })}
          options={[
            { value: 'transfer', label: t('epf-transfer.intent.transfer') },
            { value: 'withdraw', label: t('epf-transfer.intent.withdraw') },
          ]}
        />
        <DateField
          label={t('epf-transfer.join')}
          hint={t('epf-transfer.tenureScope')}
          value={draft.joinDate}
          onChange={(v) => set({ joinDate: v })}
        />
        <DateField label={t('epf-transfer.exit')} value={draft.exitDate} onChange={(v) => set({ exitDate: v })} />
        <Toggle label={t('epf-transfer.doe')} checked={draft.dateOfExitMarked} onChange={(v) => set({ dateOfExitMarked: v })} />
        <Toggle label={t('epf-transfer.name')} checked={draft.nameMatchesAadhaar} onChange={(v) => set({ nameMatchesAadhaar: v })} />
        <Toggle label={t('epf-transfer.dob')} checked={draft.dobMatchesAadhaar} onChange={(v) => set({ dobMatchesAadhaar: v })} />
      </Card>
      <div className="-order-1 space-y-4 lg:order-none">
        {isExample ? (
          <ExampleNote chip={t('ui.exampleChip')} note={t('ui.exampleNote')} />
        ) : (
          <VerdictBanner tone={result?.prematureWithdrawalTrap ? 'alarm' : result && result.flags.length > 0 ? 'amber' : 'leaf'}>
            {t(verdictKey, { years: result?.completedYears ?? 0 })}
          </VerdictBanner>
        )}
        {result && (
          <Card className="space-y-2">
            {result.flags.map((f) => (
              <p key={f.id} className={`text-[13px] leading-relaxed ${f.severity === 'red' ? 'text-alarm' : f.severity === 'amber' ? 'text-amberflag' : 'text-ink-soft'}`}>
                {t(`epf-transfer.flag.${f.id}`)}
              </p>
            ))}
            <h3 className="pt-2 text-sm font-bold">{t('epf-transfer.steps')}</h3>
            <ol className="list-decimal space-y-1 pl-5 text-[13px] leading-relaxed text-ink-soft">
              {result.stepIds.map((id) => (
                <li key={id}>{t(`epf-transfer.step.${id}`)}</li>
              ))}
            </ol>
            <p className="text-[13px]">
              <a href={EPFO_MEMBER_PORTAL} className="font-semibold underline" target="_blank" rel="noreferrer">
                {t('epf-transfer.portal')}
              </a>
            </p>
          </Card>
        )}
        <p className="text-[13px] text-ink-soft">{t('epf-transfer.provisional')}</p>
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
