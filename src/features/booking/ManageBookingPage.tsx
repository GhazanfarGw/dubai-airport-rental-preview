import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { lookupBooking, BookingLookupError } from '@/features/booking/lookupApi'
import { ExtendRentalSection } from '@/features/booking/ExtendRentalSection'
import type { BookingLookupResult } from '@/types/domain'

type ViewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'error'; message: string }
  | { status: 'found'; result: BookingLookupResult }

const EXTENDABLE_STATUSES = new Set(['confirmed', 'active'])

/**
 * Booking Status — merged "check my booking" + "extend my rental" page.
 *
 * Originally two separate screens (Phase 6's reference+email lookup, and
 * the Phase 7 reassignment respec's reference+vehicle-number Extend
 * Rental page). Merged per a direct follow-up request: one single field
 * — the booking reference OR the vehicle's plate number, either alone —
 * finds the booking, and if it's in a state that can still be extended,
 * the extend-request form (ExtendRentalSection) appears right below the
 * result instead of sending the customer to a second page. See
 * lookupApi.ts and the lookup_booking_for_customer() migration for the
 * deliberate single-field trade-off this relies on.
 */
export function ManageBookingPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [state, setState] = useState<ViewState>({ status: 'idle' })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setState({ status: 'loading' })
    try {
      const result = await lookupBooking(query)
      setState(result ? { status: 'found', result } : { status: 'not_found' })
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof BookingLookupError ? err.message : t('manageBooking.genericError'),
      })
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-xl font-bold text-brand-navy">{t('manageBooking.title')}</h1>
      <p className="mt-1 text-sm text-slate-600">{t('manageBooking.subtitle')}</p>

      <form onSubmit={(e) => void handleSubmit(e)} noValidate className="mt-6 space-y-4 rounded-2xl border border-brand-navy/10 bg-white p-5">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t('manageBooking.queryLabel')}
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="BLS-XXXXXXXX or ABC-123"
            className={inputClass}
            autoComplete="off"
          />
        </label>

        <button
          type="submit"
          disabled={state.status === 'loading'}
          className="w-full rounded-lg bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:opacity-60 sm:w-auto"
        >
          {state.status === 'loading' ? t('manageBooking.checking') : t('manageBooking.submit')}
        </button>

        {state.status === 'not_found' && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {t('manageBooking.notFound')}
          </p>
        )}
        {state.status === 'error' && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.message}</p>
        )}
      </form>

      {state.status === 'found' && <ResultCard result={state.result} />}

      <div className="mt-6 text-center">
        <Link to="/" className="text-sm font-semibold text-brand-navy underline">
          {t('checkout.confirmation.backToHome')}
        </Link>
      </div>
    </div>
  )
}

function ResultCard({ result }: { result: BookingLookupResult }) {
  const { t } = useTranslation()
  const isConfirmed = result.bookingStatus === 'confirmed'
  const canExtend = EXTENDABLE_STATUSES.has(result.bookingStatus)

  return (
    <div className="mt-6 space-y-4 rounded-2xl border border-brand-navy/10 bg-white p-6">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-semibold text-brand-navy">{result.bookingReference}</span>
        <span
          className={
            'rounded-full px-3 py-1 text-xs font-semibold capitalize ' +
            (isConfirmed ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600')
          }
        >
          {result.bookingStatus.replace(/_/g, ' ')}
        </span>
      </div>
      <Row label={t('checkout.confirmation.vehicle')} value={`${result.vehicleMake} ${result.vehicleModel}`} />
      <Row label={t('extendRental.vehicleNumberLabel')} value={result.vehiclePlate} />
      <Row label={t('checkout.confirmation.rentalDates')} value={`${result.startDate} → ${result.endDate}`} />
      <Row label={t('checkout.confirmation.pickup')} value={result.pickupLocationName} />
      <Row label={t('checkout.confirmation.dropoff')} value={result.dropoffLocationName} />
      <Row label={t('checkout.confirmation.customer')} value={result.customerName} />
      <Row label={t('checkout.confirmation.amount')} value={`${result.currency} ${result.totalPrice.toLocaleString()}`} />
      <Row label={t('checkout.confirmation.paymentStatus')} value={result.paymentStatus} />

      {canExtend && (
        <ExtendRentalSection
          bookingReference={result.bookingReference}
          vehicleNumber={result.vehiclePlate}
          currentReturnDate={result.endDate}
        />
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium capitalize text-brand-navy">{value.replace(/_/g, ' ')}</span>
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-brand-navy outline-none transition-colors focus:border-brand-navy focus:ring-1 focus:ring-brand-navy'
