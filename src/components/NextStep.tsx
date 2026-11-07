import { toolBySlug } from '../data/tools'
import { nextFor } from '../data/journey'
import { withLang } from '../lib/langPath'
import { useLang, useT } from '../i18n'
import { ChevronRight } from './icons'

/**
 * One next thing under a tool's result (PRODUCT.md rule 9, UX-14, IA-02): a
 * single link to the tool `NEXT_STEP` in `src/data/journey.ts` picks after
 * this one, in journey order. A Hindi page links to the Hindi twin. When the
 * link crosses into a later stage, the label names that stage.
 *
 * `hidden` lets a tool withhold the link when moving on would be the wrong
 * advice, e.g. an offer letter that shows scam signs.
 */
export function NextStep({ from, hidden = false }: { from: string; hidden?: boolean }) {
  const t = useT()
  const { lang } = useLang()
  const next = nextFor(from)
  if (!next || hidden) return null

  const tool = next.kind === 'tool' ? toolBySlug(next.slug) : undefined
  if (next.kind === 'tool' && !tool) return null
  const here = toolBySlug(from)
  const label =
    tool && here && tool.journey > here.journey
      ? t('next.label.stage', { stage: t(`journey.${tool.journey}.name`) })
      : t('next.label')
  const href = tool ? withLang(lang, tool.slug) : withLang(lang)
  const title = tool ? t(tool.titleKey) : t('next.plan.title')
  const desc = tool ? t(tool.descKey) : t('next.plan.desc')

  return (
    <a
      href={href}
      data-next-step={tool?.slug ?? 'plan'}
      className="no-print group flex min-h-[44px] items-center gap-3 rounded-2xl border border-line bg-card p-4 transition-colors hover:border-field"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium leading-snug text-ink-soft">{label}</span>
        <span className="mt-0.5 block text-[15px] font-bold leading-snug text-ink group-hover:underline group-hover:underline-offset-2">
          {title}
        </span>
        <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">{desc}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-ink-soft transition-transform group-hover:translate-x-0.5" />
    </a>
  )
}
