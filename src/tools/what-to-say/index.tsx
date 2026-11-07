import type { MouseEvent } from 'react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { lastWorkingDay } from '../../engine/dates'
import { IslandRoot } from '../../components/IslandRoot'
import { NextStep } from '../../components/NextStep'
import { ChevronRight } from '../../components/icons'
import { Card, CopyButton, Disclaimer, MoneyField, Select, TextField, VerdictBanner } from '../../components/ui'
import { isScriptSlug, type ScriptSlug } from '../../data/hrScripts'
import { WHAT_TO_SAY, toolBySlug, type ToolDef } from '../../data/tools'
import { whatToSayGroups } from '../../data/journey'
import { formatLongDate } from '../../lib/formatDate'
import { slugFromPath, withLang } from '../../lib/langPath'
import { toolTitle, withBrand } from '../../lib/pageTitle'
import { readJson } from '../../lib/storage'
import { dictionaries, useLang, useT, type Lang } from '../../i18n'

/** Read-only pull from the resignation island's own key (allowed per D10). */
const RESIGNATION_KEY = 'switchkarle.resignation.v1' as const

type Preset = 'supportive' | 'counter-risk' | 'hostile'

/**
 * What to say (decision 4, 2026-10-31): the seven scripts on one page with a
 * situation picker. /what-to-say/ opens on the picker; each situation's own
 * address (/expected-ctc/, /hi/manager-script/, …) is a real page that renders
 * this same island with that situation picked, so old links, bookmarks and the
 * offline copy keep working. Picking another situation swaps it in place and
 * moves the address to that situation's page, so reload, share and Back agree.
 */
