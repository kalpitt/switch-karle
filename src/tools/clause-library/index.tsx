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
    <div data-tool="clause-library" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card>
        <h2 className="text-base font-bold">{t('clause-library.title')}</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{t('clause-library.desc')}</p>
      </Card>
      <div className="-order-1 space-y-4 lg:order-none">
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
