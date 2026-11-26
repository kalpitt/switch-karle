import { useMemo, useRef, useState } from 'react'
import { IslandRoot } from '../../components/IslandRoot'
import { NextStep } from '../../components/NextStep'
import { Button, Card, CopyButton, TextArea, TextField } from '../../components/ui'
import { ShieldCheck } from '../../components/icons'
import { cleanResume, resumeProblem, ROLE_MAX_CHARS, type ProfileFix } from '../../engine/profileFix'
import { ownAiPrompt } from '../../prompts/profileFix'
import { readResumeFile } from '../../lib/resumeFile'
import { useT, type Lang } from '../../i18n'

/**
 * The callback fixer (decided 2026-11-26). One job: a resume in, a better
 * Naukri and LinkedIn profile out. Nothing is saved on the device either: a
 * resume is not the kind of text to leave in a browser that may belong to an
 * employer, so this tool has no storage key.
 */
export default function FixMyProfileTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="fix-my-profile">
      <Body />
    </IslandRoot>
  )
}

type ServerError = 'badRequest' | 'tooShort' | 'tooLong' | 'limit' | 'busy' | 'failed' | 'notFound' | 'offline'

type Phase =
  | { kind: 'form' }
  | { kind: 'working' }
  | { kind: 'error'; error: ServerError }
  | { kind: 'result'; fix: ProfileFix; jobPost: string }

const API = '/api/fix'

async function askServer(body: { resume: string; role: string; jobPost: string }): Promise<
  { fix: ProfileFix } | { error: ServerError }
> {
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = (await res.json().catch(() => ({}))) as { fix?: ProfileFix; error?: ServerError }
    if (res.ok && json.fix) return { fix: json.fix }
    return { error: json.error ?? (res.status === 404 ? 'notFound' : 'failed') }
  } catch {
    return { error: 'offline' }
  }
}

type NoticeChoice = 'none' | 'short' | 'sixty' | 'ninety'
const NOTICE_CHOICES: NoticeChoice[] = ['none', 'short', 'sixty', 'ninety']

