import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HeroCarousel } from '@/features/booking/HeroCarousel'
import { BrandsMarquee } from '@/features/booking/BrandsMarquee'
import { BookingSearchSection } from '@/features/booking/BookingSearchSection'
import { WhyChooseSection } from '@/features/booking/WhyChooseSection'
import { RequirementsSection } from '@/features/booking/RequirementsSection'
import { LocationsPreviewSection } from '@/features/booking/LocationsPreviewSection'
import { FeaturedVehicles } from '@/features/booking/FeaturedVehicles'
import { HowItWorksSection } from '@/features/booking/HowItWorksSection'
import { VehicleCategoriesSection } from '@/features/booking/VehicleCategoriesSection'
import { HomeFaqSection } from '@/features/booking/HomeFaqSection'
import { criteriaToSearchParams } from '@/features/booking/searchParams'
import type { SearchCriteria } from '@/types/domain'

/**
 * Section order per the Phase 4 spec: Header (Layout) -> full-width Hero
 * carousel -> Booking Search -> Brands marquee -> live categories -> featured
 * vehicles -> Why Choose Bliss Rent -> Requirements -> locations -> How It
 * Works -> FAQ -> final booking CTA -> Footer. The old value-props grid is now WhyChooseSection; the
 * old icon-based HeroSlider is retired in favor of HeroCarousel, the
 * homepage's new main visual focus.
 */
export function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  function handleSearch(criteria: SearchCriteria) {
    navigate({ pathname: '/search', search: criteriaToSearchParams(criteria).toString() })
  }

  return (
    <div>
      <HeroCarousel />
      <BookingSearchSection onSearch={handleSearch} />
      <BrandsMarquee />

      <div>
        <VehicleCategoriesSection />
        <FeaturedVehicles />
        <WhyChooseSection />
        <RequirementsSection />
        <LocationsPreviewSection />
        <HowItWorksSection />
        <HomeFaqSection />
        <section className="bg-brand-navy px-4 py-14 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">{t('home.finalCta.title')}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/70">{t('home.finalCta.subtitle')}</p>
          <button type="button" onClick={() => document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-brand-gold px-5 py-3 text-sm font-semibold text-brand-navy-dark transition-colors hover:bg-brand-gold-light focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-navy">{t('home.finalCta.button')}</button>
        </section>
      </div>
    </div>
  )
}
