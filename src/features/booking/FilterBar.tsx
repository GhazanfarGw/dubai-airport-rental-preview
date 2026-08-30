import { useTranslation } from 'react-i18next'
import type { SortOption, VehicleFilters } from '@/types/domain'

interface FilterBarProps {
  categories: { id: string; name: string }[]
  brands: string[]
  transmissions: string[]
  filters: VehicleFilters
  sort: SortOption
  resultCount: number
  onFiltersChange: (filters: VehicleFilters) => void
  onSortChange: (sort: SortOption) => void
  /** Only shown once the customer has chosen dates — see VehicleSearchResult. */
  showAvailabilityFilter?: boolean
}

/**
 * Every filter here maps to a real column (category, make, transmission).
 * There is no "vehicle type" or feature filter because no such column
 * exists in the schema.
 */
export function FilterBar({
  categories,
  brands,
  transmissions,
  filters,
  sort,
  resultCount,
  onFiltersChange,
  onSortChange,
  showAvailabilityFilter = false,
}: FilterBarProps) {
  const { t } = useTranslation()
  const hasActiveFilters = filters.categoryId || filters.brand || filters.transmission || filters.availability

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-brand-navy/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        {showAvailabilityFilter && (
          <SelectFilter
            label={t('searchResults.filters.availability')}
            value={filters.availability ?? ''}
            onChange={(v) => onFiltersChange({ ...filters, availability: (v || null) as VehicleFilters['availability'] })}
            options={[
              { value: 'available', label: t('searchResults.filters.available') },
              { value: 'reserved', label: t('searchResults.filters.reserved') },
            ]}
            allLabel={t('searchResults.filters.allAvailability')}
          />
        )}
        <SelectFilter
          label={t('searchResults.filters.category')}
          value={filters.categoryId ?? ''}
          onChange={(v) => onFiltersChange({ ...filters, categoryId: v || null })}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          allLabel={t('searchResults.filters.allCategories')}
        />
        <SelectFilter
          label={t('searchResults.filters.brand')}
          value={filters.brand ?? ''}
          onChange={(v) => onFiltersChange({ ...filters, brand: v || null })}
          options={brands.map((b) => ({ value: b, label: b }))}
          allLabel={t('searchResults.filters.allBrands')}
        />
        <SelectFilter
          label={t('searchResults.filters.transmission')}
          value={filters.transmission ?? ''}
          onChange={(v) => onFiltersChange({ ...filters, transmission: v || null })}
          options={transmissions.map((tOpt) => ({ value: tOpt, label: tOpt.charAt(0).toUpperCase() + tOpt.slice(1) }))}
          allLabel={t('searchResults.filters.allTransmissions')}
        />
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => onFiltersChange({ categoryId: null, brand: null, transmission: null, availability: null })}
            className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-brand-navy hover:underline"
          >
            {t('searchResults.filters.clear')}
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500">
          {t('searchResults.resultsCount', { count: resultCount })}
        </span>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
          {t('searchResults.filters.sortBy')}
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-brand-navy outline-none focus:border-brand-navy"
          >
            <option value="price_asc">{t('searchResults.filters.priceLowHigh')}</option>
            <option value="price_desc">{t('searchResults.filters.priceHighLow')}</option>
          </select>
        </label>
      </div>
    </div>
  )
}

function SelectFilter({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  allLabel: string
}) {
  return (
    <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-brand-navy outline-none focus:border-brand-navy"
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
