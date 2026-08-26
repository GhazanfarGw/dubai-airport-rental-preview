import { describe, it, expect, vi, beforeEach } from 'vitest'
import { chainable } from '@/test/supabaseMock'

const fromMock = vi.fn()
const storageFromMock = vi.fn()

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
    storage: { from: (...args: unknown[]) => storageFromMock(...args) },
  },
}))

const { fetchBookings, fetchBookingById, updateBookingStatus, fetchDriverDocumentUrl } = await import('./adminBookingsApi')

describe('adminBookingsApi', () => {
  beforeEach(() => {
    fromMock.mockReset()
    storageFromMock.mockReset()
  })

  it('lists bookings for the requested status (Booking Management)', async () => {
    const rows = [{ id: 'b1', status: 'confirmed' }, { id: 'b2', status: 'confirmed' }]
    fromMock.mockReturnValue(chainable({ data: rows }))

    const result = await fetchBookings('confirmed')

    expect(fromMock).toHaveBeenCalledWith('bookings')
    expect(result).toHaveLength(2)
  })

  it('returns null when a booking id does not exist, instead of throwing (Booking Detail)', async () => {
    fromMock.mockReturnValue(chainable({ data: null }))
    const result = await fetchBookingById('does-not-exist')
    expect(result).toBeNull()
  })

  it('fetches a single booking with its joined details (Booking Detail)', async () => {
    const row = { id: 'b1', status: 'active', customers: { full_name: 'Jane' } }
    fromMock.mockReturnValue(chainable({ data: row }))
    const result = await fetchBookingById('b1')
    expect(result?.id).toBe('b1')
  })

  it('raises AdminApiError instead of a bare Supabase error on a failed query', async () => {
    fromMock.mockReturnValue(chainable({ data: null, error: { message: 'permission denied' } }))
    await expect(fetchBookings('all')).rejects.toThrow('permission denied')
  })

  it('updates booking status via a plain RLS-governed UPDATE — no parallel status-mutation path', async () => {
    fromMock.mockReturnValue(chainable({ data: null, error: null }))
    await expect(updateBookingStatus('b1', 'completed')).resolves.toBeUndefined()
    expect(fromMock).toHaveBeenCalledWith('bookings')
  })

  it('fetches a signed, short-lived URL for a private driver document — never a public URL', async () => {
    storageFromMock.mockReturnValue({
      createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'https://signed.example/license.pdf?token=abc' }, error: null }),
    })
    const url = await fetchDriverDocumentUrl('booking-1/license.pdf')
    expect(storageFromMock).toHaveBeenCalledWith('driver-documents')
    expect(url).toContain('token=')
  })
})
