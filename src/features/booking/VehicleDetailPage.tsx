import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { criteriaToSearchParams } from '@/features/booking/searchParams'
import {
  fetchLocations,
  fetchVehicleById,
  isVehicleAvailable,
  BookingApiError,
} from '@/features/booking/api'
import { VehicleGallery } from '@/features/booking/VehicleGallery'
import { StateMessage, Spinner } from '@/features/shared/StateMessage'
import { quoteForDays, cheapestHeadlineRate, TERM_LABELS } from '@/lib/pricing'
import { rentalDays, validateDateRange } from '@/lib/dateRange'
import { isCompleteCriteria, searchParamsToCriteria } from '@/features/booking/searchParams'
import type { Location, VehicleWithDetails } from '@/types/domain'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'not_found' }
  | { status: 'loaded'; vehicle: VehicleWithDetails }

export function VehicleDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const criteria = searchParamsToCriteria(searchParams)
  const completeCriteria = isCompleteCriteria(criteria) ? criteria : null
  const hasDates = Boolean(completeCriteria && validateDateRange(completeCriteria.startDate, completeCriteria.endDate).valid)

  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [locations, setLocations] = useState<Location[]>([])
  const [availability, setAvailability] = useState<'checking' | 'available' | 'unavailable' | 'unknown'>(
    hasDates ? 'checking' : 'unknown',
  )

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setState({ status: 'loading' })
    fetchVehicleById(id)
      .then((vehicle) => {
        if (cancelled) return
        setState(vehicle ? { status: 'loaded', vehicle } : { status: 'not_found' })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setState({
          status: 'error',
          message: err instanceof BookingApiError || err instanceof Error ? err.message : 'Something went wrong.',
        })
      })
    fetchLocations().then((data) => {
      if (!cancelled) setLocations(data)
    })
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!id || !hasDates) {
      setAvailability('unknown')
      return
    }
    let cancelled = false
    setAvailability('checking')
    isVehicleAvailable(id, criteria.startDate!, criteria.endDate!)
      .then((ok) => {
        if (!cancelled) setAvailability(ok ? 'available' : 'unavailable')
      })
      .catch(() => {
        if (!cancelled) setAvailability('unknown')
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, hasDates, criteria.startDate, criteria.endDate])

  if (state.status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Spinner className="h-8 w-8" />
        <p className="mt-3 text-sm text-slate-500">{t('common.loading')}</p>
      </div>
    )
  }

  if (state.status === 'not_found') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <StateMessage
          title={t('vehicleDetail.notFoundTitle')}
          body={t('vehicleDetail.notFoundBody')}
          action={
            <Link to="/search" className="text-sm font-semibold text-brand-navy underline">
              {t('vehicleDetail.backToSearch')}
            </Link>
          }
        />
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <StateMessage tone="error" title={t('vehicleDetail.errorTitle')} body={state.message} />
      </div>
    )
  }

  const { vehicle } = state
  const days = hasDates ? rentalDays(criteria.startDate!, criteria.endDate!) : null
  const quote = days ? quoteForDays(vehicle.pricing, days) : null
  const headline = cheapestHeadlineRate(vehicle.pricing)
  const pickup = locations.find((l) => l.id === criteria.pickupLocationId)
  const dropoff = locations.find((l) => l.id === criteria.dropoffLocationId)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/search" className="text-sm font-medium text-slate-500 hover:text-brand-navy">
        ← {t('vehicleDetail.backToResults')}
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VehicleGallery images={vehicle.vehicle_images} alt={`${vehicle.make} ${vehicle.model}`} />

          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-brand-navy">
                {vehicle.make} {vehicle.model}
              </h1>
              {vehicle.vehicle_categories && (
                <span className="rounded-full bg-brand-lavender px-3 py-1 text-xs font-medium text-brand-navy">
                  {vehicle.vehicle_categories.name}
                </span>
              )}
            </div>

            <h2 className="mt-6 text-sm font-semibold text-brand-navy">{t('vehicleDetail.specifications')}</h2>
            <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Spec label={t('vehicleDetail.year')} value={String(vehicle.model_year)} />
              <Spec label={t('vehicleDetail.transmission')} value={vehicle.transmission} capitalize />
              <Spec label={t('vehicleDetail.seats')} value={String(vehicle.seats)} />
              {vehicle.vehicle_categories && <Spec label={t('vehicleDetail.category')} value={vehicle.vehicle_categories.name} />}
            </dl>
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-brand-navy/10 bg-white p-5 shadow-sm">
            {quote ? (
              <>
                <p className="text-2xl font-bold text-brand-navy">
                  {quote.currency} {quote.totalPrice.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">
                  {quote.currency} {quote.unitPrice.toLocaleString()} {TERM_LABELS[quote.term]} · {days}{' '}
                  {t(days === 1 ? 'common.day' : 'common.days')}
                </p>
              </>
            ) : headline ? (
              <>
                <p className="text-2xl font-bold text-brand-navy">
                  {headline.currency} {headline.client_price.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">
                  {TERM_LABELS[headline.term]} — {t('vehicleDetail.selectDatesForQuote')}
                </p>
              </>
            ) : (
              <p className="text-sm font-medium text-slate-500">{t('vehicleDetail.pricingSoon')}</p>
            )}

            <div className="mt-4 space-y-2 border-t border-brand-navy/10 pt-4 text-sm">
              <Row label={t('vehicleDetail.dates')} value={hasDates ? `${criteria.startDate} → ${criteria.endDate}` : t('vehicleDetail.notSelected')} />
              <Row label={t('vehicleDetail.pickup')} value={pickup?.name ?? t('vehicleDetail.notSelected')} />
              <Row label={t('vehicleDetail.dropoff')} value={dropoff?.name ?? t('vehicleDetail.notSelected')} />
              <Row label={t('vehicleDetail.availability')} value={<AvailabilityBadge state={availability} />} />
            </div>

            {!hasDates && (
              <p className="mt-4 text-xs text-slate-500">
                <Link to="/search" className="font-semibold text-brand-navy underline">
                  {t('vehicleDetail.chooseDatesPrompt')}
                </Link>{' '}
                {t('vehicleDetail.chooseDatesSuffix')}
              </p>
            )}

            <button
              type="button"
              disabled={!hasDates || availability !== 'available'}
              onClick={() => {
                if (!id || !completeCriteria || !hasDates) return
                navigate(`/checkout/${id}/customer?${criteriaToSearchParams(completeCriteria).toString()}`)
              }}
              className="mt-5 w-full rounded-lg bg-brand-gold px-4 py-3 text-sm font-semibold text-brand-navy-dark transition-colors hover:bg-brand-gold-light disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              {t('vehicleDetail.continueBooking')}
            </button>
            <p className="mt-2 text-center text-xs text-slate-400">
              {t('vehicleDetail.paymentNote')}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Spec({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className={'text-sm font-medium text-brand-navy ' + (capitalize ? 'capitalize' : '')}>{value}</dd>
    </div>
  )
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-brand-navy">{value}</span>
    </div>
  )
}

function AvailabilityBadge({ state }: { state: 'checking' | 'available' | 'unavailable' | 'unknown' }) {
  const { t } = useTranslation()
  if (state === 'checking') return <span className="text-slate-400">{t('vehicleDetail.checking')}</span>
  if (state === 'available') return <span className="text-emerald-600">{t('vehicleDetail.available')}</span>
  if (state === 'unavailable') return <span className="text-red-600">{t('vehicleDetail.unavailable')}</span>
  return <span className="text-slate-400">{t('vehicleDetail.selectDates')}</span>
}
