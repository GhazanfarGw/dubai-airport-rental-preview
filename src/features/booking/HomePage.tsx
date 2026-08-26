import { useNavigate } from 'react-router-dom'
import { HeroCarousel } from '@/features/booking/HeroCarousel'
import { BookingSearchSection } from '@/features/booking/BookingSearchSection'
import { StickySearchBar } from '@/features/booking/StickySearchBar'
import { WhyChooseSection } from '@/features/booking/WhyChooseSection'
import { FeaturedVehicles } from '@/features/booking/FeaturedVehicles'
import { HowItWorksSection } from '@/features/booking/HowItWorksSection'
import { criteriaToSearchParams } from '@/features/booking/searchParams'
import type { SearchCriteria } from '@/types/domain'

/**
 * Section order per the Phase 4 spec: Header (Layout) -> full-width Hero
 * carousel -> Booking Search -> Why Choose Bliss Rent -> Featured Vehicles
 * -> How It Works -> Footer (Layout). The old value-props grid is now
 * WhyChooseSection; the old icon-based HeroSlider is retired in favor of
 * HeroCarousel, the homepage's new main visual focus.
 */
export function HomePage() {
  const navigate = useNavigate()

  function handleSearch(criteria: SearchCriteria) {
    navigate({ pathname: '/search', search: criteriaToSearchParams(criteria).toString() })
  }

  return (
    <div>
      <HeroCarousel />
      <BookingSearchSection onSearch={handleSearch} />
      <StickySearchBar onSearch={handleSearch} />

      <div className="mt-14 sm:mt-20">
        <WhyChooseSection />
        <FeaturedVehicles />
        <HowItWorksSection />
      </div>
    </div>
  )
}
