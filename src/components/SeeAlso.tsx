import { useLang, useT } from '../i18n'
import { toolBySlug } from '../data/tools'
import { toolHref } from '../lib/toolHref'

/**
 * One line pointing at a sibling tool that answers the other half of the same
 * question (rebuild 4.7: the buyout calculator and the buyout email). `seeAlso.<from>`
 * is the lead-in; the link is the other tool's own name.
 */
export function SeeAlso({ from, to, className = '' }: { from: string; to: string; className?: string }) {
  const t = useT()
  const { lang } = useLang()
  const target = toolBySlug(to)
  if (!target) return null
  return (
    <p data-see-also={to} className={`no-print text-[14px] leading-snug text-ink-soft ${className}`}>
      {t(`seeAlso.${from}`)}{' '}
      <a href={toolHref(lang, to)} className="inline-flex min-h-[44px] items-center font-semibold text-saffron-strong underline underline-offset-2">
        {t(target.titleKey)}
      </a>
    </p>
  )
}
