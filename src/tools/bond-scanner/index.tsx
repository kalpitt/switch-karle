import { useEffect, useMemo, useState } from 'react'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, Disclaimer, TextArea, VerdictBanner } from '../../components/ui'
import { scanBondClause } from '../../engine/bondScan'
import { readJson, writeJson } from '../../lib/storage'
import { useT, type Lang } from '../../i18n'

const STORAGE_KEY = 'switchkarle.bond.v1' as const

export default function BondScannerTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="bond-scanner">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [text, setText] = useState('')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setText(readJson<string>(STORAGE_KEY, ''))
    setHydrated(true)
  }, [])
  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, text)
  }, [text, hydrated])

  const flags = useMemo(() => scanBondClause(text), [text])

  /** Empty paste = nothing scanned. Never show a green "no bond" on blank. */
  const isBlank = text.trim() === ''

  return (
    <div data-tool="bond-scanner" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('bond-scanner.formTitle')}</h2>
        <TextArea label={t('bond-scanner.text')} hint={t('bond-scanner.textHint')} value={text} onChange={setText} rows={12} />
      </Card>
      <div className="space-y-4">
        {isBlank ? (
          <p className="rounded-xl border border-line bg-paper px-3 py-2.5 text-[13px] font-semibold leading-snug text-ink-soft">
            {t('bond-scanner.verdict.blank')}
          </p>
        ) : (
          <VerdictBanner tone={flags.length === 0 ? 'leaf' : flags.some((f) => f.severity === 'red') ? 'alarm' : 'amber'}>
            {flags.length === 0
              ? t('bond-scanner.verdict.clean')
              : t('bond-scanner.verdict.flags', { n: flags.length })}
          </VerdictBanner>
        )}
        {!isBlank && flags.length > 0 && (
          <Card className="space-y-2">
            {flags.map((f) => (
              <p key={f.id} className={`text-[13px] leading-relaxed ${f.severity === 'red' ? 'text-alarm' : 'text-amberflag'}`}>
                {t(`bond-scanner.flag.${f.id}`)}
              </p>
            ))}
          </Card>
        )}
        <p className="text-[13px] leading-relaxed text-ink-soft">{t('bond-scanner.disclaimer')}</p>
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
