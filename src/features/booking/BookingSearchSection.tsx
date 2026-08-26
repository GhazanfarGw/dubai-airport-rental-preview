import { useTranslation } from 'react-i18next'
import { SearchWidget } from '@/features/booking/SearchWidget'
import type { SearchCriteria } from '@/types/domain'

interface BookingSearchSectionProps {
  onSearch: (criteria: SearchCriteria) => void
}

/**
 * The large, premium booking/search section directly below the hero. This
 * is a visual wrapper only — all search logic (date validation, location
 * loading, submit handling) stays in SearchWidget, reused unchanged. The
 * `id` here is what the hero CTA scrolls to and what StickySearchBar's
 * IntersectionObserver watches to know when it's scrolled out of view.
 */
export function BookingSearchSection({ onSearch }: BookingSearchSectionProps) {
  const { t } = useTranslation()

  return (
    <section
      id="booking-section"
      className="relative z-10 -mt-10 scroll-mt-20 sm:-mt-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-5 shadow-xl shadow-brand-navy/10 sm:p-8">
          <div className="max-w-xl">
            <h2 className="text-xl font-bold text-brand-navy sm:text-2xl">{t('home.booking.title')}</h2>
            <p className="mt-1.5 text-sm text-slate-600">{t('home.booking.subtitle')}</p>
          </div>
          <div className="mt-6">
            <SearchWidget onSearch={onSearch} />
          </div>
        </div>
      </div>
    </section>
  )
}
