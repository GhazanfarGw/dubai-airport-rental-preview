import type { BookingConfirmationSnapshot, BookingCreationResult } from '@/types/domain'

/**
 * Guest checkout has no server-side session, so the result of
 * create-booking (needed by the Payment step) and the final confirmation
 * details (needed by the Confirmation page, including after a refresh)
 * are both captured here, in sessionStorage, keyed by booking id — the
 * same pattern and same reasoning as useCheckoutDraft.ts. Every read/
 * write is wrapped in try/catch: sessionStorage can throw in some
 * browser contexts, and losing this is a "please start over" UX, not a
 * crash.
 */
function bookingKey(bookingId: string): string {
  return `dxb-booking-result:${bookingId}`
}
function confirmationKey(bookingId: string): string {
  return `dxb-confirmation:${bookingId}`
}

export function saveBookingResult(result: BookingCreationResult) {
  try {
    sessionStorage.setItem(bookingKey(result.bookingId), JSON.stringify(result))
  } catch {
    // best-effort only
  }
}

export function readBookingResult(bookingId: string): BookingCreationResult | null {
  try {
    const raw = sessionStorage.getItem(bookingKey(bookingId))
    return raw ? (JSON.parse(raw) as BookingCreationResult) : null
  } catch {
    return null
  }
}

export function saveConfirmationSnapshot(snapshot: BookingConfirmationSnapshot) {
  try {
    sessionStorage.setItem(confirmationKey(snapshot.bookingId), JSON.stringify(snapshot))
  } catch {
    // best-effort only
  }
}

export function readConfirmationSnapshot(bookingId: string): BookingConfirmationSnapshot | null {
  try {
    const raw = sessionStorage.getItem(confirmationKey(bookingId))
    return raw ? (JSON.parse(raw) as BookingConfirmationSnapshot) : null
  } catch {
    return null
  }
}
