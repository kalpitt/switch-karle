import { useLang, useT } from '../i18n'
import { latinLang } from '../lib/latinLang'
import type { ListEntry } from '../data/journey'
import { toolHref } from '../lib/toolHref'
import { ChevronRight } from './icons'

/**
 * A tool as a list row (VIS-27): name, one line of what it does, a chevron.
 * Shared by /tools/ and the step pages. `prefix` is a short "when" lead-in that
 * tells apart tools that sound alike ("Two or three offers:").
 */
export function RowLink({
  href,
  title,
  desc,
  entry,
  prefix,
}: {
  href: string
  title: string
  desc: string
  /** `data-entry`, the slug the row stands for (tests find rows by it). */
  entry: string
  prefix?: string
}) {
  const { lang } = useLang()
  return (
    <li>
      <a
        href={href}
        data-entry={entry}
        className="group/row flex min-h-[44px] items-start gap-3 border-b border-line py-3 transition-colors hover:border-field"
      >
        <span className="min-w-0 flex-1">
          <span
            lang={latinLang(title, lang)}
            className="block text-[15px] font-semibold leading-snug text-ink group-hover/row:underline group-hover/row:underline-offset-2"
          >
            {title}
          </span>
          <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">
            {prefix && <span className="font-semibold text-ink">{prefix} </span>}
            {desc}
          </span>
        </span>
        <ChevronRight className="mt-1 text-ink-faint" />
      </a>
    </li>
  )
}

/** A list entry (a tool, or a What to say row holding its situations) as a row. */
export function EntryRow({ entry, prefix }: { entry: ListEntry; prefix?: string }) {
  const t = useT()
  const { lang } = useLang()
  const target = entry.kind === 'tool' ? entry.tool : entry.situations[0]!
  const title = t(entry.kind === 'tool' ? entry.tool.titleKey : entry.group.titleKey)
  // A What to say row names the situations it holds.
  const desc =
    entry.kind === 'tool' ? t(entry.tool.descKey) : entry.situations.map((s) => t(s.titleKey)).join(' · ')
  return (
    <RowLink
      href={toolHref(lang, target.slug)}
      title={title}
      desc={desc}
      entry={entry.kind === 'tool' ? entry.tool.slug : entry.group.slug}
      prefix={prefix}
    />
  )
}
