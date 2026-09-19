import { IslandRoot } from '../../components/IslandRoot'
import { Card, CopyButton, Disclaimer, VerdictBanner } from '../../components/ui'
import { withLang } from '../../lib/langPath'
import { useLang, useT, type Lang } from '../../i18n'

export default function OfferGoesColdTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="offer-goes-cold">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const { lang } = useLang()
  const t = useT()
  const promptText = t('offer-goes-cold.prompt.text')
  
  return (
    <div data-tool="offer-goes-cold" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card>
        <h2 className="text-base font-bold">{t('offer-goes-cold.title')}</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{t('offer-goes-cold.desc')}</p>
      </Card>
      <div className="-order-1 space-y-4 lg:order-none">
        <VerdictBanner>{t('offer-goes-cold.verdict')}</VerdictBanner>
        
        <Card className="space-y-2">
          <h3 className="text-sm font-bold">{t('offer-goes-cold.s1.title')}</h3>
          <p className="text-[13px] leading-relaxed text-ink-soft">
            {t('offer-goes-cold.s1.body.1')}
            <a href={withLang(lang, 'bgv-prep')} className="font-semibold underline">
              {t('bgv-prep.title')}
            </a>
            {t('offer-goes-cold.s1.and')}
            <a href={withLang(lang, 'relieving-chaser')} className="font-semibold underline">
              {t('relieving-chaser.title')}
            </a>
            {t('offer-goes-cold.s1.body.2')}
          </p>
        </Card>

        <Card className="space-y-2">
          <h3 className="text-sm font-bold">{t('offer-goes-cold.s2.title')}</h3>
          <p className="text-[13px] leading-relaxed text-ink-soft">{t('offer-goes-cold.s2.body')}</p>
        </Card>

        <Card className="space-y-2">
          <h3 className="text-sm font-bold">{t('offer-goes-cold.s3.title')}</h3>
          <p className="text-[13px] leading-relaxed text-ink-soft">{t('offer-goes-cold.s3.body')}</p>
        </Card>

        <Card className="space-y-2">
          <h3 className="text-sm font-bold">{t('offer-goes-cold.s4.title')}</h3>
          <p className="text-[13px] leading-relaxed text-ink-soft">
            {t('offer-goes-cold.s4.body.1')}
            <a href={withLang(lang, 'tracker')} className="font-semibold underline">
              {t('tab.tracker')}
            </a>
            {t('offer-goes-cold.s4.body.2')}
          </p>
        </Card>

        <Card className="space-y-2">
          <h3 className="text-sm font-bold">{t('offer-goes-cold.s5.title')}</h3>
          <p className="text-[13px] leading-relaxed text-ink-soft">
            {t('offer-goes-cold.s5.body.1')}
            <a href={withLang(lang, 'clause-library')} className="font-semibold underline">
              {t('clause-library.title')}
            </a>
            {t('offer-goes-cold.s5.body.2')}
          </p>
        </Card>

        <Card className="space-y-2">
          <h3 className="text-sm font-bold">{t('offer-goes-cold.s6.title')}</h3>
          <p className="text-[13px] leading-relaxed text-ink-soft">
            {t('offer-goes-cold.s6.body.1')}
            <a href={withLang(lang, 'fnf-checker')} className="font-semibold underline">
              {t('fnf-checker.title')}
            </a>
            {t('offer-goes-cold.s6.body.2')}
            <a href={withLang(lang, 'insurance-gap')} className="font-semibold underline">
              {t('insurance-gap.title')}
            </a>
            {t('offer-goes-cold.s6.body.3')}
            <a href={withLang(lang, 'notice-tracker')} className="font-semibold underline">
              {t('notice-tracker.title')}
            </a>
            {t('offer-goes-cold.s6.body.4')}
          </p>
        </Card>

        <Card className="space-y-2">
          <h3 className="text-sm font-bold">{t('offer-goes-cold.prompt.title')}</h3>
          <p className="text-[13px] leading-relaxed text-ink-soft mb-2">{t('offer-goes-cold.prompt.desc')}</p>
          <div className="bg-sheet-dim p-3 rounded text-[13px] whitespace-pre-wrap font-mono text-ink-soft border border-sheet-edge">
            {promptText}
          </div>
          <CopyButton text={promptText} label={t('ui.copyText')} copiedLabel={t('ui.copied')} />
        </Card>

        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
