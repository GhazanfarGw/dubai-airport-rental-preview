import { prefersReducedMotion } from '@/lib/motion'
import { useTranslation } from 'react-i18next'

/**
 * A dark, auto-scrolling strip of the makes found across the Bliss Rent
 * fleet, placed right after the hero. Brand names are rendered as plain
 * text badges (not logo artwork) — deliberately: reproducing each
 * manufacturer's trademarked logo mark would need licensed assets we
 * don't have, whereas naming the brands we carry is ordinary, accurate
 * marketing copy. The list mirrors the fleet's real Economy → Luxury
 * spread (see home.brands in en.ts/ar.ts) rather than name-dropping
 * supercar marques nothing in the fleet actually claims to have.
 *
 * The scroll is built from two back-to-back copies of the same list
 * (marquee-scroll in index.css translates exactly -50%, so the seam is
 * invisible) and is skipped for prefers-reduced-motion in favor of a
 * static wrapped row.
 */
export function BrandsMarquee() {
  const { t } = useTranslation()
  const brands = t('home.brands.items', { returnObjects: true }) as string[]
  const reducedMotion = prefersReducedMotion()

  return (
    <section className="bg-brand-navy-dark py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-brand-gold-light">
          {t('home.brands.title')}
        </p>
      </div>

      <div className="mt-5 overflow-hidden">
        {reducedMotion ? (
          <div className="flex flex-wrap justify-center gap-3 px-4">
            {brands.map((brand) => (
              <BrandBadge key={brand} name={brand} />
            ))}
          </div>
        ) : (
          <div className="animate-marquee flex w-max gap-3">
            {[...brands, ...brands].map((brand, i) => (
              <BrandBadge key={`${brand}-${i}`} name={brand} />
            ))}
          </div>
        )}
      </div>

      <p className="mt-5 text-center text-xs text-slate-400">{t('home.brands.note')}</p>
    </section>
  )
}

function BrandBadge({ name }: { name: string }) {
  return (
    <span className="flex shrink-0 items-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold tracking-wide text-slate-200">
      {name}
    </span>
  )
}
