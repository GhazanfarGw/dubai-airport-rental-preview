import { useNavigate } from 'react-router-dom'
import { HeroCarousel } from '@/features/booking/HeroCarousel'
import { BrandsMarquee } from '@/features/booking/BrandsMarquee'
import { BookingSearchSection } from '@/features/booking/BookingSearchSection'
import { StickySearchBar } from '@/features/booking/StickySearchBar'
import { WhyChooseSection } from '@/features/booking/WhyChooseSection'
import { RequirementsSection } from '@/features/booking/RequirementsSection'
import { LocationsPreviewSection } from '@/features/booking/LocationsPreviewSection'
import { FeaturedVehicles } from '@/features/booking/FeaturedVehicles'
import { HowItWorksSection } from '@/features/booking/HowItWorksSection'
import { criteriaToSearchParams } from '@/features/booking/searchParams'
import type { SearchCriteria } from '@/types/domain'

/**
 * Section order per the Phase 4 spec: Header (Layout) -> full-width Hero
 * carousel -> Brands marquee -> Booking Search -> Why Choose Bliss Rent ->
 * Requirements ("before you book") -> Featured Vehicles -> How It Works ->
 * Footer (Layout). The old value-props grid is now WhyChooseSection; the
 * old icon-based HeroSlider is retired in favor of HeroCarousel, the
 * homepage's new main visual focus.
 */
export function HomePage() {
  const navigate = useNavigate()

  function handleSearch(criteria: SearchCriteria) {
    navigate({ pathname: '/search', search: criteriaToSearchParams(criteria).toString() })
  }

  return (
    <div>
      <HeroCarousel />
      <BrandsMarquee />
      <BookingSearchSection onSearch={handleSearch} />
      <StickySearchBar onSearch={handleSearch} />

      <div className="mt-14 sm:mt-20">
        <WhyChooseSection />
        <RequirementsSection />
        <LocationsPreviewSection />
        <FeaturedVehicles />
        <HowItWorksSection />
      </div>
    </div>
  )
}
