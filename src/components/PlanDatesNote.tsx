import type { PlanDates } from '../data/planDates'
import { formatLongDate } from '../lib/formatDate'
import { useLang, useT } from '../i18n'

/**
 * Says which dates on screen came from the home plan, so nobody wonders where a
 * date they never typed here came from. Renders nothing once the person has
 * replaced every plan date in the tool (`stillFromPlan`).
 */
export function PlanDatesNote({ dates }: { dates: PlanDates }) {
  const t = useT()
  const { lang } = useLang()
  const items = [
    dates.joinDate && t('plan-dates.join', { date: formatLongDate(dates.joinDate, lang) }),
    dates.resignDate && t('plan-dates.resign', { date: formatLongDate(dates.resignDate, lang) }),
    dates.lastWorkingDay && t('plan-dates.lwd', { date: formatLongDate(dates.lastWorkingDay, lang) }),
  ].filter((item): item is string => Boolean(item))
  if (items.length === 0) return null
  return (
    <p data-plan-dates className="rounded-xl bg-paper px-3 py-2.5 text-[13px] leading-snug text-ink-soft">
      {t('plan-dates.from', { items: items.join('; ') })}
    </p>
  )
}
