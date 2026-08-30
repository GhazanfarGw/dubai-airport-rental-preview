import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchLocations } from '@/features/booking/api'
import { validateDateRange } from '@/lib/dateRange'
import { isRtl } from '@/i18n'
import { inputClass } from '@/features/shared/ui/inputClasses'
import { Button } from '@/features/shared/ui/Button'
import { Dialog } from '@/features/shared/ui/Dialog'
import type { Location, SearchCriteria } from '@/types/domain'
import type { LocationType } from '@/types/database'

/**
 * Shown/selected before real locations load, and used as the fallback
 * when a criteria's saved location can't be matched to a country/city.
 * Bliss Rent is a UAE-wide business by design (see docs/ARCHITECTURE.md,
 * "Multi-emirate locations") — these are just the current primary market
 * defaults, never an assumption that only these values can exist. Every
 * selectable country/city/type below is derived from `locations` data,
 * never hardcoded to this pair.
 */
const DEFAULT_COUNTRY = 'United Arab Emirates'
const DEFAULT_CITY = 'Dubai'

/** Fixed display order for location types — airport-first matches the usual "land, then pick up" flow. Any type not in this list (should never happen) sorts last. */
const TYPE_ORDER: LocationType[] = ['airport', 'city', 'hotel', 'delivery']
const TYPE_ICON: Record<LocationType, string> = { airport: '✈', city: '🏙', hotel: '🏨', delivery: '🚚' }

function sortByOrder(a: string, b: string, first: string): number {
  if (a === first) return -1
  if (b === first) return 1
  return a.localeCompare(b)
}

