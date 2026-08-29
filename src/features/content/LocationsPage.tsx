import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchLocations } from '@/features/booking/api'
import type { Location } from '@/types/domain'

type ViewState = { status: 'loading' } | { status: 'error' } | { status: 'loaded'; locations: Location[] }

/**
 * Live "where can I pick up / drop off" page — pulls real, active rows
 * from the `locations` table (the same `fetchLocations()` the search
 * widget and checkout use) rather than a hardcoded list of Dubai areas,
 * so this page can never drift out of sync with what's actually
 * bookable. Grouped by the existing `location_type` ('airport' | 'city').
 *
 * Deliberately does NOT claim door-to-door delivery or multi-emirate
 * coverage — Bliss Rent is airport pickup + Dubai-wide drop-off only
 * (see docs/ARCHITECTURE.md and the footer's "Dubai coverage only" note).
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

  const airports = state.status === 'loaded' ? state.locations.filter((l) => l.type === 'airport') : []
  const cities = state.status === 'loaded' ? state.locations.filter((l) => l.type === 'city') : []
  const isEmpty = state.status === 'loaded' && airports.length === 0 && cities.length === 0

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
          {airports.length > 0 && <LocationGroup heading={t('pages.locations.airportHeading')} locations={airports} />}
          {cities.length > 0 && <LocationGroup heading={t('pages.locations.cityHeading')} locations={cities} />}
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

function LocationGroup({ heading, locations }: { heading: string; locations: Location[] }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-brand-navy">{heading}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((loc) => (
          <div key={loc.id} className="flex items-center gap-3 rounded-xl border border-brand-navy/10 bg-white p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-lavender text-brand-navy">
              <PinIcon className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-brand-navy">{loc.name}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden="true">
      <path d="M12 21s-6.5-6.06-6.5-11A6.5 6.5 0 0 1 18.5 10c0 4.94-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  )
}
