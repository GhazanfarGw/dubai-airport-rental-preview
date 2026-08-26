import { describe, it, expect, vi, beforeEach } from 'vitest'

const rpcMock = vi.fn()

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { rpc: (...args: unknown[]) => rpcMock(...args) },
}))

const { lookupBookingByReference, BookingLookupError } = await import('./lookupApi')

const row = {
  booking_id: 'bk-1',
  booking_reference: 'BLS-ABCDEF12',
  booking_status: 'confirmed',
  start_date: '2026-09-10',
  end_date: '2026-09-15',
  total_price: 900,
  currency: 'AED',
  vehicle_make: 'Toyota',
  vehicle_model: 'Camry',
  pickup_location_name: 'DXB Terminal 3',
  dropoff_location_name: 'Downtown Dubai',
  customer_name: 'Jane Renter',
  payment_status: 'paid',
  created_at: '2026-08-20T10:00:00Z',
}

describe('lookupBookingByReference', () => {
  beforeEach(() => {
    rpcMock.mockReset()
  })

  it('calls get_booking_by_reference with the trimmed reference and email', async () => {
    rpcMock.mockResolvedValue({ data: [row], error: null })
    await lookupBookingByReference('  BLS-ABCDEF12  ', '  Jane@Example.com  ')
    expect(rpcMock).toHaveBeenCalledWith('get_booking_by_reference', {
      p_booking_reference: 'BLS-ABCDEF12',
      p_email: 'Jane@Example.com',
    })
  })

  it('maps a matching row into a BookingLookupResult', async () => {
    rpcMock.mockResolvedValue({ data: [row], error: null })
    const result = await lookupBookingByReference('BLS-ABCDEF12', 'jane@example.com')
    expect(result).toEqual({
      bookingId: 'bk-1',
      bookingReference: 'BLS-ABCDEF12',
      bookingStatus: 'confirmed',
      startDate: '2026-09-10',
      endDate: '2026-09-15',
      totalPrice: 900,
      currency: 'AED',
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry',
      pickupLocationName: 'DXB Terminal 3',
      dropoffLocationName: 'Downtown Dubai',
      customerName: 'Jane Renter',
      paymentStatus: 'paid',
      createdAt: '2026-08-20T10:00:00Z',
    })
  })

  it('returns null (not an error) when the reference/email combination matches nothing', async () => {
    rpcMock.mockResolvedValue({ data: [], error: null })
    const result = await lookupBookingByReference('BLS-NOTREAL1', 'nobody@example.com')
    expect(result).toBeNull()
  })

  it('returns null identically for a wrong email on a real reference — never distinguishes the two', async () => {
    rpcMock.mockResolvedValue({ data: [], error: null })
    const result = await lookupBookingByReference('BLS-ABCDEF12', 'wrong@example.com')
    expect(result).toBeNull()
  })

  it('raises BookingLookupError on a database error', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'connection failed' } })
    await expect(lookupBookingByReference('BLS-ABCDEF12', 'jane@example.com')).rejects.toThrow(BookingLookupError)
  })
})