function typeOrderIndex(type: LocationType): number {
  const i = TYPE_ORDER.indexOf(type)
  return i === -1 ? TYPE_ORDER.length : i
}

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
  const [country, setCountry] = useState(DEFAULT_COUNTRY)
  const [pickupCity, setPickupCity] = useState(DEFAULT_CITY)
  const [pickupType, setPickupType] = useState<LocationType | ''>('')
  const [pickupLocationId, setPickupLocationId] = useState(initialValues?.pickupLocationId ?? '')
  const [dropoffLocationId, setDropoffLocationId] = useState(
    initialValues?.dropoffLocationId ?? '',
  )
  const [touched, setTouched] = useState(false)
  const [citySheetOpen, setCitySheetOpen] = useState(false)
  const [pickupSheetOpen, setPickupSheetOpen] = useState(false)
  const [dropoffSheetOpen, setDropoffSheetOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchLocations()
      .then((data) => {
        if (cancelled) return
        setLocations(data)
        setLocationsError(null)
        // If we were handed an existing pickup location (e.g. the "edit
        // search" bar on the results page), match its country/city/type so
        // the selectors reflect what was actually searched instead of
        // silently resetting to the defaults.
        const initialLocation = data.find((l) => l.id === initialValues?.pickupLocationId)
        if (initialLocation) {
          setCountry(initialLocation.country)
          setPickupCity(initialLocation.city)
          setPickupType(initialLocation.type)
        } else {
          // No saved location to match — pick the best-available type for
          // whatever the default country/city selectors resolve to, same
          // logic handleCityChange uses, so the Pickup Location list isn't
          // left showing every type mixed together (pickupType === '').
          const typesForDefault = Array.from(
            new Set(data.filter((l) => l.country === DEFAULT_COUNTRY && l.city === DEFAULT_CITY).map((l) => l.type)),
          )
          setPickupType(bestDefaultType(typesForDefault))
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only ever meant to run once on mount, same as before this country/city/type logic was added
  }, [])

  // Country -> City -> Type -> Location, each level derived from whatever
  // data actually exists — never a hardcoded list. See docs/ARCHITECTURE.md.
  const countries = Array.from(new Set(locations.map((l) => l.country))).sort((a, b) =>
    sortByOrder(a, b, DEFAULT_COUNTRY),
  )
  const citiesInCountry = Array.from(new Set(locations.filter((l) => l.country === country).map((l) => l.city))).sort(
    (a, b) => sortByOrder(a, b, DEFAULT_CITY),
  )
  const cityLocations = locations.filter((l) => l.country === country && l.city === pickupCity)
  const typesInCity = Array.from(new Set(cityLocations.map((l) => l.type))).sort(
    (a, b) => typeOrderIndex(a) - typeOrderIndex(b),
  )
  const pickupTypeLocations = cityLocations.filter((l) => (pickupType ? l.type === pickupType : true))

  function bestDefaultType(candidateTypes: LocationType[]): LocationType | '' {
    if (candidateTypes.length === 0) return ''
    return candidateTypes.slice().sort((a, b) => typeOrderIndex(a) - typeOrderIndex(b))[0]
  }

  function handleCountryChange(nextCountry: string) {
    setCountry(nextCountry)
    const nextCities = Array.from(
      new Set(locations.filter((l) => l.country === nextCountry).map((l) => l.city)),
    ).sort((a, b) => sortByOrder(a, b, DEFAULT_CITY))
    const nextCity = nextCities.includes(DEFAULT_CITY) ? DEFAULT_CITY : (nextCities[0] ?? '')
    handleCityChange(nextCity, nextCountry)
  }

  function handleCityChange(city: string, forCountry: string = country) {
    setPickupCity(city)
    const nextTypes = Array.from(
      new Set(locations.filter((l) => l.country === forCountry && l.city === city).map((l) => l.type)),
    )
    setPickupType(bestDefaultType(nextTypes))
    // Previously-chosen points may not exist in the new city — don't leave
    // a stale, invisible selection behind.
    setPickupLocationId('')
    setDropoffLocationId('')
  }

  function handleTypeChange(type: LocationType | '') {
    setPickupType(type)
    setPickupLocationId('')
  }

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
  const pickupLocation = locations.find((l) => l.id === pickupLocationId)
  const dropoffLocation = locations.find((l) => l.id === dropoffLocationId)

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={
        'w-full rounded-2xl border border-brand-navy/10 bg-white shadow-lg shadow-brand-navy/5 ' +
        (compact ? 'p-4' : 'p-5 sm:p-6')
      }
    >
      {/* Mobile experience for the main booking widget only — a compact
          "where are you picking up" summary that opens full picker
          sheets, matching a native rental app rather than stacking tiny
          desktop-style dropdowns. StickySearchBar's compact `row` layout
          has no separate mobile treatment: it's already a horizontally-
          scrollable strip of plain selects at every screen size, which is
          the point of it, so it renders unconditionally below instead. */}
      {layout === 'grid' && (
        <div className="mb-4 sm:hidden">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t('searchWidget.pickupCity')}
          </span>
          <div className="flex items-center gap-2 rounded-xl border border-brand-navy/10 bg-brand-lavender/20 px-3 py-2.5 text-sm">
            <span aria-hidden="true">🇦🇪</span>
            <span className="text-slate-500">{country}</span>
          </div>
          <button
            type="button"
            onClick={() => setCitySheetOpen(true)}
            disabled={locationsLoading || !!locationsError}
            className="mt-2 flex w-full items-center justify-between rounded-xl border border-brand-navy/10 bg-white px-3 py-3 text-left text-sm font-medium text-brand-navy shadow-sm disabled:cursor-not-allowed disabled:text-slate-400"
          >
            <span>{locationsLoading ? t('searchWidget.loadingLocations') : pickupCity}</span>
            <ChevronIcon className="h-4 w-4 text-slate-400 rtl:rotate-180" />
          </button>

          <div className="mt-3 grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => setPickupSheetOpen(true)}
              disabled={locationsLoading || !!locationsError}
              className="flex items-center justify-between rounded-xl border border-brand-navy/10 bg-white px-3 py-3 text-left text-sm shadow-sm disabled:cursor-not-allowed"
            >
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t('searchWidget.pickupLocation')}
                </span>
                <span className="mt-0.5 block truncate font-medium text-brand-navy">
                  {pickupLocation ? `${TYPE_ICON[pickupLocation.type]} ${pickupLocation.name}` : t('searchWidget.selectPickup')}
                </span>
              </span>
              <ChevronIcon className="h-4 w-4 shrink-0 text-slate-400 rtl:rotate-180" />
            </button>

            <button
              type="button"
              onClick={() => setDropoffSheetOpen(true)}
              disabled={locationsLoading || !!locationsError}
              className="flex items-center justify-between rounded-xl border border-brand-navy/10 bg-white px-3 py-3 text-left text-sm shadow-sm disabled:cursor-not-allowed"
            >
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t('searchWidget.dropoffLocation')}
                </span>
                <span className="mt-0.5 block truncate font-medium text-brand-navy">
                  {dropoffLocation ? `${TYPE_ICON[dropoffLocation.type]} ${dropoffLocation.name}` : t('searchWidget.selectDropoff')}
                </span>
              </span>
              <ChevronIcon className="h-4 w-4 shrink-0 text-slate-400 rtl:rotate-180" />
            </button>
          </div>
        </div>
      )}

      <div
        ref={rowRef}
        className={
          layout === 'row'
            ? 'flex items-end gap-3 overflow-x-auto'
            : 'hidden grid-cols-2 gap-4 sm:grid lg:grid-cols-5'
        }
      >
        {countries.length > 1 && (
          <Field label={t('searchWidget.pickupCountry')} row={layout === 'row'}>
            <select
              value={country}
              onChange={(e) => handleCountryChange(e.target.value)}
              className={inputClass()}
              disabled={locationsLoading || !!locationsError}
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label={t('searchWidget.pickupCity')} row={layout === 'row'}>
          <select
            value={pickupCity}
            onChange={(e) => handleCityChange(e.target.value)}
            className={inputClass()}
            disabled={locationsLoading || !!locationsError}
          >
            {citiesInCountry.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t('searchWidget.pickupType')} row={layout === 'row'}>
          <select
            value={pickupType}
            onChange={(e) => handleTypeChange(e.target.value as LocationType)}
            className={inputClass()}
            disabled={locationsLoading || !!locationsError}
          >
            {typesInCity.map((type) => (
              <option key={type} value={type}>
                {TYPE_ICON[type]} {t(`searchWidget.type.${type}`)}
              </option>
            ))}
          </select>
        </Field>

        {layout === 'row' && (
          <>
            <Field label={t('searchWidget.pickupDate')} row>
              <input
                type="date"
                min={todayIso}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass()}
                aria-invalid={touched && !!dateValidation.error && dateValidation.error !== 'end_required'}
              />
            </Field>

            <Field label={t('searchWidget.dropoffDate')} row>
              <input
                type="date"
                min={startDate || todayIso}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass()}
                aria-invalid={touched && !!dateValidation.error}
              />
            </Field>
          </>
        )}

        <Field label={t('searchWidget.pickupLocation')} row={layout === 'row'}>
          <select
            value={pickupLocationId}
            onChange={(e) => setPickupLocationId(e.target.value)}
            className={inputClass()}
            disabled={locationsLoading || !!locationsError}
          >
            <option value="">
              {locationsLoading ? t('searchWidget.loadingLocations') : t('searchWidget.selectPickup')}
            </option>
            {pickupTypeLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {TYPE_ICON[loc.type]} {loc.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t('searchWidget.dropoffLocation')} row={layout === 'row'}>
          <select
            value={dropoffLocationId}
            onChange={(e) => setDropoffLocationId(e.target.value)}
            className={inputClass()}
            disabled={locationsLoading || !!locationsError}
          >
            <option value="">
              {locationsLoading ? t('searchWidget.loadingLocations') : t('searchWidget.selectDropoff')}
            </option>
            {cityLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {TYPE_ICON[loc.type]} {loc.name}
              </option>
            ))}
          </select>
        </Field>

        {layout === 'row' && (
          <Button type="submit" className="mb-px shrink-0">
            {t('searchWidget.searchCars')}
          </Button>
        )}
      </div>

      {/* Dates render once, here, shared by mobile and desktop for the
          'grid' layout (the mobile card section above and the cascading
          selects above both hide/show via CSS breakpoints, not
          conditional rendering, so a date field placed in either would
          exist twice in the DOM at once). 'row' layout keeps its dates
          inline in the single scrollable row instead. */}
      {layout === 'grid' && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Field label={t('searchWidget.pickupDate')}>
            <input
              type="date"
              min={todayIso}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass()}
              aria-invalid={touched && !!dateValidation.error && dateValidation.error !== 'end_required'}
            />
          </Field>
          <Field label={t('searchWidget.dropoffDate')}>
            <input
              type="date"
              min={startDate || todayIso}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass()}
              aria-invalid={touched && !!dateValidation.error}
            />
          </Field>
        </div>
      )}

      {touched && dateValidation.error && (
        <p className="mt-3 text-sm font-medium text-error">
          {t('errors.dateRange.' + dateValidation.error)}
        </p>
      )}
      {touched && !dateValidation.error && missingLocation && (
        <p className="mt-3 text-sm font-medium text-error">
          {t('searchWidget.bothLocationsRequired')}
        </p>
      )}
      {locationsError && (
        <p className="mt-3 text-sm font-medium text-error">
          {t('searchWidget.couldNotLoadLocations')} {locationsError}
        </p>
      )}

      {layout === 'grid' && (
        <Button type="submit" fullWidthOnMobile className="mt-5">
          {t('searchWidget.searchCars')}
        </Button>
      )}

      <Dialog
        open={citySheetOpen}
        onClose={() => setCitySheetOpen(false)}
        title={t('searchWidget.chooseCity')}
        closeLabel={t('common.close')}
      >
        <LocationOptionList
          options={citiesInCountry.map((city) => ({ id: city, label: city }))}
          selectedId={pickupCity}
          onSelect={(city) => {
            handleCityChange(city)
            setCitySheetOpen(false)
          }}
        />
      </Dialog>

      <Dialog
        open={pickupSheetOpen}
        onClose={() => setPickupSheetOpen(false)}
        title={t('searchWidget.choosePickupLocation')}
        closeLabel={t('common.close')}
      >
        <LocationOptionList
          options={cityLocations.map(locationToOption)}
          selectedId={pickupLocationId}
          searchable
          searchPlaceholder={t('searchWidget.searchLocations')}
          noMatchesLabel={t('searchWidget.noMatches')}
          onSelect={(id) => {
            setPickupLocationId(id)
            setPickupSheetOpen(false)
          }}
        />
      </Dialog>

      <Dialog
        open={dropoffSheetOpen}
        onClose={() => setDropoffSheetOpen(false)}
        title={t('searchWidget.chooseDropoffLocation')}
        closeLabel={t('common.close')}
      >
        <LocationOptionList
          options={cityLocations.map(locationToOption)}
          selectedId={dropoffLocationId}
          searchable
          searchPlaceholder={t('searchWidget.searchLocations')}
          noMatchesLabel={t('searchWidget.noMatches')}
          onSelect={(id) => {
            setDropoffLocationId(id)
            setDropoffSheetOpen(false)
          }}
        />
      </Dialog>
    </form>
  )
}

