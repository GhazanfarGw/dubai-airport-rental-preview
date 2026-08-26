import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { lookupBookingByReference, BookingLookupError } from '@/features/booking/lookupApi'
import type { BookingLookupResult } from '@/types/domain'

type ViewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'error'; message: string }
  | { status: 'found'; result: BookingLookupResult }

/**
 * Phase 6 — Booking Retrieval. The guest-checkout equivalent of "manage my
 * booking": no account, no login — just the reference and email from the
 * confirmation. This is the only way to check a booking's status from a
 * different browser/device than the one used to book, or after the
 * same-browser confirmation snapshot (ConfirmationPage/sessionStorage) is
 * gone. See src/features/booking/lookupApi.ts and
 * supabase/migrations/20260829000000_phase6_booking_lookup.sql.
 */
export function ManageBookingPage() {
  const { t } = useTranslation()
  const [reference, setReference] = useState('')
  const [email, setEmail] = useState('')
  const [state, setState] = useState<ViewState>({ status: 'idle' })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!reference.trim() || !email.trim()) return
    setState({ status: 'loading' })
    try {
      const result = await lookupBookingByReference(reference, email)
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
            {t('manageBooking.referenceLabel')}
          </span>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="BLS-XXXXXXXX"
            className={inputClass}
            autoComplete="off"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t('manageBooking.emailLabel')}
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
            autoComplete="email"
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
      <Row label={t('checkout.confirmation.rentalDates')} value={`${result.startDate} → ${result.endDate}`} />
      <Row label={t('checkout.confirmation.pickup')} value={result.pickupLocationName} />
      <Row label={t('checkout.confirmation.dropoff')} value={result.dropoffLocationName} />
      <Row label={t('checkout.confirmation.customer')} value={result.customerName} />
      <Row label={t('checkout.confirmation.amount')} value={`${result.currency} ${result.totalPrice.toLocaleString()}`} />
      <Row label={t('checkout.confirmation.paymentStatus')} value={result.paymentStatus} />
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
