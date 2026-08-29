import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchBookings } from '@/features/admin/bookings/adminBookingsApi'
import { AdminApiError } from '@/features/admin/adminApi'
import { AdminPageHeader } from '@/features/admin/shared/AdminPageHeader'
import { AdminTabs, type AdminTab } from '@/features/admin/shared/AdminTabs'
import { AdminStatusBadge } from '@/features/admin/shared/AdminStatusBadge'
import { StateMessage, Spinner } from '@/features/shared/StateMessage'
import type { AdminBookingWithDetails } from '@/types/domain'
import type { Database } from '@/types/database'

type BookingStatus = Database['public']['Tables']['bookings']['Row']['status']
type TabValue = BookingStatus | 'all'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; bookings: AdminBookingWithDetails[] }

export function BookingsListPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<TabValue>('all')
  const [search, setSearch] = useState('')
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    // Fetch every booking once (not per-tab) so tab counts can be computed
    // across the whole set client-side — same pattern as FleetListPage.
    fetchBookings('all')
      .then((bookings) => {
        if (!cancelled) setState({ status: 'loaded', bookings })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setState({ status: 'error', message: err instanceof AdminApiError || err instanceof Error ? err.message : t('admin.errorGeneric') })
      })
    return () => {
      cancelled = true
    }
  }, [t])

  const counts = useMemo(() => {
    if (state.status !== 'loaded') return {}
    const c: Record<string, number> = {}
    for (const b of state.bookings) c[b.status] = (c[b.status] ?? 0) + 1
    return c
  }, [state])

  const filtered = useMemo(() => {
    if (state.status !== 'loaded') return []
    const byTab = tab === 'all' ? state.bookings : state.bookings.filter((b) => b.status === tab)
    const q = search.trim().toLowerCase()
    if (!q) return byTab
    return byTab.filter((b) => {
      const haystack = [
        b.customers?.full_name,
        b.customers?.email,
        b.vehicles?.make,
        b.vehicles?.model,
        b.id,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [state, tab, search])

  const tabs: AdminTab<TabValue>[] = [
    { value: 'all', label: t('admin.bookings.tabs.all'), count: state.status === 'loaded' ? state.bookings.length : undefined },
    { value: 'pending_payment', label: t('admin.bookings.tabs.pending'), count: counts.pending_payment },
    { value: 'confirmed', label: t('admin.bookings.tabs.confirmed'), count: counts.confirmed },
    { value: 'active', label: t('admin.bookings.tabs.active'), count: counts.active },
    { value: 'completed', label: t('admin.bookings.tabs.completed'), count: counts.completed },
    { value: 'cancelled', label: t('admin.bookings.tabs.cancelled'), count: counts.cancelled },
  ]

  return (
    <div>
      <AdminPageHeader title={t('admin.nav.bookings')} description={t('admin.bookings.subtitle')} />

      <AdminTabs tabs={tabs} active={tab} onChange={setTab} />

      <div className="mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('admin.bookings.searchPlaceholder')}
          className="w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
        />
      </div>

      {state.status === 'loading' && (
        <div className="flex flex-col items-center justify-center py-16">
          <Spinner className="h-8 w-8" />
          <p className="mt-3 text-sm text-slate-500">{t('common.loading')}</p>
        </div>
      )}

      {state.status === 'error' && <StateMessage tone="error" title={t('admin.errorGeneric')} body={state.message} />}

      {state.status === 'loaded' && filtered.length === 0 && (
        <StateMessage title={t('admin.bookings.emptyTitle')} body={t('admin.bookings.emptyBody')} />
      )}

      {state.status === 'loaded' && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-brand-navy/10 bg-white">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-brand-navy/10 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 text-start">{t('admin.bookings.columns.customer')}</th>
                <th className="px-4 py-3 text-start">{t('admin.bookings.columns.vehicle')}</th>
                <th className="px-4 py-3 text-start">{t('admin.bookings.columns.dates')}</th>
                <th className="px-4 py-3 text-start">{t('admin.bookings.columns.amount')}</th>
                <th className="px-4 py-3 text-start">{t('admin.bookings.columns.payment')}</th>
                <th className="px-4 py-3 text-start">{t('admin.bookings.columns.status')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-navy/5">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-brand-lavender/20">
                  <td className="px-4 py-3">
                    <p className="font-medium text-brand-navy">{b.customers?.full_name ?? '—'}</p>
                    <p className="text-xs text-slate-400">{b.customers?.email ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    {b.vehicles ? `${b.vehicles.make} ${b.vehicles.model}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {b.start_date} → {b.end_date}
                  </td>
                  <td className="px-4 py-3">
                    {b.currency} {b.total_price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <AdminStatusBadge status={b.payments[0]?.status ?? 'pending'} />
                  </td>
                  <td className="px-4 py-3">
                    <AdminStatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3 text-end">
                    <Link to={`/admin/bookings/${b.id}`} className="text-xs font-semibold text-brand-navy underline">
                      {t('admin.bookings.view')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
