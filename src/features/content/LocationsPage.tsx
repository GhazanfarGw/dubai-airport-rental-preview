import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchLocations } from '@/features/booking/api'
import { TYPE_ORDER, TYPE_ICON, sortByOrder } from '@/features/booking/locationDisplay'
import type { Location } from '@/types/domain'
import type { LocationType } from '@/types/database'

type ViewState = { status: 'loading' } | { status: 'error' } | { status: 'loaded'; locations: Location[] }

const TYPE_HEADING_KEY: Record<LocationType, string> = {
  airport: 'pages.locations.airportHeading',
  city: 'pages.locations.cityHeading',
  hotel: 'pages.locations.hotelHeading',
  delivery: 'pages.locations.deliveryHeading',
}

/**
 * Live "where can I pick up / drop off" page — pulls real, active rows
 * from the `locations` table (the same `fetchLocations()` the search
 * widget and checkout use) rather than a hardcoded list of areas, so this
 * page can never drift out of sync with what's actually bookable.
 *
 * UAE-wide by design: locations are grouped first by `city` — whichever
 * cities actually exist in the data today (Dubai and Abu Dhabi right now,
 * with more added purely as new rows, never a code change) — then by
 * `location_type` (airport / city-area / hotel-accommodation / delivery,
 * whichever types actually have entries in that city) within each city.
 * See docs/ARCHITECTURE.md. Each group's heading is built as
 * "{city} — {type heading}" (a dash-joined format, not a sentence)
 * specifically so it reads correctly in both English and Arabic without
 * needing a separate translated heading per city.
 */
export function LocationsPage() {
  const { t } = useTranslation()
  const [state, setState] = useState<ViewState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    fetchLocations()
      .then((locations) => {
        if (!cancelled) setState({ status: 'loaded', locations })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const locations = state.status === 'loaded' ? state.locations : []
  // Dubai first (primary market), then the rest alphabetically — same
  // ordering rule as SearchWidget's Pickup City selector.
  const cityNames = Array.from(new Set(locations.map((l) => l.city))).sort((a, b) => sortByOrder(a, b, 'Dubai'))
  const isEmpty = state.status === 'loaded' && locations.length === 0

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">{t('pages.locations.title')}</h1>
        <p className="mt-2 text-sm text-slate-600">{t('pages.locations.subtitle')}</p>
      </div>

      {state.status === 'loading' && <p className="mt-8 text-sm text-slate-500">{t('pages.locations.loading')}</p>}

      {(state.status === 'error' || isEmpty) && (
        <div className="mt-8 rounded-xl border border-brand-navy/10 bg-brand-lavender/30 px-5 py-6 text-center">
          <p className="text-sm font-semibold text-brand-navy">{t('pages.locations.emptyTitle')}</p>
          <p className="mt-1 text-sm text-slate-600">{t('pages.locations.emptyBody')}</p>
        </div>
      )}

      {state.status === 'loaded' && !isEmpty && (
        <div className="mt-8 space-y-10">
          {cityNames.map((city) => {
            const cityLocations = locations.filter((l) => l.city === city)
            const typesInCity = TYPE_ORDER.filter((type) => cityLocations.some((l) => l.type === type))
            return (
              <div key={city} className="space-y-10">
                {typesInCity.map((type) => (
                  <LocationGroup
                    key={type}
                    icon={TYPE_ICON[type]}
                    heading={`${city} — ${t(TYPE_HEADING_KEY[type])}`}
                    locations={cityLocations.filter((l) => l.type === type)}
                  />
                ))}
              </div>
            )
          })}
        </div>
      )}

      <p className="mt-8 text-xs text-slate-500">{t('pages.locations.note')}</p>

      <div className="mt-8 flex justify-center">
        <Link
          to="/search"
          className="rounded-lg bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-navy-dark shadow-sm transition-colors hover:bg-brand-gold-light"
        >
          {t('pages.locations.cta')}
        </Link>
      </div>
    </div>
  )
}

function LocationGroup({ heading, locations, icon }: { heading: string; locations: Location[]; icon: string }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-brand-navy">{heading}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((loc) => (
          <div key={loc.id} className="flex items-center gap-3 rounded-xl border border-brand-navy/10 bg-white p-4">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-lavender text-base"
              aria-hidden="true"
            >
              {icon}
            </span>
            <span className="text-sm font-medium text-brand-navy">{loc.name}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
