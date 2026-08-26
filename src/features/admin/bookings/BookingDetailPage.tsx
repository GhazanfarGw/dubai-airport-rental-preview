import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  fetchBookingById,
  fetchBookingStatusHistory,
  updateBookingStatus,
  fetchDriverDocumentUrl,
} from '@/features/admin/bookings/adminBookingsApi'
import { AdminApiError } from '@/features/admin/adminApi'
import { AdminPageHeader } from '@/features/admin/shared/AdminPageHeader'
import { AdminStatusBadge } from '@/features/admin/shared/AdminStatusBadge'
import { StateMessage, Spinner } from '@/features/shared/StateMessage'
import type { AdminBookingWithDetails, AdminBookingStatusHistoryEntry } from '@/types/domain'
import type { Database } from '@/types/database'

type BookingStatus = Database['public']['Tables']['bookings']['Row']['status']

const STATUS_OPTIONS: BookingStatus[] = ['pending_payment', 'confirmed', 'active', 'completed', 'cancelled']

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'not_found' }
  | { status: 'loaded'; booking: AdminBookingWithDetails; history: AdminBookingStatusHistoryEntry[] }

export function BookingDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  async function load() {
    if (!id) return
    setState({ status: 'loading' })
    try {
      const booking = await fetchBookingById(id)
      if (!booking) {
        setState({ status: 'not_found' })
        return
      }
      const history = await fetchBookingStatusHistory(id)
      setState({ status: 'loaded', booking, history })
    } catch (err) {
      setState({ status: 'error', message: err instanceof AdminApiError || err instanceof Error ? err.message : t('admin.errorGeneric') })
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleStatusChange(next: BookingStatus) {
    if (!id || updating) return
    setUpdating(true)
    setUpdateError(null)
    try {
      await updateBookingStatus(id, next)
      await load()
    } catch (err) {
      setUpdateError(err instanceof AdminApiError || err instanceof Error ? err.message : t('admin.errorGeneric'))
    } finally {
      setUpdating(false)
    }
  }

  if (state.status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Spinner className="h-8 w-8" />
        <p className="mt-3 text-sm text-slate-500">{t('common.loading')}</p>
      </div>
    )
  }

  if (state.status === 'not_found') {
    return (
      <StateMessage
        title={t('admin.bookings.notFoundTitle')}
        action={
          <Link to="/admin/bookings" className="text-sm font-semibold text-brand-navy underline">
            {t('admin.bookings.backToList')}
          </Link>
        }
      />
    )
  }

  if (state.status === 'error') {
    return <StateMessage tone="error" title={t('admin.errorGeneric')} body={state.message} />
  }

  const { booking, history } = state
  const payment = booking.payments[0] ?? null
  const driver = booking.drivers[0] ?? null

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/admin/bookings')}
        className="mb-4 text-sm font-medium text-slate-500 hover:text-brand-navy"
      >
        ← {t('admin.bookings.backToList')}
      </button>

      <AdminPageHeader
        title={t('admin.bookings.detailTitle')}
        description={`${t('admin.bookings.reference')}: ${booking.id}`}
        action={
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t('admin.bookings.changeStatus')}
            </label>
            <select
              value={booking.status}
              disabled={updating}
              onChange={(e) => void handleStatusChange(e.target.value as BookingStatus)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-brand-navy outline-none focus:border-brand-navy"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {t(`admin.status.${s}`)}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {updateError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{updateError}</div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section title={t('admin.bookings.section.booking')}>
          <Row label={t('admin.bookings.columns.status')} value={<AdminStatusBadge status={booking.status} />} />
          <Row label={t('admin.bookings.createdDate')} value={new Date(booking.created_at).toLocaleString()} />
          <Row label={t('admin.bookings.reference')} value={<span className="font-mono text-xs">{booking.id}</span>} />
        </Section>

        <Section title={t('admin.bookings.section.customer')}>
          <Row label={t('admin.bookings.columns.customer')} value={booking.customers?.full_name ?? '—'} />
          <Row label="Email" value={booking.customers?.email ?? '—'} />
          <Row label={t('checkout.customer.phone')} value={booking.customers?.phone ?? '—'} />
        </Section>

        <Section title={t('admin.bookings.section.driver')}>
          {driver ? (
            <>
              <Row label={t('checkout.driver.fullName')} value={driver.full_name} />
              <Row label={t('checkout.driver.dateOfBirth')} value={driver.date_of_birth} />
              <Row label={t('checkout.driver.licenseNumber')} value={driver.license_number} />
              <Row label={t('checkout.driver.licenseCountry')} value={driver.license_country} />
              <Row label={t('checkout.driver.licenseExpiry')} value={driver.license_expiry} />
              <DriverDocumentRow label={t('admin.bookings.licenseDocument')} path={driver.license_document_path} />
              <DriverDocumentRow label={t('admin.bookings.idDocument')} path={driver.id_document_path} />
            </>
          ) : (
            <p className="text-sm text-slate-400">{t('admin.bookings.noDriver')}</p>
          )}
        </Section>

        <Section title={t('admin.bookings.section.rental')}>
          <Row label={t('checkout.summary.vehicle')} value={booking.vehicles ? `${booking.vehicles.make} ${booking.vehicles.model} (${booking.vehicles.model_year})` : '—'} />
          <Row label={t('vehicleDetail.dates')} value={`${booking.start_date} → ${booking.end_date}`} />
          <Row label={t('admin.bookings.pickup')} value={booking.pickup_location?.name ?? '—'} />
          <Row label={t('admin.bookings.dropoff')} value={booking.dropoff_location?.name ?? '—'} />
        </Section>

        <Section title={t('admin.bookings.section.payment')}>
          <Row label={t('admin.bookings.columns.amount')} value={`${booking.currency} ${booking.total_price.toLocaleString()}`} />
          <Row label={t('admin.bookings.columns.payment')} value={payment ? <AdminStatusBadge status={payment.status} /> : '—'} />
          <Row label={t('admin.payments.columns.reference')} value={payment?.provider_reference ?? '—'} />
        </Section>

        <Section title={t('admin.bookings.section.history')}>
          {history.length === 0 ? (
            <p className="text-sm text-slate-400">{t('admin.bookings.noHistory')}</p>
          ) : (
            <ul className="space-y-2">
              {history.map((h) => (
                <li key={h.id} className="flex items-center justify-between text-xs">
                  <span>
                    {h.old_status ? t(`admin.status.${h.old_status}`) : '—'} → {t(`admin.status.${h.new_status}`)}
                  </span>
                  <span className="text-slate-400">{new Date(h.changed_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  )
}

function DriverDocumentRow({ label, path }: { label: string; path: string | null }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleView() {
    if (!path) return
    setLoading(true)
    setError(null)
    try {
      const url = await fetchDriverDocumentUrl(path)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setError(err instanceof AdminApiError || err instanceof Error ? err.message : t('admin.errorGeneric'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right">
        {path ? (
          <button type="button" onClick={() => void handleView()} disabled={loading} className="font-semibold text-brand-navy underline">
            {loading ? t('common.loading') : t('admin.bookings.viewDocument')}
          </button>
        ) : (
          <span className="text-slate-400">{t('admin.bookings.noDocument')}</span>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </dd>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-brand-navy/10 bg-white p-5">
      <h2 className="text-sm font-semibold text-brand-navy">{title}</h2>
      <dl className="mt-3 space-y-2 text-sm">{children}</dl>
    </div>
  )
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-brand-navy">{value}</dd>
    </div>
  )
}
