import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchLocations } from '@/features/booking/api'
import { validateDateRange } from '@/lib/dateRange'
import { isRtl } from '@/i18n'
import type { Location, SearchCriteria } from '@/types/domain'

interface SearchWidgetProps {
  initialValues?: Partial<SearchCriteria>
  onSearch: (criteria: SearchCriteria) => void
  /** Compact layout for the "edit search" bar on the results page. */
  compact?: boolean
  /**
   * 'grid' (default): the usual responsive 1/2/4-column field grid.
   * 'row': a single horizontally-scrollable row with the button inline at
   * the end — used by StickySearchBar so the sticky bar stays genuinely
   * compact on narrow (mobile) screens instead of stacking 4 full-width
   * fields. Same form, state, and validation either way.
   */
  layout?: 'grid' | 'row'
}

export function SearchWidget({ initialValues, onSearch, compact = false, layout = 'grid' }: SearchWidgetProps) {
  const { t, i18n } = useTranslation()
  const rtl = isRtl(i18n.language)
  const rowRef = useRef<HTMLDivElement>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [locationsError, setLocationsError] = useState<string | null>(null)
  const [locationsLoading, setLocationsLoading] = useState(true)

  useEffect(() => {
    // The 'row' layout scrolls horizontally on narrow screens. Browsers
    // disagree on where scrollLeft 0 lands in a `dir="rtl"` container, and
    // some also reset scroll position as part of applying a `dir` change —
    // so nudge this into place a frame after layout settles, not
    // synchronously in the effect.
    if (layout !== 'row' || !rowRef.current) return
    const el = rowRef.current
    const frame = requestAnimationFrame(() => {
      // Whichever edge is physically-rightmost is where the first
      // (logical-start) field sits in RTL — find it by comparing scrollLeft
      // 0 against the max scrollable position, rather than assuming which
      // one the current browser treats as "start".
      el.scrollLeft = rtl ? el.scrollWidth : 0
    })
    return () => cancelAnimationFrame(frame)
  }, [layout, rtl])

  const [startDate, setStartDate] = useState(initialValues?.startDate ?? '')
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? '')
  const [pickupLocationId, setPickupLocationId] = useState(initialValues?.pickupLocationId ?? '')
  const [dropoffLocationId, setDropoffLocationId] = useState(
    initialValues?.dropoffLocationId ?? '',
  )
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchLocations()
      .then((data) => {
        if (cancelled) return
        setLocations(data)
        setLocationsError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setLocationsError(err instanceof Error ? err.message : 'Could not load locations.')
      })
      .finally(() => {
        if (!cancelled) setLocationsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const dateValidation = validateDateRange(startDate, endDate)
  const missingLocation = !pickupLocationId || !dropoffLocationId
  const canSubmit = dateValidation.valid && !missingLocation && !locationsLoading

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!canSubmit) return
    onSearch({ startDate, endDate, pickupLocationId, dropoffLocationId })
  }

  const todayIso = new Date().toISOString().slice(0, 10)

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={
        'w-full rounded-2xl border border-brand-navy/10 bg-white shadow-lg shadow-brand-navy/5 ' +
        (compact ? 'p-4' : 'p-5 sm:p-6')
      }
    >
      <div
        ref={rowRef}
        className={
          layout === 'row'
            ? 'flex items-end gap-3 overflow-x-auto'
            : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'
        }
      >
        <Field label={t('searchWidget.pickupDate')} row={layout === 'row'}>
          <input
            type="date"
            min={todayIso}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClass}
            aria-invalid={touched && !!dateValidation.error && dateValidation.error !== 'end_required'}
          />
        </Field>

        <Field label={t('searchWidget.dropoffDate')} row={layout === 'row'}>
          <input
            type="date"
            min={startDate || todayIso}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClass}
            aria-invalid={touched && !!dateValidation.error}
          />
        </Field>

        <Field label={t('searchWidget.pickupLocation')} row={layout === 'row'}>
          <select
            value={pickupLocationId}
            onChange={(e) => setPickupLocationId(e.target.value)}
            className={inputClass}
            disabled={locationsLoading || !!locationsError}
          >
            <option value="">
              {locationsLoading ? t('searchWidget.loadingLocations') : t('searchWidget.selectPickup')}
            </option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t('searchWidget.dropoffLocation')} row={layout === 'row'}>
          <select
            value={dropoffLocationId}
            onChange={(e) => setDropoffLocationId(e.target.value)}
            className={inputClass}
            disabled={locationsLoading || !!locationsError}
          >
            <option value="">
              {locationsLoading ? t('searchWidget.loadingLocations') : t('searchWidget.selectDropoff')}
            </option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </Field>

        {layout === 'row' && (
          <button
            type="submit"
            className="mb-px inline-flex shrink-0 items-center justify-center rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('searchWidget.searchCars')}
          </button>
        )}
      </div>

      {touched && dateValidation.error && (
        <p className="mt-3 text-sm font-medium text-red-600">
          {t('errors.dateRange.' + dateValidation.error)}
        </p>
      )}
      {touched && !dateValidation.error && missingLocation && (
        <p className="mt-3 text-sm font-medium text-red-600">
          {t('searchWidget.bothLocationsRequired')}
        </p>
      )}
      {locationsError && (
        <p className="mt-3 text-sm font-medium text-red-600">
          {t('searchWidget.couldNotLoadLocations')} {locationsError}
        </p>
      )}

      {layout === 'grid' && (
        <button
          type="submit"
          className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {t('searchWidget.searchCars')}
        </button>
      )}
    </form>
  )
}

function Field({ label, children, row }: { label: string; children: ReactNode; row?: boolean }) {
  return (
    <label className={row ? 'block w-36 shrink-0 sm:w-40' : 'block'}>
      <span className="mb-1.5 block truncate text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  )
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-brand-navy outline-none transition-colors focus:border-brand-navy focus:ring-1 focus:ring-brand-navy disabled:bg-slate-50 disabled:text-slate-400'