function Body() {
  const t = useT()
  const [resume, setResume] = useState('')
  const [role, setRole] = useState('')
  const [phase, setPhase] = useState<Phase>({ kind: 'form' })
  const [fileNote, setFileNote] = useState<{ ok: boolean; text: string } | null>(null)
  const [reading, setReading] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  const cleaned = useMemo(() => cleanResume(resume), [resume])
  const problem = resumeProblem(cleaned.text)

  const removedLine = cleaned.removed
    .map((r) => t(`fix-my-profile.removed.${r.kind}`, { n: r.count }))
    .join(', ')

  const run = async (opts: { role?: string; jobPost?: string } = {}) => {
    if (problem) return
    const useRole = opts.role ?? role.trim()
    const jobPost = opts.jobPost ?? ''
    setPhase({ kind: 'working' })
    const out = await askServer({ resume: cleaned.text, role: useRole, jobPost })
    setPhase('fix' in out ? { kind: 'result', fix: out.fix, jobPost } : { kind: 'error', error: out.error })
    window.requestAnimationFrame(() => resultRef.current?.focus())
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setReading(true)
    setFileNote(null)
    const out = await readResumeFile(file)
    setReading(false)
    if ('text' in out) {
      setResume(out.text)
      setFileNote({ ok: true, text: t('fix-my-profile.file.ok', { name: file.name }) })
    } else {
      setFileNote({ ok: false, text: t(`fix-my-profile.file.${out.problem}`) })
    }
  }

  const problemText =
    resume.trim() === '' ? null : problem === 'tooShort' ? t('fix-my-profile.tooShort') : problem === 'tooLong' ? t('fix-my-profile.tooLong') : null

  return (
    <div data-tool="fix-my-profile" className="mx-auto max-w-2xl space-y-4">
      <Card className="space-y-3">
        <TextArea
          label={t('fix-my-profile.resume')}
          hint={t('fix-my-profile.resumeHint')}
          value={resume}
          onChange={(v) => {
            setResume(v)
            setFileNote(null)
          }}
          rows={8}
        />
        <div className="flex flex-wrap items-center gap-2 text-[14px]">
          <label className="inline-flex min-h-[44px] cursor-pointer items-center font-semibold text-ink underline underline-offset-4">
            {reading ? t('fix-my-profile.file.reading') : t('fix-my-profile.file.pick')}
            <input
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="sr-only"
              data-resume-file
              onChange={(e) => {
                void onFile(e.target.files?.[0])
                e.target.value = ''
              }}
            />
          </label>
          {fileNote && (
            <span role="status" className={fileNote.ok ? 'text-ink-soft' : 'font-semibold text-alarm'}>
              {fileNote.text}
            </span>
          )}
        </div>
        {removedLine && (
          <p data-removed className="text-[14px] text-ink-soft">
            {t('fix-my-profile.removedLead', { list: removedLine })}
          </p>
        )}
        {problemText && <p className="text-[14px] font-semibold text-alarm">{problemText}</p>}
        <TextField
          label={t('fix-my-profile.role')}
          hint={t('fix-my-profile.roleHint')}
          value={role}
          onChange={(v) => setRole(v.slice(0, ROLE_MAX_CHARS))}
          placeholder={t('fix-my-profile.rolePlaceholder')}
        />
        <Button
          className="w-full"
          disabled={phase.kind === 'working'}
          aria-disabled={problem !== null}
          onClick={() => void run()}
          data-fix-go
        >
          {phase.kind === 'working' ? t('fix-my-profile.working') : t('fix-my-profile.go')}
        </Button>
        <p className="flex gap-2 text-[14px] leading-relaxed text-ink-soft">
          <ShieldCheck size={16} className="mt-[3px] shrink-0 text-leaf" />
          <span>{t('fix-my-profile.trust')}</span>
        </p>
      </Card>

      <div ref={resultRef} tabIndex={-1} className="space-y-4 outline-none" aria-live="polite">
        {phase.kind === 'error' && (
          <ErrorCard error={phase.error} prompt={ownAiPrompt({ resume: cleaned.text, role: role.trim(), jobPost: '' })} />
        )}
        {phase.kind === 'result' && (
          <Result fix={phase.fix} matched={phase.jobPost !== ''} onRole={(r) => void run({ role: r })} onJob={(j) => void run({ role: phase.fix.role, jobPost: j })} />
        )}
      </div>
      {/* PRODUCT.md rule 9: one next thing, but only once there is a result. */}
      <NextStep from="fix-my-profile" hidden={phase.kind !== 'result'} />
    </div>
  )
}

function ErrorCard({ error, prompt }: { error: ServerError; prompt: string }) {
  const t = useT()
  const ownAi = error === 'busy' || error === 'failed' || error === 'notFound' || error === 'offline'
  return (
    <Card className="space-y-3" >
      <p data-fix-error={error} className="text-[15px] font-semibold">
        {t(`fix-my-profile.error.${error}`)}
      </p>
      {ownAi && (
        <>
          <p className="text-[14px] text-ink-soft">{t('fix-my-profile.ownAi')}</p>
          <CopyButton text={prompt} label={t('fix-my-profile.ownAiCopy')} copiedLabel={t('ui.copied')} />
        </>
      )}
    </Card>
  )
}

function Section({ title, copy, children }: { title: string; copy?: string; children: React.ReactNode }) {
  const t = useT()
  return (
    <Card className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[16px] font-bold leading-snug">{title}</h3>
        {copy && <CopyButton text={copy} label={t('ui.copy')} copiedLabel={t('ui.copied')} />}
      </div>
      {children}
    </Card>
  )
}

