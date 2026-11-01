import { useLang, useT } from '../i18n'
import { withLang } from '../lib/langPath'
import { EraseData } from './EraseData'
import { ShieldCheck } from './icons'

/**
 * Both halves of the privacy promise, at the first money keystroke rather than
 * in the footer: nothing is sent, and it is saved in this browser. "Erase"
 * opens the same dialog as the footer; "How to check" goes to the privacy page.
 * Only for forms that do save what is typed (PRODUCT.md, "The trust position").
 */
export function PrivacyLine() {
  const t = useT()
  const { lang } = useLang()
  return (
    <div data-privacy-line className="flex gap-2 text-[14px] leading-relaxed text-ink-soft">
      <ShieldCheck size={16} className="mt-[3px] text-leaf" />
      <p>
        {t('ui.privacyLine')}{' '}
        <EraseData label={t('ui.privacyErase')} className="font-semibold text-ink underline underline-offset-2" />
        <span aria-hidden> · </span>
        <a href={`${withLang(lang, 'privacy')}#check`} className="font-semibold text-ink underline underline-offset-2">
          {t('ui.privacyCheck')}
        </a>
      </p>
    </div>
  )
}
