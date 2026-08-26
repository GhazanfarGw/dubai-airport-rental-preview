import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookingSearchSection } from '@/features/booking/BookingSearchSection'

vi.mock('@/features/booking/api', () => ({
  fetchLocations: vi.fn().mockResolvedValue([
    { id: 'loc-airport', name: 'DXB Terminal 3', type: 'airport', is_active: true, created_at: '' },
    { id: 'loc-city', name: 'Downtown Dubai', type: 'city', is_active: true, created_at: '' },
  ]),
}))

describe('BookingSearchSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes #booking-section as an anchor/observer target and renders the real search form', async () => {
    const { container } = render(<BookingSearchSection onSearch={vi.fn()} />)
    expect(container.querySelector('#booking-section')).not.toBeNull()
    expect(await screen.findByLabelText(/pickup location/i)).toBeInTheDocument()
  })

  it('still calls onSearch with the entered criteria — no duplicated booking logic', async () => {
    const onSearch = vi.fn()
    const user = userEvent.setup()
    render(<BookingSearchSection onSearch={onSearch} />)
    await screen.findByLabelText(/pickup location/i)

    fireEvent.change(screen.getByLabelText(/pickup date/i), { target: { value: '2026-09-12' } })
    fireEvent.change(screen.getByLabelText(/drop-off date/i), { target: { value: '2026-09-15' } })
    await user.selectOptions(screen.getByLabelText(/pickup location/i), 'loc-airport')
    await user.selectOptions(screen.getByLabelText(/drop-off location/i), 'loc-city')
    await user.click(screen.getByRole('button', { name: /search cars/i }))

    await waitFor(() =>
      expect(onSearch).toHaveBeenCalledWith({
        startDate: '2026-09-12',
        endDate: '2026-09-15',
        pickupLocationId: 'loc-airport',
        dropoffLocationId: 'loc-city',
      }),
    )
  })
})
