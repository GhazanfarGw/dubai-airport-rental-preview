import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { VehicleWithDetails } from '@/types/domain'
import type { PricingTerm } from '@/types/database'
import { primaryImage } from '@/lib/vehicleImages'
import { quoteForDays, cheapestHeadlineRate } from '@/lib/pricing'
import { VehiclePhoto } from '@/features/booking/VehiclePhoto'

interface VehicleCardProps {
  vehicle: VehicleWithDetails
  /** Rental length in days, when the customer already has dates selected (search results). */
  days?: number
  detailHref: string
  /**
   * Only set on dated search results (see VehicleSearchResult) — `false`
   * means this vehicle has an overlapping booking for the searched dates.
   * It still renders (so the fleet stays browsable) but as "Reserved"
   * instead of a bookable price.
   */
  isAvailable?: boolean
}

/** Translated (not hardcoded) per-term unit labels — see vehicleCard.* in en.ts/ar.ts. */
const TERM_I18N_KEY: Record<PricingTerm, string> = {
  daily: 'vehicleCard.perDay',
  weekly: 'vehicleCard.perWeek',
  monthly: 'vehicleCard.perMonth',
  '3_month': 'vehicleCard.per3Months',
}

export function VehicleCard({ vehicle, days, detailHref, isAvailable }: VehicleCardProps) {
  const { t } = useTranslation()
  const image = primaryImage(vehicle)
  const reserved = isAvailable === false
  const quote = days != null && !reserved ? quoteForDays(vehicle.pricing, days) : null
  // No dates chosen yet (e.g. Featured Vehicles on the homepage) — show a
  // simple "From <rate>" headline instead of a dated total, using the same
  // pricing data and no separate pricing logic.
  const headlineRate = days == null && !reserved ? cheapestHeadlineRate(vehicle.pricing) : null

  return (
    <div
      className={
        'flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md ' +
        (reserved ? 'border-amber-200' : 'border-brand-navy/10')
      }
    >
      <div className="relative">
        <VehiclePhoto
          storagePath={image?.storage_path ?? null}
          alt={`${vehicle.make} ${vehicle.model}`}
          className={'h-44 w-full' + (reserved ? ' opacity-70 grayscale' : '')}
        />
        {reserved && (
          <span className="absolute end-2 top-2 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
            {t('vehicleCard.reserved')}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-brand-navy">
              {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-xs text-slate-500">{vehicle.model_year}</p>
          </div>
          {!reserved && vehicle.vehicle_categories && (
            <span className="shrink-0 rounded-full bg-brand-lavender px-2.5 py-1 text-xs font-medium text-brand-navy">
              {vehicle.vehicle_categories.name}
            </span>
          )}
        </div>

        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <dt className="sr-only">{t('vehicleCard.seats')}</dt>
            <dd>
              {vehicle.seats} {t('vehicleCard.seats')}
            </dd>
          </div>
          <div className="flex items-center gap-1">
            <dt className="sr-only">{t('vehicleDetail.transmission')}</dt>
            <dd className="capitalize">{vehicle.transmission}</dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-1 items-end justify-between gap-3">
          <div>
            {reserved ? (
              <p className="text-xs font-medium text-amber-700">{t('vehicleCard.reservedForDates')}</p>
            ) : quote ? (
              <>
                <p className="text-lg font-bold text-brand-navy">
                  {quote.currency} {quote.totalPrice.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">
                  {quote.currency} {quote.unitPrice.toLocaleString()} {t(TERM_I18N_KEY[quote.term])} ·{' '}
                  {days} {t(days === 1 ? 'common.day' : 'common.days')}
                </p>
              </>
            ) : headlineRate ? (
              <p className="text-lg font-bold text-brand-navy">
                {t('vehicleCard.from')} {headlineRate.currency} {headlineRate.client_price.toLocaleString()}
                <span className="ms-1 text-xs font-normal text-slate-500">{t(TERM_I18N_KEY[headlineRate.term])}</span>
              </p>
            ) : (
              <p className="text-xs font-medium text-slate-500">{t('vehicleCard.pricingSoon')}</p>
            )}
          </div>
          <Link
            to={detailHref}
            className={
              'shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ' +
              (reserved
                ? 'border border-brand-navy/20 text-brand-navy hover:bg-brand-lavender'
                : 'bg-brand-navy text-white hover:bg-brand-navy-light')
            }
          >
            {t('vehicleCard.viewDetails')}
          </Link>
        </div>
      </div>
    </div>
  )
}