function locationToOption(loc: Location): SheetOption {
  const sublabel =
    loc.type === 'airport' && loc.airport_code
      ? `${loc.airport_code} · ${loc.city}, ${loc.country}`
      : `${loc.city}, ${loc.country}`
  return { id: loc.id, label: loc.name, icon: TYPE_ICON[loc.type], sublabel }
}

interface SheetOption {
  id: string
  label: string
  sublabel?: string
  icon?: string
}

/**
 * Shared option list used inside every mobile picker sheet (city, pickup
 * location, drop-off location) — large tap targets, an optional icon +
 * sub-label per row (the Airport UX spec: code, city, country), a
 * selected-state check mark, and an optional live search filter. One
 * implementation instead of three near-duplicates.
 */
function LocationOptionList({
  options,
  selectedId,
  onSelect,
  searchable = false,
  searchPlaceholder,
  noMatchesLabel,
}: {
  options: SheetOption[]
  selectedId: string
  onSelect: (id: string) => void
  searchable?: boolean
  searchPlaceholder?: string
  noMatchesLabel?: string
}) {
  const [query, setQuery] = useState('')
  const filtered =
    searchable && query.trim()
      ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
      : options

  return (
    <div>
      {searchable && (
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className={inputClass() + ' mb-3'}
        />
      )}
      <ul className="max-h-[60vh] space-y-1 overflow-y-auto">
        {filtered.map((opt) => (
          <li key={opt.id}>
            <button
              type="button"
              onClick={() => onSelect(opt.id)}
              className={
                'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ' +
                (opt.id === selectedId
                  ? 'bg-brand-lavender/60 text-brand-navy'
                  : 'text-slate-700 hover:bg-slate-50')
              }
            >
              {opt.icon && (
                <span className="text-lg" aria-hidden="true">
                  {opt.icon}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{opt.label}</span>
                {opt.sublabel && <span className="block truncate text-xs text-slate-500">{opt.sublabel}</span>}
              </span>
              {opt.id === selectedId && <CheckIcon className="h-4 w-4 shrink-0 text-brand-gold-dark" />}
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-3 py-6 text-center text-sm text-slate-500">{noMatchesLabel}</li>
        )}
      </ul>
    </div>
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

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden="true">
      <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path d="M4 10.5l3.5 3.5L16 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
