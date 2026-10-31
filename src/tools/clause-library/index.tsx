import { IslandRoot } from '../../components/IslandRoot'
import { Card, CopyButton, Disclaimer, VerdictBanner } from '../../components/ui'
import { CLAUSES } from '../../data/clauses'
import { useT, type Lang } from '../../i18n'

export default function ClauseLibraryTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="clause-library">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  return (
    <div data-tool="clause-library" className="mx-auto max-w-3xl">
      <div className="space-y-4">
        <VerdictBanner>{t('clause-library.verdict')}</VerdictBanner>
        {CLAUSES.map((c) => {
          const body = t(`clause-library.${c.id}.body`)
          return (
            <Card key={c.id} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                {t(`clause-library.cat.${c.category}`)}
              </p>
              <h3 className="text-sm font-bold">{t(`clause-library.${c.id}.title`)}</h3>
              <p className="text-[13px] leading-relaxed text-ink-soft">{body}</p>
              <CopyButton text={body} label={t('ui.copyText')} copiedLabel={t('ui.copied')} />
            </Card>
          )
        })}
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
