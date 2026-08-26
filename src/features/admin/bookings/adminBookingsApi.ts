import { supabase } from '@/lib/supabaseClient'
import { AdminApiError } from '@/features/admin/adminApi'
import type { AdminBookingWithDetails, AdminBookingStatusHistoryEntry } from '@/types/domain'
import type { Database } from '@/types/database'

type BookingStatus = Database['public']['Tables']['bookings']['Row']['status']

const BOOKING_SELECT =
  '*, customers(*), vehicles(*, vehicle_categories(*)), pickup_location:locations!bookings_pickup_location_id_fkey(*), dropoff_location:locations!bookings_dropoff_location_id_fkey(*), drivers(*), payments(*)'

export async function fetchBookings(status: BookingStatus | 'all'): Promise<AdminBookingWithDetails[]> {
  let query = supabase.from('bookings').select(BOOKING_SELECT).order('created_at', { ascending: false })
  if (status !== 'all') query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw new AdminApiError(error.message)
  return (data ?? []) as unknown as AdminBookingWithDetails[]
}

/**
 * Lightweight count-only query (no row data) for the admin sidebar's
 * "needs attention" badge — bookings that have been created but not yet
 * paid for. Uses `head: true` so Supabase returns just the count, not the
 * matching rows.
 */
export async function fetchPendingBookingsCount(): Promise<number> {
  const { count, error } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending_payment')
  if (error) throw new AdminApiError(error.message)
  return count ?? 0
}

export async function fetchBookingById(id: string): Promise<AdminBookingWithDetails | null> {
  const { data, error } = await supabase.from('bookings').select(BOOKING_SELECT).eq('id', id).maybeSingle()
  if (error) throw new AdminApiError(error.message)
  return data as unknown as AdminBookingWithDetails | null
}

export async function fetchBookingStatusHistory(bookingId: string): Promise<AdminBookingStatusHistoryEntry[]> {
  const { data, error } = await supabase
    .from('booking_status_history')
    .select('*')
    .eq('booking_id', bookingId)
    .order('changed_at', { ascending: false })
  if (error) throw new AdminApiError(error.message)
  return data ?? []
}

/**
 * A plain RLS-governed UPDATE — no Edge Function needed. The Phase 0
 * `bookings_status_change` trigger (extended in Phase 3) automatically
 * writes both booking_status_history and audit_logs rows, so this single
 * call is already fully auditable with no extra code here.
 */
export async function updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
  const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId)
  if (error) throw new AdminApiError(error.message)
}

/** Signed, short-lived URL for a private driver document. Never a public URL — see the driver-documents storage policy (admin read-only). */
export async function fetchDriverDocumentUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from('driver-documents').createSignedUrl(path, 60)
  if (error) throw new AdminApiError(error.message)
  return data.signedUrl
}
