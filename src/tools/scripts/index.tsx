import { useEffect, useMemo, useState } from 'react'
import { lastWorkingDay } from '../../engine/dates'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, CopyButton, Disclaimer, MoneyField, Select, TextField, VerdictBanner } from '../../components/ui'
import { SCRIPT_SLUGS, type ScriptSlug } from '../../data/hrScripts'
import { TOOLS } from '../../data/tools'
import { withLang } from '../../lib/langPath'
import { readJson } from '../../lib/storage'
import { useLang, useT, type Lang } from '../../i18n'

/** Read-only pull from the resignation island's own key (allowed per D10). */
const RESIGNATION_KEY = 'switchkarle.resignation.v1' as const

type Preset = 'supportive' | 'counter-risk' | 'hostile'

export default function ScriptsTool({ slug, lang = 'en' }: { slug: ScriptSlug; lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current={slug}>
      <Body slug={slug} />
    </IslandRoot>
  )
}

/** Hop between the seven scripts without going back to the home grid. */
function ScriptSwitcher({ current }: { current: ScriptSlug }) {
  const t = useT()
  const { lang } = useLang()
  const titleKey = (slug: ScriptSlug) => TOOLS.find((tool) => tool.slug === slug)?.titleKey ?? slug
  return (
    <nav className="no-print flex flex-wrap gap-2">
      {SCRIPT_SLUGS.map((slug) =>
        slug === current ? (
          <span
            key={slug}
            aria-current="page"
            className="rounded-full border border-saffron bg-saffron px-3 py-1.5 text-[13px] font-bold text-white"
          >
            {t(titleKey(slug))}
          </span>
        ) : (
          <a
            key={slug}
            href={withLang(lang, slug)}
            className="rounded-full border border-line px-3 py-1.5 text-[13px] font-semibold text-ink-soft transition-colors hover:border-saffron"
          >
            {t(titleKey(slug))}
          </a>
        ),
      )}
    </nav>
  )
}

function Body({ slug }: { slug: ScriptSlug }) {
  const t = useT()
  const titleKey = TOOLS.find((tool) => tool.slug === slug)?.titleKey ?? slug

  return (
    <div data-tool={slug} className="mx-auto max-w-2xl space-y-4">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">{t(titleKey)}</h2>
        <p className="mt-1 text-[15px] text-ink-soft">{t('hr.lead')}</p>
      </div>
      <ScriptSwitcher current={slug} />
      {slug === 'manager-script' ? (
        <SpokenScript />
      ) : slug === 'expected-ctc' ? (
        <ExpectedCtcScript />
      ) : (
        <StaticScript slug={slug} />
      )}
      <Disclaimer>{t('hr.disclaimer')}</Disclaimer>
    </div>
  )
}

function StaticScript({ slug }: { slug: ScriptSlug }) {
  const t = useT()
  const body = t(`hr.${slug}.body`)
  return (
    <Card>
      <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed">{body}</pre>
      <div className="mt-4">
        <CopyButton text={body} label={t('ui.copy')} copiedLabel={t('ui.copied')} />
      </div>
    </Card>
  )
}

/**
 * Expected CTC (PR 4.3): two money inputs drive the letter; copy stays locked
 * until both numbers are filled.
 */
function ExpectedCtcScript() {
  const t = useT()
  const [currentCtc, setCurrentCtc] = useState(0)
  const [expectedCtc, setExpectedCtc] = useState(0)
  const [role, setRole] = useState('')

  const ready = currentCtc > 0 && expectedCtc > 0 && role.trim() !== ''

  const body = useMemo(
    () =>
      t('hr.expected-ctc.body', {
        role: role.trim() || '[Role]',
        current: formatLakh(currentCtc),
        expected: formatLakh(expectedCtc),
      }),
    [t, role, currentCtc, expectedCtc],
  )

  return (
    <>
      <Card className="space-y-3">
        <h3 className="text-base font-bold">{t('hr.expected-ctc.formTitle')}</h3>
        <TextField
          label={t('hr.expected-ctc.role')}
          hint={t('hr.expected-ctc.roleHint')}
          value={role}
          onChange={setRole}
        />
        <MoneyField
          label={t('hr.expected-ctc.current')}
          hint={t('ui.money.hint')}
          value={currentCtc}
          onChange={setCurrentCtc}
        />
        <MoneyField
          label={t('hr.expected-ctc.expected')}
          hint={t('ui.money.hint')}
          value={expectedCtc}
          onChange={setExpectedCtc}
        />
      </Card>
      <Card>
        <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed">{body}</pre>
        <div className="mt-4">
          {ready ? (
            <CopyButton text={body} label={t('ui.copy')} copiedLabel={t('ui.copied')} />
          ) : (
            <p className="text-[13px] font-semibold text-amberflag">{t('hr.expected-ctc.copyBlocked')}</p>
          )}
        </div>
      </Card>
    </>
  )
}

/** The one script you say out loud: tone instead of template. */
function SpokenScript() {
  const t = useT()
  const [preset, setPreset] = useState<Preset>('supportive')
  /** LWD from a stored resignation letter, if the user already made one. */
  const [lwd, setLwd] = useState('')

  useEffect(() => {
    const res = readJson<{ resignDate?: string; noticeDays?: number } | null>(RESIGNATION_KEY, null)
    if (res?.resignDate && res.noticeDays) {
      try {
        setLwd(lastWorkingDay(res.resignDate, Math.max(1, Math.round(res.noticeDays))))
      } catch {
        /* malformed stored dates — leave LWD empty */
      }
    }
  }, [])

  const script = useMemo(
    () => t(`manager-script.body.${preset}`).replaceAll('[LWD]', lwd || '[LWD]'),
    [t, preset, lwd],
  )
  const canCopy = !script.includes('[')

  return (
    <>
      <Card className="space-y-3">
        <h3 className="text-base font-bold">{t('manager-script.formTitle')}</h3>
        <Select
          label={t('manager-script.preset')}
          value={preset}
          onChange={(v) => setPreset(v)}
          options={[
            { value: 'supportive', label: t('manager-script.preset.supportive') },
            { value: 'counter-risk', label: t('manager-script.preset.counter-risk') },
            { value: 'hostile', label: t('manager-script.preset.hostile') },
          ]}
        />
      </Card>
      <VerdictBanner>{t(`manager-script.verdict.${preset}`)}</VerdictBanner>
      <Card>
        <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed">{script}</pre>
        <div className="mt-4">
          {canCopy ? (
            <CopyButton text={script} label={t('ui.copy')} copiedLabel={t('ui.copied')} />
          ) : (
            <p className="text-[13px] font-semibold text-amberflag">{t('manager-script.copyBlocked')}</p>
          )}
        </div>
      </Card>
    </>
  )
}

function formatLakh(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`
}
