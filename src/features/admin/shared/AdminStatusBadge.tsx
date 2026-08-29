import { useTranslation } from 'react-i18next'

const TONE_CLASSES: Record<string, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  info: 'bg-brand-lavender text-brand-navy',
  warning: 'bg-amber-100 text-amber-800',
  success: 'bg-emerald-100 text-emerald-700',
  danger: 'bg-red-100 text-red-700',
}

const STATUS_TONE: Record<string, keyof typeof TONE_CLASSES> = {
  // bookings
  pending_payment: 'warning',
  confirmed: 'info',
  active: 'success',
  completed: 'neutral',
  cancelled: 'danger',
  // payments
  pending: 'warning',
  paid: 'success',
  failed: 'danger',
  refunded: 'neutral',
  // complaints
  open: 'danger',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'neutral',
  // extensions
  approved: 'success',
  rejected: 'danger',
  requested: 'info',
  conflict_unresolved: 'warning',
  // vehicles / operational
  available: 'success',
  reserved: 'info',
  rented: 'warning',
  maintenance: 'danger',
  unavailable: 'neutral',
  retired: 'neutral',
}

/** One consistent status-chip look across every admin list — booking/payment/complaint/vehicle status all key off the same translation namespace by their raw enum value. */
export function AdminStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  const tone = STATUS_TONE[status] ?? 'neutral'
  return (
    <span className={'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ' + TONE_CLASSES[tone]}>
      {t(`admin.status.${status}`, { defaultValue: status })}
    </span>
  )
}
