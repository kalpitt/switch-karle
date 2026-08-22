import { IslandRoot } from '../../components/IslandRoot'
import { Card, CopyButton, Disclaimer } from '../../components/ui'
import { HR_SCRIPTS, type HrScriptSlug } from '../../data/hrScripts'
import { useT } from '../../i18n'

export default function HrScriptTool({ slug }: { slug: HrScriptSlug }) {
  const script = HR_SCRIPTS[slug]
  return (
    <IslandRoot current={slug}>
      <Body slug={slug} body={script.body} />
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

function VerdictFree({ title, lead }: { title: string; lead: string }) {
  return (
    <div>
      <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
      <p className="mt-1 text-[15px] text-ink-soft">{lead}</p>
    </div>
  )
}
