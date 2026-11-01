import { useLang, useT } from '../i18n'
import { withLang } from '../lib/langPath'
import { EraseData } from './EraseData'

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
    <div data-privacy-line className="text-xs leading-relaxed text-leaf">
      <span aria-hidden>● </span>
      {t('ui.privacyLine')}{' '}
      <EraseData label={t('ui.privacyErase')} className="font-semibold underline" />
      <span aria-hidden> · </span>
      <a href={`${withLang(lang, 'privacy')}#check`} className="font-semibold underline">
        {t('ui.privacyCheck')}
      </a>
    </div>
  )
}
