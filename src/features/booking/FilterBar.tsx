import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog } from '@/features/shared/ui/Dialog'
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState(filters)

  const clearFilters = () => {
    const cleared = { categoryId: null, brand: null, transmission: null, availability: null }
    setDraftFilters(cleared)
    onFiltersChange(cleared)
  }

  return (
    <>
      <aside className="hidden rounded-2xl border border-brand-navy/10 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:block">
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-semibold text-brand-navy">{t('searchResults.filters.title')}</h2>
            <p className="mt-1 text-xs text-slate-500">{t('searchResults.resultsCount', { count: resultCount })}</p>
          </div>
          {hasActiveFilters && <button type="button" onClick={clearFilters} className="rounded-md px-2 py-1 text-xs font-semibold text-brand-navy underline-offset-2 hover:bg-brand-lavender hover:underline focus:outline-none focus:ring-2 focus:ring-brand-gold">{t('searchResults.filters.clear')}</button>}
        </div>
        <div className="desktop-filter-options mt-4 max-h-[calc(100vh-16rem)] overflow-y-hidden pe-1 hover:overflow-y-auto focus-within:overflow-y-auto">
          <MobileCheckboxFilters
            categories={categories}
            brands={brands}
            transmissions={transmissions}
            showAvailabilityFilter={showAvailabilityFilter}
            filters={filters}
            onChange={onFiltersChange}
            compact
          />
        </div>
        <label className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
          {t('searchResults.filters.sortBy')}
          <select value={sort} onChange={(e) => onSortChange(e.target.value as SortOption)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-brand-navy outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-gold">
            <option value="price_asc">{t('searchResults.filters.priceLowHigh')}</option>
            <option value="price_desc">{t('searchResults.filters.priceHighLow')}</option>
          </select>
        </label>
      </aside>

      <div className="sticky top-16 z-20 -mx-4 border-y border-brand-navy/10 bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-brand-navy">{t('searchResults.resultsCount', { count: resultCount })}</span>
          <button type="button" onClick={() => { setDraftFilters(filters); setMobileOpen(true) }} aria-expanded={mobileOpen} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-navy px-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2">
            {t('searchResults.filters.button')}
          </button>
        </div>
        {hasActiveFilters && <div className="mt-2 flex gap-2 overflow-x-auto pb-1">{[filters.categoryId, filters.brand, filters.transmission, filters.availability].filter(Boolean).map((filter) => <span key={filter} className="shrink-0 rounded-full bg-brand-lavender px-3 py-1 text-xs font-medium text-brand-navy">{filter}</span>)}</div>}
      </div>

      <Dialog open={mobileOpen} onClose={() => setMobileOpen(false)} title={t('searchResults.filters.title')} closeLabel={t('common.close')} mobileSheet maxWidthClassName="max-w-xl">
        <div className="space-y-5">
          <MobileCheckboxFilters
            categories={categories}
            brands={brands}
            transmissions={transmissions}
            showAvailabilityFilter={showAvailabilityFilter}
            filters={draftFilters}
            onChange={(next) => {
              setDraftFilters(next)
              onFiltersChange(next)
            }}
          />
          <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
            {t('searchResults.filters.sortBy')}
            <select value={sort} onChange={(e) => onSortChange(e.target.value as SortOption)} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-brand-navy outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-gold">
              <option value="price_asc">{t('searchResults.filters.priceLowHigh')}</option>
              <option value="price_desc">{t('searchResults.filters.priceHighLow')}</option>
            </select>
          </label>
          <div className="flex gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={clearFilters} className="min-h-11 flex-1 rounded-lg border border-brand-navy/20 px-4 text-sm font-semibold text-brand-navy">{t('searchResults.filters.clear')}</button>
            <button type="button" onClick={() => { onFiltersChange(draftFilters); setMobileOpen(false) }} className="min-h-11 flex-1 rounded-lg bg-brand-navy px-4 text-sm font-semibold text-white">{t('searchResults.filters.apply')}</button>
          </div>
        </div>
      </Dialog>
    </>
  )
}

function MobileCheckboxFilters({
  categories,
  brands,
  transmissions,
  showAvailabilityFilter,
  filters,
  onChange,
  compact = false,
}: {
  categories: { id: string; name: string }[]
  brands: string[]
  transmissions: string[]
  showAvailabilityFilter: boolean
  filters: VehicleFilters
  onChange: (filters: VehicleFilters) => void
  compact?: boolean
}) {
  const { t } = useTranslation()

  return (
    <div className="space-y-5">
      {showAvailabilityFilter && (
        <CheckboxGroup
          label={t('searchResults.filters.availability')}
          value={filters.availability}
          options={[
            { value: 'available', label: t('searchResults.filters.available') },
            { value: 'reserved', label: t('searchResults.filters.reserved') },
          ]}
          allLabel={t('searchResults.filters.allAvailability')}
          compact={compact}
          onChange={(value) => onChange({ ...filters, availability: value as VehicleFilters['availability'] })}
        />
      )}
      <CheckboxGroup
        label={t('searchResults.filters.category')}
        value={filters.categoryId}
        options={categories.map((category) => ({ value: category.id, label: category.name }))}
        allLabel={t('searchResults.filters.allCategories')}
        compact={compact}
        onChange={(value) => onChange({ ...filters, categoryId: value })}
      />
      <CheckboxGroup
        label={t('searchResults.filters.brand')}
        value={filters.brand}
        options={brands.map((brand) => ({ value: brand, label: brand }))}
        allLabel={t('searchResults.filters.allBrands')}
        compact={compact}
        onChange={(value) => onChange({ ...filters, brand: value })}
      />
      <CheckboxGroup
        label={t('searchResults.filters.transmission')}
        value={filters.transmission}
        options={transmissions.map((transmission) => ({ value: transmission, label: transmission }))}
        allLabel={t('searchResults.filters.allTransmissions')}
        compact={compact}
        onChange={(value) => onChange({ ...filters, transmission: value })}
      />
    </div>
  )
}

function CheckboxGroup({
  label,
  value,
  options,
  allLabel,
  onChange,
  compact = false,
}: {
  label: string
  value: string | null
  options: { value: string; label: string }[]
  allLabel: string
  onChange: (value: string | null) => void
  compact?: boolean
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-brand-navy">{label}</legend>
      <div className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        <label className={'flex cursor-pointer items-center gap-3 px-3 text-sm text-slate-700 ' + (compact ? 'min-h-10' : 'min-h-12')}>
          <input type="checkbox" checked={value === null} onChange={() => onChange(null)} className="h-5 w-5 rounded border-slate-300 text-brand-navy focus:ring-brand-gold" />
          {allLabel}
        </label>
        {options.map((option) => (
          <label key={option.value} className={'flex cursor-pointer items-center gap-3 px-3 text-sm text-slate-700 ' + (compact ? 'min-h-10' : 'min-h-12')}>
            <input type="checkbox" checked={value === option.value} onChange={() => onChange(value === option.value ? null : option.value)} className="h-5 w-5 rounded border-slate-300 text-brand-navy focus:ring-brand-gold" />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
