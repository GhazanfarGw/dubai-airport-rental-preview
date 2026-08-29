import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchFeaturedVehicles } from '@/features/booking/api'
import { VehicleCard } from '@/features/booking/VehicleCard'
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy sm:text-3xl">{t('home.featured.title')}</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-600">{t('home.featured.subtitle')}</p>
        </div>
        {vehicles && vehicles.length > 0 && (
          <Link
            to="/search"
            className="shrink-0 text-sm font-semibold text-brand-navy underline-offset-4 hover:text-brand-navy-light hover:underline"
          >
            {t('home.featured.viewAll')}
          </Link>
        )}
      </div>

      <div className="mt-8">
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-brand-lavender/40" />
            ))}
          </div>
        )}

        {!loading && (error || !vehicles || vehicles.length === 0) && (
          <div className="rounded-2xl border border-dashed border-brand-navy/15 bg-brand-lavender/20 px-6 py-14 text-center">
            <p className="text-base font-semibold text-brand-navy">{t('home.featured.emptyTitle')}</p>
            <p className="mt-2 text-sm text-slate-600">{t('home.featured.emptyBody')}</p>
          </div>
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
