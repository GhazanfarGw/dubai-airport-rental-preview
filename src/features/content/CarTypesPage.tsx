import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface CategoryItem {
  name: string
  tagline: string
  description: string
  idealFor: string
}

/**
 * Marketing overview of the fleet's categories — distinct from
 * /search, which shows live, real inventory. This page is descriptive
 * content only (no live data), so it never goes stale as vehicles are
 * added/retired in the admin dashboard.
 */
export function CarTypesPage() {
  const { t } = useTranslation()
  const categories = t('pages.carTypes.categories', { returnObjects: true }) as CategoryItem[]

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">{t('pages.carTypes.title')}</h1>
        <p className="mt-2 text-sm text-slate-600">{t('pages.carTypes.subtitle')}</p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {categories.map((cat) => (
          <div key={cat.name} className="rounded-2xl border border-brand-navy/10 bg-white p-6 shadow-sm">
            <span className="inline-block rounded-full bg-brand-lavender px-3 py-1 text-xs font-semibold text-brand-navy">
              {cat.tagline}
            </span>
            <h2 className="mt-3 text-lg font-bold text-brand-navy">{cat.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{cat.description}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{cat.idealFor}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-slate-500">{t('pages.carTypes.note')}</p>

      <div className="mt-8 flex justify-center">
        <Link
          to="/search"
          className="rounded-lg bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-navy-dark shadow-sm transition-colors hover:bg-brand-gold-light"
        >
          {t('pages.carTypes.cta')}
        </Link>
      </div>
    </div>
  )
}
