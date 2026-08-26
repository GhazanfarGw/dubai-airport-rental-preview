import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SearchWidget } from '@/features/booking/SearchWidget'
import { FilterBar } from '@/features/booking/FilterBar'
import { VehicleCard } from '@/features/booking/VehicleCard'
import { StateMessage, Spinner } from '@/features/shared/StateMessage'
import { searchVehiclesWithAvailability, fetchAllAvailableVehicles, BookingApiError } from '@/features/booking/api'
import { criteriaToSearchParams, isCompleteCriteria, searchParamsToCriteria } from '@/features/booking/searchParams'
import { validateDateRange, rentalDays } from '@/lib/dateRange'
import { applyFilters, distinctBrands, distinctCategories, distinctTransmissions, sortByPrice } from '@/lib/vehicleFilters'
import { EMPTY_FILTERS } from '@/types/domain'
import type { SearchCriteria, SortOption, VehicleFilters, VehicleSearchResult } from '@/types/domain'

type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; vehicles: VehicleSearchResult[] }

export function SearchResultsPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const criteria = searchParamsToCriteria(searchParams)
  const complete = isCompleteCriteria(criteria)
  const dateValidation = complete
    ? validateDateRange(criteria.startDate, criteria.endDate)
    : { valid: false, error: null }

  const [state, setState] = useState<LoadState>({ status: 'idle' })
  const [filters, setFilters] = useState<VehicleFilters>(EMPTY_FILTERS)
  const [sort, setSort] = useState<SortOption>('price_asc')

  useEffect(() => {
    setFilters(EMPTY_FILTERS)

    // Dates were entered but don't form a valid range (e.g. drop-off before
    // pickup) — that's a real validation error, not "no dates yet". Show
    // the error message instead of fetching anything.
    if (complete && !dateValidation.valid) {
      setState({ status: 'idle' })
      return
    }

    let cancelled = false
    setState({ status: 'loading' })
    // With a complete, valid date range: check real availability for those
    // dates — every vehicle comes back, tagged available/reserved for that
    // range. Otherwise (customer hasn't chosen dates/locations yet): let
    // them browse the whole fleet first, same as the homepage's Featured
    // Vehicles (just without the 6-car cap); nothing can be "reserved"
    // without a date range to check against, so every result is tagged
    // available.
    const request = complete
      ? searchVehiclesWithAvailability(criteria.startDate!, criteria.endDate!)
      : fetchAllAvailableVehicles().then((vehicles) => vehicles.map((v) => ({ ...v, isAvailable: true })))
    request
      .then((vehicles) => {
        if (cancelled) return
        setState({ status: 'loaded', vehicles })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message =
          err instanceof BookingApiError || err instanceof Error
            ? err.message
            : 'Something went wrong while searching. Please try again.'
        setState({ status: 'error', message })
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteria.startDate, criteria.endDate, complete, dateValidation.valid])

  const hasDates = complete && dateValidation.valid
  const days = hasDates ? rentalDays(criteria.startDate!, criteria.endDate!) : 1

  const filteredSorted = useMemo(() => {
    if (state.status !== 'loaded') return []
    const filtered = applyFilters(state.vehicles, filters)
    return sortByPrice(filtered, sort, days)
  }, [state, filters, sort, days])

  function handleSearch(next: SearchCriteria) {
    navigate({ pathname: '/search', search: criteriaToSearchParams(next).toString() })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SearchWidget
        compact
        initialValues={complete ? criteria : undefined}
        onSearch={handleSearch}
      />

      <div className="mt-8">
        {!hasDates && state.status === 'loaded' && (
          <p className="mb-4 text-sm text-slate-500">{t('searchResults.browsingAllHint')}</p>
        )}

        {complete && !dateValidation.valid && (
          <StateMessage
            tone="error"
            title={t('searchResults.invalidSearchTitle')}
            body={dateValidation.error ? t('errors.dateRange.' + dateValidation.error) : undefined}
          />
        )}

        {state.status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-16">
            <Spinner className="h-8 w-8" />
            <p className="mt-3 text-sm text-slate-500">{t('common.loading')}</p>
          </div>
        )}

        {state.status === 'error' && (
          <StateMessage
            tone="error"
            title={t('searchResults.errorTitle')}
            body={state.message}
          />
        )}

        {state.status === 'loaded' && state.vehicles.length === 0 && (
          <StateMessage
            title={t('searchResults.noVehiclesTitle')}
            body={t('searchResults.noVehiclesBody')}
          />
        )}

        {state.status === 'loaded' && state.vehicles.length > 0 && (
          <div className="space-y-5">
            <FilterBar
              categories={distinctCategories(state.vehicles)}
              brands={distinctBrands(state.vehicles)}
              transmissions={distinctTransmissions(state.vehicles)}
              filters={filters}
              sort={sort}
              resultCount={filteredSorted.length}
              onFiltersChange={setFilters}
              onSortChange={setSort}
              showAvailabilityFilter={hasDates}
            />

            {filteredSorted.length === 0 ? (
              <StateMessage
                title={t('searchResults.noVehiclesTitle')}
                body={t('searchResults.noVehiclesBody')}
              />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredSorted.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    days={hasDates ? days : undefined}
                    detailHref={`/vehicles/${vehicle.id}?${searchParams.toString()}`}
                    isAvailable={vehicle.isAvailable}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
