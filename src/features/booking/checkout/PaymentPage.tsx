import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCheckoutContext } from '@/features/booking/checkout/useCheckoutContext'
import { CheckoutLoadGate } from '@/features/booking/checkout/CheckoutLoadGate'
import { CheckoutStepLayout } from '@/features/booking/checkout/CheckoutStepLayout'
import { confirmPayment, CheckoutApiError } from '@/features/booking/checkout/checkoutApi'
import { readBookingResult, saveConfirmationSnapshot } from '@/features/booking/checkout/checkoutStorage'
import { criteriaToSearchParams } from '@/features/booking/searchParams'
import { StateMessage } from '@/features/shared/StateMessage'

export function PaymentPage() {
  const { t } = useTranslation()
  const { id: vehicleId, bookingId } = useParams<{ id: string; bookingId: string }>()
  const navigate = useNavigate()
  const { loadState, vehicle, errorMessage, criteria, pickup, dropoff, draft } = useCheckoutContext(vehicleId)
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242')
  const [submitting, setSubmitting] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  if (loadState !== 'ready' || !vehicle || !criteria) {
    return <CheckoutLoadGate loadState={loadState} vehicleId={vehicleId} errorMessage={errorMessage} />
  }

  const bookingResult = bookingId ? readBookingResult(bookingId) : null

  if (!bookingResult) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <StateMessage
          tone="error"
          title={t('checkout.payment.notFoundTitle')}
          body={t('checkout.payment.notFoundBody')}
          action={
            <Link to={`/vehicles/${vehicleId}`} className="text-sm font-semibold text-brand-navy underline">
              {t('checkout.backToVehicle')}
            </Link>
          }
        />
      </div>
    )
  }

  const qs = criteriaToSearchParams(criteria).toString()

  const knownApiCodes = ['VALIDATION_ERROR', 'VEHICLE_NOT_FOUND', 'VEHICLE_UNAVAILABLE', 'INVALID_LOCATION', 'NO_PRICING', 'PAYMENT_NOT_FOUND', 'SERVER_ERROR']
  function translatedApiError(err: CheckoutApiError): string {
    return knownApiCodes.includes(err.code) ? t(`errors.api.${err.code}`) : err.message
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting || !vehicle) return // duplicate-submit guard; !vehicle can't happen given the earlier gate, but narrows the type for TS
    setSubmitting(true)
    setPayError(null)
    try {
      const result = await confirmPayment({ paymentId: bookingResult!.paymentId, cardNumber })

      if (result.paymentStatus === 'failed') {
        setPayError(t('checkout.payment.declined'))
        return
      }

      saveConfirmationSnapshot({
        bookingReference: bookingResult!.bookingReference,
        bookingId: result.bookingId,
        vehicleMake: vehicle.make,
        vehicleModel: vehicle.model,
        startDate: criteria!.startDate,
        endDate: criteria!.endDate,
        pickupLocationName: pickup?.name ?? '—',
        dropoffLocationName: dropoff?.name ?? '—',
        customerName: draft.customer.fullName,
        driverName: draft.driver.fullName,
        totalPrice: bookingResult!.totalPrice,
        currency: bookingResult!.currency,
        paymentStatus: result.paymentStatus,
        bookingStatus: result.bookingStatus,
      })
      navigate(`/checkout/${vehicleId}/confirmation/${result.bookingId}`)
    } catch (err) {
      setPayError(err instanceof CheckoutApiError ? translatedApiError(err) : t('checkout.payment.genericError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <CheckoutStepLayout
      stepIndex={3}
      title={t('checkout.payment.title')}
      vehicle={vehicle}
      startDate={criteria.startDate}
      endDate={criteria.endDate}
      pickup={pickup}
      dropoff={dropoff}
    >
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-brand-navy/10 bg-white p-5">
        <div className="flex items-center justify-between rounded-lg bg-brand-gold-light/30 px-3 py-2 text-xs font-semibold text-brand-gold-dark">
          <span>{t('checkout.payment.testBadge')}</span>
        </div>

        <div className="rounded-lg bg-brand-lavender/40 px-4 py-3 text-sm text-brand-navy">
          <div className="flex items-center justify-between">
            <span>{t('checkout.payment.bookingReference')}</span>
            <span className="font-mono font-semibold">{bookingResult.bookingReference}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span>{t('checkout.payment.amountDue')}</span>
            <span className="font-semibold">
              {bookingResult.currency} {bookingResult.totalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t('checkout.payment.cardNumber')}
          </span>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-brand-navy outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
          />
          <span className="mt-1 block text-xs text-slate-500">{t('checkout.payment.cardNumberHelp')}</span>
        </label>

        {payError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{payError}</div>}

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-navy-dark transition-colors hover:bg-brand-gold-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? t('checkout.payment.processing')
              : `${t('checkout.payment.pay')} ${bookingResult.currency} ${bookingResult.totalPrice.toLocaleString()}`}
          </button>
          <Link to={`/checkout/${vehicleId}/summary?${qs}`} className="text-sm font-semibold text-slate-600 underline hover:text-brand-navy">
            {t('checkout.payment.backToSummary')}
          </Link>
        </div>
      </form>
    </CheckoutStepLayout>
  )
}