function Result({
  fix,
  matched,
  onRole,
  onJob,
}: {
  fix: ProfileFix
  matched: boolean
  onRole: (role: string) => void
  onJob: (jobPost: string) => void
}) {
  const t = useT()
  const bulletsCopy = fix.bullets.map((b) => `• ${b.after ?? b.before}`).join('\n')
  const kept = fix.bullets.filter((b) => b.after === null).length

  return (
    <div data-fix-result className="space-y-4">
      <h2 className="text-[22px] font-bold leading-tight">{t('fix-my-profile.result.title', { role: fix.role })}</h2>
      <p className="text-[14px] text-ink-soft">
        {matched ? t('fix-my-profile.result.matched') : t('fix-my-profile.result.general')}
      </p>

      {fix.roles.length > 1 && (
        <Section title={t('fix-my-profile.result.roles')}>
          <ul className="space-y-2">
            {fix.roles.map((r) => {
              const on = r.title === fix.role
              return (
                <li key={r.title}>
                  <button
                    type="button"
                    aria-pressed={on}
                    disabled={on}
                    onClick={() => onRole(r.title)}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left ${on ? 'border-leaf bg-leaf-soft' : 'border-line hover:border-line-strong'}`}
                  >
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold">{r.title}</span>
                      <span className="text-[13px] text-ink-soft">{t(`fix-my-profile.fit.${r.fit}`)}</span>
                    </span>
                    {r.why && <span className="mt-0.5 block text-[14px] text-ink-soft">{r.why}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="text-[13px] text-ink-soft">{t('fix-my-profile.result.rolesHint')}</p>
        </Section>
      )}

      {fix.naukriHeadline && (
        <Section title={t('fix-my-profile.result.naukri')} copy={fix.naukriHeadline}>
          <p className="text-[15px]">{fix.naukriHeadline}</p>
        </Section>
      )}
      {fix.linkedinHeadline && (
        <Section title={t('fix-my-profile.result.linkedin')} copy={fix.linkedinHeadline}>
          <p className="text-[15px]">{fix.linkedinHeadline}</p>
        </Section>
      )}

      {(fix.skills.length > 0 || fix.worthShowing.length > 0) && (
        <Section title={t('fix-my-profile.result.skills')} copy={fix.skills.length ? fix.skills.join(', ') : undefined}>
          {fix.skills.length > 0 && <p className="text-[15px]">{fix.skills.join(' · ')}</p>}
          {fix.worthShowing.length > 0 && (
            <p className="text-[14px] text-ink-soft">
              {t('fix-my-profile.result.worthShowing', { list: fix.worthShowing.join(', ') })}
            </p>
          )}
        </Section>
      )}

      {fix.bullets.length > 0 && (
        <Section title={t('fix-my-profile.result.bullets')} copy={bulletsCopy}>
          <ul className="space-y-3">
            {fix.bullets.map((b) => (
              <li key={b.before} className="space-y-1 text-[15px]">
                <p className="text-ink-soft">
                  <span className="font-semibold">{t('fix-my-profile.result.before')} </span>
                  {b.before}
                </p>
                {b.after ? (
                  <p>
                    <span className="font-semibold">{t('fix-my-profile.result.after')} </span>
                    {b.after}
                  </p>
                ) : (
                  <p className="text-[14px] text-ink-soft">{t('fix-my-profile.result.keptAsIs')}</p>
                )}
                {b.hint && <p className="text-[14px] text-ink-soft">{b.hint}</p>}
              </li>
            ))}
          </ul>
          {kept > 0 && <p className="text-[13px] text-ink-soft">{t('fix-my-profile.result.keptNote')}</p>}
        </Section>
      )}

      {fix.gap && (
        <Section title={t('fix-my-profile.result.gap')}>
          <p className="text-[15px]">{fix.gap}</p>
        </Section>
      )}

      {fix.missing.length > 0 && (
        <Section title={t('fix-my-profile.result.missing')}>
          <ul className="list-disc space-y-1 pl-5 text-[15px]">
            {fix.missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={t('fix-my-profile.result.whereTitle')}>
        <ol className="list-decimal space-y-1 pl-5 text-[15px]">
          <li>{t('fix-my-profile.result.where1')}</li>
          <li>{t('fix-my-profile.result.where2')}</li>
          <li>{t('fix-my-profile.result.where3')}</li>
        </ol>
        <a
          href="https://www.naukri.com/mnjuser/profile"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-[44px] items-center font-semibold underline underline-offset-4"
        >
          {t('fix-my-profile.result.openNaukri')}
        </a>
      </Section>

      <AddOns fix={fix} onJob={onJob} />
    </div>
  )
}

function AddOns({ fix, onJob }: { fix: ProfileFix; onJob: (jobPost: string) => void }) {
  const t = useT()
  const [open, setOpen] = useState<'job' | 'notice' | 'referral' | null>(null)
  const [jobPost, setJobPost] = useState('')
  const [notice, setNotice] = useState<NoticeChoice | null>(null)
  const skills = fix.skills.slice(0, 2).join(' and ')
  const referral = t('fix-my-profile.referral.text', { role: fix.role, skills: skills || fix.role })
  // The link only, never the person's result: nothing they typed goes into a URL.
  const site = ((import.meta.env.SITE as string | undefined) ?? (typeof window === 'undefined' ? '' : window.location.origin)).replace(/\/$/, '')
  const share = `https://wa.me/?text=${encodeURIComponent(t('fix-my-profile.share.text', { url: `${site}/fix-my-profile/` }))}`

  const toggle = (k: 'job' | 'notice' | 'referral') => setOpen((o) => (o === k ? null : k))
  const chip = 'w-full rounded-xl border border-line px-3 py-3 text-left font-semibold hover:border-line-strong'

  return (
    <Card className="space-y-3">
      <h3 className="text-[16px] font-bold">{t('fix-my-profile.more.title')}</h3>

      <button type="button" className={chip} aria-expanded={open === 'job'} onClick={() => toggle('job')}>
        {t('fix-my-profile.more.job')}
      </button>
      {open === 'job' && (
        <div className="space-y-2">
          <TextArea label={t('fix-my-profile.more.jobLabel')} value={jobPost} onChange={setJobPost} rows={6} />
          <Button variant="secondary" disabled={jobPost.trim().length < 80} onClick={() => onJob(jobPost.trim())}>
            {t('fix-my-profile.more.jobGo')}
          </Button>
        </div>
      )}

      <button type="button" className={chip} aria-expanded={open === 'notice'} onClick={() => toggle('notice')}>
        {t('fix-my-profile.more.notice')}
      </button>
      {open === 'notice' && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('fix-my-profile.notice.label')}>
            {NOTICE_CHOICES.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={notice === c}
                onClick={() => setNotice(c)}
                className={`min-h-[44px] rounded-full border px-4 ${notice === c ? 'border-ink bg-ink text-white' : 'border-line'}`}
              >
                {t(`fix-my-profile.notice.${c}`)}
              </button>
            ))}
          </div>
          {notice && (
            <div className="space-y-2 rounded-xl bg-paper p-3">
              <p className="text-[15px]">“{t(`fix-my-profile.notice.${notice}.line`)}”</p>
              <p className="text-[14px] text-ink-soft">{t(`fix-my-profile.notice.${notice}.tip`)}</p>
              <CopyButton text={t(`fix-my-profile.notice.${notice}.line`)} label={t('ui.copy')} copiedLabel={t('ui.copied')} />
            </div>
          )}
        </div>
      )}

      <button type="button" className={chip} aria-expanded={open === 'referral'} onClick={() => toggle('referral')}>
        {t('fix-my-profile.more.referral')}
      </button>
      {open === 'referral' && (
        <div className="space-y-2 rounded-xl bg-paper p-3">
          <p className="text-[15px]">{referral}</p>
          <CopyButton text={referral} label={t('ui.copy')} copiedLabel={t('ui.copied')} />
        </div>
      )}

      <a
        href={share}
        target="_blank"
        rel="noreferrer"
        data-fix-share
        className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-leaf px-4 font-semibold text-white"
      >
        {t('fix-my-profile.share.cta')}
      </a>
    </Card>
  )
}
