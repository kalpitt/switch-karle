import { useEffect, useMemo, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, Disclaimer, PrintButton, TextArea, VerdictBanner } from '../../components/ui'
import { redactText } from '../../engine/redact'
import { readJson, writeJson } from '../../lib/storage'
import { useT, type Lang } from '../../i18n'

const STORAGE_KEY = 'switchkarle.redactor.v1' as const

export default function RedactorTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="redactor">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [text, setText] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const [busy, setBusy] = useState(false)
  const previewRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    setText(readJson<string>(STORAGE_KEY, ''))
    setHydrated(true)
  }, [])
  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, text)
  }, [text, hydrated])

  const result = useMemo(() => redactText(text), [text])
  const hitCount = result.hits.reduce((n, h) => n + h.count, 0)

  const download = async () => {
    if (!previewRef.current) return
    setBusy(true)
    try {
      const url = await toPng(previewRef.current, { pixelRatio: 2, cacheBust: true, backgroundColor: '#faf7f2' })
      const a = document.createElement('a')
      a.href = url
      a.download = 'redacted.png'
      a.click()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div data-tool="redactor" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6 no-print">
        <h2 className="text-base font-bold">{t('redactor.formTitle')}</h2>
        <TextArea label={t('redactor.text')} hint={t('redactor.textHint')} value={text} onChange={setText} rows={14} />
      </Card>
      <div className="-order-1 space-y-4 lg:order-none">
        <VerdictBanner tone={hitCount === 0 ? 'amber' : 'leaf'}>
          {hitCount === 0 ? t('redactor.verdict.none') : t('redactor.verdict.hits', { n: hitCount })}
        </VerdictBanner>
        <Card>
          <h3 className="mb-2 text-sm font-bold">{t('redactor.preview')}</h3>
          <pre
            ref={previewRef}
            className="whitespace-pre-wrap break-words rounded-xl bg-paper p-4 text-[13px] leading-relaxed text-ink"
          >
            {result.redacted || '—'}
          </pre>
        </Card>
        <div className="no-print flex flex-wrap gap-2">
          <button
            type="button"
            onClick={download}
            disabled={busy || !result.redacted}
            className="rounded-xl bg-saffron px-4 py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
          >
            {busy ? t('redactor.busy') : t('redactor.download')}
          </button>
          <PrintButton label={t('ui.print')} />
        </div>
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