export default function WhatToSayTool({ slug, lang = 'en' }: { slug: string; lang?: Lang }) {
  const [situation, setSituation] = useState<ScriptSlug | null>(isScriptSlug(slug) ? slug : null)
  const first = useRef(true)

  // Back and Forward walk through the situations picked here.
  useEffect(() => {
    const onPop = () => {
      const at = slugFromPath(window.location.pathname, import.meta.env.BASE_URL || '/')
      setSituation(isScriptSlug(at) ? at : null)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // The tab names the situation on screen, as the page's own <title> does.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const def = toolBySlug(situation ?? WHAT_TO_SAY)
    if (def) document.title = withBrand(toolTitle(def, lang, dictionaries.hi), lang)
  }, [situation, lang])

  const pick = (next: ScriptSlug) => {
    if (next === situation) return
    window.history.pushState(null, '', withLang(lang, next))
    setSituation(next)
  }

  return (
    <IslandRoot lang={lang} current={situation ?? WHAT_TO_SAY}>
      <Body situation={situation} onPick={pick} />
    </IslandRoot>
  )
}

function Body({ situation, onPick }: { situation: ScriptSlug | null; onPick: (slug: ScriptSlug) => void }) {
  const t = useT()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingId = useId()
  const def = situation ? toolBySlug(situation) : undefined
  const [announce, setAnnounce] = useState('')

  const pick = (slug: ScriptSlug) => {
    // From the full list the picker turns into a row of chips, so the link that
    // had focus is gone: send focus to the situation's heading instead.
    const fromList = situation === null
    onPick(slug)
    setAnnounce(t('what-to-say.showing', { name: t(toolBySlug(slug)?.titleKey ?? slug) }))
    if (fromList) requestAnimationFrame(() => headingRef.current?.focus())
  }

  return (
    <div data-tool={WHAT_TO_SAY} data-situation={situation ?? undefined} className="max-w-2xl space-y-5">
      <SituationPicker current={situation} onPick={pick} />
      <p role="status" className="sr-only">
        {announce}
      </p>
      {situation && def && (
        <section aria-labelledby={headingId} className="space-y-4 border-t border-line pt-5">
          <div>
            <h2
              id={headingId}
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-[22px] font-bold leading-snug tracking-[-0.01em] text-ink outline-none"
            >
              {t(def.titleKey)}
            </h2>
            <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">{t(def.descKey)}</p>
          </div>
          <p className="text-[14px] text-ink-soft">{t(situation === 'manager-script' ? 'manager-script.lead' : 'hr.lead')}</p>
          {situation === 'manager-script' ? (
            <SpokenScript />
          ) : situation === 'expected-ctc' ? (
            <ExpectedCtcScript />
          ) : (
            <StaticScript slug={situation} />
          )}
          <Disclaimer>{t('hr.disclaimer')}</Disclaimer>
        </section>
      )}
      {/* With nothing picked the picker is the next thing; the Next link waits for a situation. */}
      <NextStep from={situation ?? WHAT_TO_SAY} hidden={!situation} />
    </div>
  )
}

/**
 * The situations, stage by stage. With nothing picked it is a list with each
 * situation's one-liner; once one is picked it folds into chips above the script.
 * Each entry is a real link to the situation's page: it works before the page
 * is interactive and opens in a new tab; a plain click swaps in place.
 */
function SituationPicker({ current, onPick }: { current: ScriptSlug | null; onPick: (slug: ScriptSlug) => void }) {
  const t = useT()
  const { lang } = useLang()
  const groups = whatToSayGroups()
  const id = useId()

  const click = (slug: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0 || !isScriptSlug(slug)) return
    e.preventDefault()
    onPick(slug)
  }

  return (
    <nav aria-label={t('what-to-say.picker')} className="no-print space-y-4">
      {!current && <p className="text-[15px] font-semibold text-ink">{t('what-to-say.pick')}</p>}
      {groups.map((group) => (
        <div key={group.id}>
          <p id={`${id}-${group.id}`} className="mb-1.5 text-[13px] font-medium text-ink-soft">
            {t(group.nameKey)}
          </p>
          <ul aria-labelledby={`${id}-${group.id}`} className={current ? 'flex flex-wrap gap-2' : 'border-t border-line'}>
            {group.situations.map((s) => (
              <li key={s.slug}>
                {current ? (
                  <Chip tool={s} href={withLang(lang, s.slug)} active={s.slug === current} onClick={click(s.slug)} />
                ) : (
                  <Row tool={s} href={withLang(lang, s.slug)} onClick={click(s.slug)} />
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function Chip({
  tool,
  href,
  active,
  onClick,
}: {
  tool: ToolDef
  href: string
  active: boolean
  onClick: (e: MouseEvent<HTMLAnchorElement>) => void
}) {
  const t = useT()
  return (
    <a
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex min-h-[44px] items-center rounded-xl border px-3.5 text-[14px] transition-colors ${
        active
          ? 'border-ink bg-ink font-semibold text-white'
          : 'border-line-strong font-medium text-ink-soft hover:border-field hover:text-ink'
      }`}
    >
      {t(tool.titleKey)}
    </a>
  )
}

function Row({ tool, href, onClick }: { tool: ToolDef; href: string; onClick: (e: MouseEvent<HTMLAnchorElement>) => void }) {
  const t = useT()
  return (
    <a
      href={href}
      onClick={onClick}
      className="group/row flex min-h-[44px] items-start gap-3 border-b border-line py-3 transition-colors hover:border-field"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-snug text-ink group-hover/row:underline group-hover/row:underline-offset-2">
          {t(tool.titleKey)}
        </span>
        <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">{t(tool.descKey)}</span>
      </span>
      <ChevronRight className="mt-1 text-ink-faint" />
    </a>
  )
}

function StaticScript({ slug }: { slug: ScriptSlug }) {
  const t = useT()
  const body = t(`hr.${slug}.body`)
  return (
    <Card>
      <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed">{body}</pre>
      <div className="mt-4">
        <CopyButton text={body} label={t('ui.copyEmail')} copiedLabel={t('ui.copied')} />
      </div>
    </Card>
  )
}

/**
 * Expected CTC (PR 4.3): two money inputs drive the letter; copy stays locked
 * until both numbers are filled. Until then the letter shows a bracket, never
 * a ₹0 the page made up.
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
        current: currentCtc > 0 ? formatLakh(currentCtc) : t('hr.expected-ctc.placeholderCurrent'),
        expected: expectedCtc > 0 ? formatLakh(expectedCtc) : t('hr.expected-ctc.placeholderExpected'),
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
          placeholder={t('ui.money.placeholder')}
          value={currentCtc}
          onChange={setCurrentCtc}
        />
        <MoneyField
          label={t('hr.expected-ctc.expected')}
          placeholder={t('ui.money.placeholder')}
          value={expectedCtc}
          onChange={setExpectedCtc}
        />
      </Card>
      <Card>
        <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed">{body}</pre>
        <div className="mt-4">
          {ready ? (
            <CopyButton text={body} label={t('ui.copyScript')} copiedLabel={t('ui.copied')} />
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
  const { lang } = useLang()
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
    () => t(`manager-script.body.${preset}`).replaceAll('[LWD]', lwd ? formatLongDate(lwd, lang) : '[LWD]'),
    [t, preset, lwd, lang],
  )
  /** Copy always works: an unfilled [LWD] is a visible bracket the user can
   *  fill by hand, not a reason to lock the script. */
  const lwdMissing = script.includes('[LWD]')

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
          <CopyButton text={script} label={t('ui.copyScript')} copiedLabel={t('ui.copied')} />
          {lwdMissing && <p className="mt-2 text-[13px] text-ink-soft">{t('manager-script.copyBlocked')}</p>}
        </div>
      </Card>
    </>
  )
}

function formatLakh(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`
}
