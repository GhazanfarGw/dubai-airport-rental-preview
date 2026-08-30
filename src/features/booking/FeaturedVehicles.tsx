import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchFeaturedVehicles } from '@/features/booking/api'
import { VehicleCard } from '@/features/booking/VehicleCard'
import { SectionHeader } from '@/features/shared/ui/SectionHeader'
import { StateMessage } from '@/features/shared/StateMessage'
import type { VehicleWithDetails } from '@/types/domain'

/**
 * Homepage "Featured Vehicles" section. Shows real vehicles from the
 * database (no dates, so VehicleCard falls back to its headline "From
 * <rate>" price) or an honest empty state — never invented cars, prices,
 * or fleet counts.
 */
export function FeaturedVehicles() {
  const { t } = useTranslation()
  const [vehicles, setVehicles] = useState<VehicleWithDetails[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchFeaturedVehicles()
      .then((data) => {
        if (!cancelled) setVehicles(data)
      })
      .catch(() => {
        if (!cancelled) setError(t('errors.api.SERVER_ERROR'))
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loading = vehicles === null && !error

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeader
        as="h2"
        title={t('home.featured.title')}
        description={t('home.featured.subtitle')}
        action={
          vehicles && vehicles.length > 0 ? (
            <Link
              to="/search"
              className="text-sm font-semibold text-brand-navy underline-offset-4 hover:text-brand-navy-light hover:underline"
            >
              {t('home.featured.viewAll')}
            </Link>
          ) : undefined
        }
      />

      <div className="mt-8">
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-brand-lavender/40" />
            ))}
          </div>
        )}

        {!loading && (error || !vehicles || vehicles.length === 0) && (
          <StateMessage title={t('home.featured.emptyTitle')} body={t('home.featured.emptyBody')} />
        )}

        {!loading && !error && vehicles && vehicles.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} detailHref={`/vehicles/${vehicle.id}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
