/**
 * Extracted verbatim from the pre-Phase-8 `AdminStatusBadge` tone map —
 * no value or class changed — so the shared `StatusBadge` component
 * behaves identically to the admin-only version it replaces underneath
 * `AdminStatusBadge` (kept as a thin alias for existing call sites).
 */
export type StatusTone = 'neutral' | 'info' | 'warning' | 'success' | 'danger'

export const STATUS_TONE_CLASSES: Record<StatusTone, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  info: 'bg-brand-lavender text-brand-navy',
  warning: 'bg-amber-100 text-amber-800',
  success: 'bg-emerald-100 text-emerald-700',
  danger: 'bg-red-100 text-red-700',
}

export const STATUS_VALUE_TONE: Record<string, StatusTone> = {
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
