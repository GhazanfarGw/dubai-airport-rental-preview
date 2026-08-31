import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchAllAvailableVehicles } from '@/features/booking/api'
import { SectionHeader } from '@/features/shared/ui/SectionHeader'
import { StateMessage } from '@/features/shared/StateMessage'
import type { VehicleWithDetails } from '@/types/domain'

/** A live category index derived only from currently available public vehicles. */
export function VehicleCategoriesSection() {
  const { t } = useTranslation()
  const [vehicles, setVehicles] = useState<VehicleWithDetails[] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchAllAvailableVehicles()
      .then((data) => {
        if (!cancelled) setVehicles(data)
      })
      .catch(() => {
        if (!cancelled) setVehicles([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const categories = Array.from(
    new Map(
      (vehicles ?? [])
        .filter((vehicle) => vehicle.vehicle_categories)
        .map((vehicle) => [vehicle.vehicle_categories!.id, vehicle.vehicle_categories!]),
    ).values(),
  )

  return (
    <section className="bg-surface-muted">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeader as="h2" title={t('home.categories.title')} description={t('home.categories.subtitle')} />
        {vehicles === null && <div className="grid gap-4 sm:grid-cols-3" aria-hidden="true">{[1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-brand-lavender/50" />)}</div>}
        {vehicles !== null && categories.length === 0 && <StateMessage title={t('home.categories.emptyTitle')} body={t('home.categories.emptyBody')} />}
        {categories.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.id} to="/search" className="group min-h-32 rounded-2xl border border-brand-navy/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-gold hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-brand-navy">{category.name}</h3>
                    {category.description && <p className="mt-2 text-sm leading-relaxed text-slate-600">{category.description}</p>}
                  </div>
                  <span className="text-xl text-brand-gold transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" aria-hidden="true">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}