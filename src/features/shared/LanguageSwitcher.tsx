import { useTranslation } from 'react-i18next'
import { storeLanguage, type SupportedLanguage } from '@/i18n'

interface LanguageSwitcherProps {
  className?: string
}

/** Toggles between English and Arabic. The button label shows the OTHER language's name (i.e. what you'll switch to), matching the convention on most bilingual GCC sites. */
export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation()

  function toggle() {
    const next: SupportedLanguage = i18n.language === 'ar' ? 'en' : 'ar'
    void i18n.changeLanguage(next)
    storeLanguage(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={
        'rounded-lg border border-brand-navy/20 px-3 py-1.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-lavender ' +
        className
      }
      aria-label="Switch language"
    >
      {t('nav.language')}
    </button>
  )
}
