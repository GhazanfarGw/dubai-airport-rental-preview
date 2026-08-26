import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-brand-navy/20 bg-brand-navy-dark text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-bold text-brand-navy">
                BR
              </span>
              <span className="text-sm font-semibold text-white">{t('nav.brand')}</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-400">{t('footer.tagline')}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-brand-gold-light">{t('footer.quickLinks')}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/" className="text-slate-400 transition-colors hover:text-white">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-slate-400 transition-colors hover:text-white">
                  {t('nav.browseFleet')}
                </Link>
              </li>
              <li>
                <Link to="/manage-booking" className="text-slate-400 transition-colors hover:text-white">
                  {t('footer.manageBooking')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-brand-gold-light">{t('footer.goodToKnow')}</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>{t('footer.knowDubaiOnly')}</li>
              <li>{t('footer.knowWebsiteOnly')}</li>
              <li>{t('footer.knowOwnDriver')}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} {t('footer.copyright')}
        </div>
      </div>
    </footer>
  )
}
