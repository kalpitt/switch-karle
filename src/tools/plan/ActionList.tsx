import { useState } from 'react'
import { nextAction, visibleActions, type ActionDef } from '../../data/actions'
import type { ActionId, Plan } from '../../data/plan'
import { TextArea } from '../../components/ui'
import { withLang } from '../../lib/langPath'
import type { Lang } from '../../i18n'

type T = (key: string, vars?: Record<string, string | number>) => string

/**
 * The ten first actions with tick boxes (docs/DIRECTION.md Part 6).
 *
 * Which ones show is decided in `src/data/actions.ts`; this only draws them.
 * Outbound actions are not drawn at all while locked: only a count, so nothing
 * about a referral message or a public profile change is on screen before
 * the user is ready.
 */
export function ActionList(props: {
  t: T
  lang: Lang
  plan: Plan
  today: string
  startApplyingBy: string | null
  onTick: (id: ActionId, ticked: boolean) => void
  onCompanies: (names: string[]) => void
  onBond: (hasBond: boolean) => void
}) {
  const { t, plan } = props
  const { shown, hiddenOutbound } = visibleActions(plan, props.today, props.startApplyingBy)
  const next = nextAction(shown, plan.ticks)
  const allDone = shown.length > 0 && next === null && hiddenOutbound === 0

  return (
    <section data-section="actions" className="space-y-3">
      <h2 className="text-base font-bold">{t('plan.actions.title')}</h2>
      <ul className="space-y-2">
        {shown.map((a) => (
          <ActionRow
            key={a.id}
            a={a}
            t={t}
            lang={props.lang}
            plan={plan}
            isNext={a.id === next}
            onTick={props.onTick}
            onCompanies={props.onCompanies}
          />
        ))}
      </ul>
      {hiddenOutbound > 0 && (
        <p className="text-[13px] leading-relaxed text-ink-faint">
          {t('plan.actions.hidden', { n: hiddenOutbound })}
        </p>
      )}
      {allDone && <p className="text-[14px] font-semibold leading-snug">{t('plan.actions.done')}</p>}
      {plan.hasBond !== true && (
        <button
          type="button"
          onClick={() => props.onBond(true)}
          className="py-1 text-left text-[13px] font-semibold text-ink-faint underline"
        >
          {t('plan.actions.bond.ask')}
        </button>
      )}
    </section>
  )
}

function ActionRow(props: {
  a: ActionDef
  t: T
  lang: Lang
  plan: Plan
  isNext: boolean
  onTick: (id: ActionId, ticked: boolean) => void
  onCompanies: (names: string[]) => void
}) {
  const { a, t, plan } = props
  const ticked = plan.ticks?.[a.id] != null
  const href = a.where.startsWith('tool:') ? withLang(props.lang, a.where.slice(5)) : null
  return (
    <li className={`rounded-xl border px-3 py-2.5 ${props.isNext ? 'border-saffron' : 'border-line'}`}>
      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 accent-saffron"
          checked={ticked}
          onChange={(e) => props.onTick(a.id, e.target.checked)}
        />
        <span className="min-w-0 space-y-0.5">
          <span className={`block text-[14px] font-bold leading-snug ${ticked ? 'text-ink-faint line-through' : ''}`}>
            {t(`plan.action.${a.id}.title`)}
          </span>
          <span className="block text-[13px] leading-relaxed text-ink-soft">
            {t(`plan.action.${a.id}.body`)}
          </span>
          <span className="block text-xs text-ink-faint">{t('plan.actions.minutes', { n: a.minutes })}</span>
        </span>
      </label>
      {href != null && (
        <a href={href} className="mt-1.5 ml-6 inline-block text-[13px] font-semibold text-saffron underline">
          {t(`plan.action.${a.id}.open`)}
        </a>
      )}
      {a.id === 'name-five-companies' && !ticked && (
        <CompaniesBox t={t} names={plan.companies ?? []} onSave={props.onCompanies} />
      )}
    </li>
  )
}

/** One name per line. Saved on blur, as the reason box is. */
function CompaniesBox(props: { t: T; names: string[]; onSave: (names: string[]) => void }) {
  const [text, setText] = useState(props.names.join('\n'))
  return (
    <div className="mt-2 ml-6">
      <TextArea
        label={props.t('plan.companies.label')}
        hint={props.t('plan.companies.hint')}
        value={text}
        rows={5}
        onChange={setText}
        onBlur={() => props.onSave(text.split('\n'))}
      />
    </div>
  )
}

