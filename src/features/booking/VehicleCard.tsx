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
        'group flex flex-col self-start overflow-hidden rounded-2xl border bg-white shadow-sm ring-1 ring-transparent transition-all hover:-translate-y-0.5 hover:border-brand-gold/50 hover:shadow-xl hover:ring-brand-gold/10 ' +
        (reserved ? 'border-amber-200' : 'border-brand-navy/10')
      }
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-brand-lavender/40">
        <VehiclePhoto
          storagePath={image?.storage_path ?? null}
          alt={`${vehicle.make} ${vehicle.model}`}
          className={'h-full w-full' + (reserved ? ' opacity-70 grayscale' : '')}
        />
        {reserved && (
          <span className="absolute end-3 top-3 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-sm">
            {t('vehicleCard.reserved')}
          </span>
        )}
        {!reserved && (
          <span className="absolute start-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-success shadow-sm">
            {t('vehicleCard.available')}
          </span>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-brand-navy/25 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <div className="flex flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{vehicle.make}</p>
            <h3 className="mt-1 text-lg font-semibold leading-tight text-brand-navy">
              {vehicle.make} {vehicle.model}
            </h3>
            <p className="mt-1 text-xs text-slate-500">{vehicle.model_year}</p>
          </div>
          {!reserved && vehicle.vehicle_categories && (
            <span className="shrink-0 rounded-full bg-brand-lavender px-2.5 py-1 text-xs font-medium text-brand-navy">
              {vehicle.vehicle_categories.name}
            </span>
          )}
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-2 border-y border-slate-100 py-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="text-brand-gold" aria-hidden="true">●</span>
            <dt className="sr-only">{t('vehicleCard.seats')}</dt>
            <dd>
              {vehicle.seats} {t('vehicleCard.seats')}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-brand-gold" aria-hidden="true">●</span>
            <dt className="sr-only">{t('vehicleDetail.transmission')}</dt>
            <dd className="capitalize">{t(`vehicleCard.transmission.${vehicle.transmission}`, { defaultValue: vehicle.transmission })}</dd>
          </div>
        </dl>

        <div className="mt-3 flex flex-col gap-3">
          <div>
            {reserved ? (
              <p className="text-xs font-medium text-amber-700">{t('vehicleCard.reservedForDates')}</p>
            ) : quote ? (
              <>
                <p className="text-xl font-bold tracking-tight text-brand-navy">
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
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={detailHref}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-navy px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-navy-light focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2"
            >
              {reserved ? t('vehicleCard.viewDetails') : t('vehicleCard.bookNow')}
            </Link>
            {!reserved && (
              <Link
                to={detailHref}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-brand-navy/20 px-3 py-2 text-xs font-semibold text-brand-navy transition-colors hover:bg-brand-lavender focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2"
              >
                {t('vehicleCard.viewDetails')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
