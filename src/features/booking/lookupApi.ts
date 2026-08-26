import { supabase } from '@/lib/supabaseClient'
import type { BookingLookupResult } from '@/types/domain'

export class BookingLookupError extends Error {}

/**
 * Phase 6 — Booking Retrieval. Guest checkout has no auth session (see
 * ConfirmationPage.tsx / docs/ARCHITECTURE.md), so this is the only way a
 * customer can check their booking status later, from a different
 * browser or device, or after their same-browser sessionStorage
 * confirmation snapshot is gone. Calls the SECURITY DEFINER
 * get_booking_by_reference() RPC (Phase 6 migration) — same pattern as
 * available_vehicles() (Phase 1): a narrow, purpose-built database
 * function is the only thing that can see the private bookings table,
 * and it hands back nothing beyond what ConfirmationPage already shows.
 *
 * Returns null for ANY mismatch (unknown reference, wrong email, or a
 * reference that belongs to someone else) — never a distinct "wrong
 * email" vs "wrong reference" error, so this can't be used to test
 * whether a given reference exists.
 */
export async function lookupBookingByReference(
  bookingReference: string,
  email: string,
): Promise<BookingLookupResult | null> {
  const { data, error } = await supabase.rpc('get_booking_by_reference', {
    p_booking_reference: bookingReference.trim(),
    p_email: email.trim(),
  })

  if (error) throw new BookingLookupError(error.message)
  const row = data?.[0]
  if (!row) return null

  return {
    bookingId: row.booking_id,
    bookingReference: row.booking_reference,
    bookingStatus: row.booking_status,
    startDate: row.start_date,
    endDate: row.end_date,
    totalPrice: row.total_price,
    currency: row.currency,
    vehicleMake: row.vehicle_make,
    vehicleModel: row.vehicle_model,
    pickupLocationName: row.pickup_location_name,
    dropoffLocationName: row.dropoff_location_name,
    customerName: row.customer_name,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
  }
}
