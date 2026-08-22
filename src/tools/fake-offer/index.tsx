import { useEffect, useMemo, useState } from 'react'
import { scanOfferScam } from '../../engine/offerScam'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, Disclaimer, TextArea, TextField, VerdictBanner } from '../../components/ui'
import { readJson, writeJson } from '../../lib/storage'
import { useT } from '../../i18n'

const STORAGE_KEY = 'switchkarle.fake-offer.v1' as const

interface Draft {
  company: string
  emailDomain: string
  offerText: string
}

const EMPTY: Draft = { company: '', emailDomain: '', offerText: '' }

export default function FakeOfferTool() {
  return (
    <IslandRoot current="fake-offer">
      <Body />
    </IslandRoot>
  )
}

function HintText({ text }: { text: string }) {
  const match = text.match(/(https?:\/\/[^\s]+)/)
  if (!match) return <>{text}</>
  const url = match[1]!
  const at = text.indexOf(url)
  return (
    <>
      {text.slice(0, at)}
      <a href={url} className="underline" target="_blank" rel="noreferrer">
        {url}
      </a>
      {text.slice(at + url.length)}
    </>
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

  const flags = useMemo(() => scanOfferScam(draft), [draft])
  const reds = flags.filter((f) => f.severity === 'red')
  const ambers = flags.filter((f) => f.severity === 'amber')

  const verdict =
    reds.length > 0
      ? t('fake-offer.verdict.red', { n: reds.length })
      : ambers.length > 0
        ? t('fake-offer.verdict.amber')
        : t('fake-offer.verdict.clean')

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  const onEmail = (raw: string) => {
    const trimmed = raw.trim()
    const at = trimmed.lastIndexOf('@')
    set({ emailDomain: at >= 0 ? trimmed.slice(at + 1) : trimmed })
  }

  return (
    <div data-tool="fake-offer" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('fake-offer.formTitle')}</h2>
        <TextField
          label={t('fake-offer.company')}
          value={draft.company}
          onChange={(v) => set({ company: v })}
          placeholder="Acme Technologies"
        />
        <TextField
          label={t('fake-offer.email')}
          hint={t('fake-offer.emailHint')}
          value={draft.emailDomain}
          onChange={onEmail}
          placeholder="hr@acme.com"
        />
        <TextArea
          label={t('fake-offer.text')}
          hint={t('fake-offer.textHint')}
          value={draft.offerText}
          onChange={(v) => set({ offerText: v })}
          rows={8}
        />
      </Card>

      <div className="space-y-4">
        <VerdictBanner tone={reds.length ? 'alarm' : ambers.length ? 'amber' : 'leaf'}>{verdict}</VerdictBanner>
        {flags.map((f) => (
          <Card key={f.id} className="space-y-1.5">
            <p className="flex flex-wrap items-center gap-2 text-[13px] font-bold">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wide ${
                  f.severity === 'red'
                    ? 'bg-alarm text-white'
                    : f.severity === 'amber'
                      ? 'bg-amberflag text-white'
                      : 'bg-line text-ink-soft'
                }`}
              >
                {t(`flagChip.${f.severity}`)}
              </span>
              {f.title}
            </p>
            <p className="text-[13px] leading-relaxed text-ink-soft">{f.detail}</p>
            <p className="rounded-lg bg-paper p-2.5 text-[13px] leading-relaxed">
              <span className="font-bold text-saffron">{t('fake-offer.verify')} </span>
              <HintText text={f.verificationHint} />
            </p>
          </Card>
        ))}
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
