import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveBookingResult,
  readBookingResult,
  saveConfirmationSnapshot,
  readConfirmationSnapshot,
} from './checkoutStorage'
import type { BookingConfirmationSnapshot, BookingCreationResult } from '@/types/domain'

const bookingResult: BookingCreationResult = {
  bookingId: 'bk-1',
  bookingReference: 'BLS-ABCDEF12',
  customerId: 'cust-1',
  driverId: 'drv-1',
  paymentId: 'pay-1',
  status: 'pending_payment',
  term: 'daily',
  unitPrice: 150,
  totalPrice: 900,
  currency: 'AED',
  days: 6,
}

const confirmationSnapshot: BookingConfirmationSnapshot = {
  bookingReference: 'BLS-ABCDEF12',
  bookingId: 'bk-1',
  vehicleMake: 'Toyota',
  vehicleModel: 'Camry',
  startDate: '2026-09-10',
  endDate: '2026-09-15',
  pickupLocationName: 'DXB Terminal 3',
  dropoffLocationName: 'Downtown Dubai',
  customerName: 'Jane Renter',
  driverName: 'John Driver',
  totalPrice: 900,
  currency: 'AED',
  paymentStatus: 'paid',
  bookingStatus: 'confirmed',
}

describe('checkoutStorage', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('round-trips a booking creation result by booking id', () => {
    saveBookingResult(bookingResult)
    expect(readBookingResult('bk-1')).toEqual(bookingResult)
  })

  it('returns null for a booking id that was never saved', () => {
    expect(readBookingResult('does-not-exist')).toBeNull()
  })

  it('round-trips a confirmation snapshot by booking id', () => {
    saveConfirmationSnapshot(confirmationSnapshot)
    expect(readConfirmationSnapshot('bk-1')).toEqual(confirmationSnapshot)
  })

  it('returns null for a confirmation that was never saved', () => {
    expect(readConfirmationSnapshot('does-not-exist')).toBeNull()
  })

  it('does not throw and returns null when stored JSON is corrupted', () => {
    sessionStorage.setItem('dxb-booking-result:bk-2', '{not valid json')
    expect(readBookingResult('bk-2')).toBeNull()
  })

  it('keeps booking results and confirmation snapshots for different booking ids independent', () => {
    saveBookingResult(bookingResult)
    saveBookingResult({ ...bookingResult, bookingId: 'bk-2', bookingReference: 'BLS-22222222' })
    expect(readBookingResult('bk-1')?.bookingReference).toBe('BLS-ABCDEF12')
    expect(readBookingResult('bk-2')?.bookingReference).toBe('BLS-22222222')
  })
})
