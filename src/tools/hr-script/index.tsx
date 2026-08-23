import { useMemo, useState } from 'react'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, CopyButton, Disclaimer, MoneyField, TextField } from '../../components/ui'
import { HR_SCRIPTS, type HrScriptSlug } from '../../data/hrScripts'
import { useT, type Lang } from '../../i18n'

export default function HrScriptTool({ slug, lang = 'en' }: { slug: HrScriptSlug; lang?: Lang }) {
  const script = HR_SCRIPTS[slug]
  return (
    <IslandRoot lang={lang} current={slug}>
      {slug === 'expected-ctc' ? (
        <ExpectedCtcBody />
      ) : (
        <Body slug={slug} body={script.body} />
      )}
    </IslandRoot>
  )
}

function Body({ slug, body }: { slug: HrScriptSlug; body: string }) {
  const t = useT()
  return (
    <div data-tool={slug} className="mx-auto max-w-2xl space-y-4">
      <VerdictFree title={t(HR_SCRIPTS[slug].titleKey)} lead={t('hr.lead')} />
      <Card>
        <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed">{body}</pre>
        <div className="mt-4">
          <CopyButton text={body} label={t('ui.copy')} copiedLabel={t('ui.copied')} />
        </div>
      </Card>
      <Disclaimer>{t('hr.disclaimer')}</Disclaimer>
    </div>
  )
}

/**
 * Expected CTC (PR 4.3): two money inputs drive the letter; copy stays locked
 * until both numbers are filled. The five sibling slugs are untouched.
 */
function ExpectedCtcBody() {
  const t = useT()
  const [currentCtc, setCurrentCtc] = useState(0)
  const [expectedCtc, setExpectedCtc] = useState(0)
  const [role, setRole] = useState('')

  const ready = currentCtc > 0 && expectedCtc > 0

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
    <div data-tool="expected-ctc" className="mx-auto max-w-2xl space-y-4">
      <VerdictFree title={t('hr.expected-ctc.title')} lead={t('hr.lead')} />
      <Card className="space-y-3">
        <h2 className="text-base font-bold">{t('hr.expected-ctc.formTitle')}</h2>
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
      <Disclaimer>{t('hr.disclaimer')}</Disclaimer>
    </div>
  )
}

function formatLakh(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`
}

function VerdictFree({ title, lead }: { title: string; lead: string }) {
  return (
    <div>
      <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
      <p className="mt-1 text-[15px] text-ink-soft">{lead}</p>
    </div>
  )
}
