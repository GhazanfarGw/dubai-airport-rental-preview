import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookingSearchSection } from '@/features/booking/BookingSearchSection'

/** Dates relative to "today" — resilient to whenever these tests actually
 *  run, unlike a hardcoded future date. Mirrors the same helper in
 *  `DateRangePicker.test.tsx`. */
function futureIso(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** The calendar's day buttons are labelled with their full accessible date (see DateRangePicker.tsx). */
function fullDateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('en', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    calendar: 'gregory',
    numberingSystem: 'latn',
  }).format(new Date(y, m - 1, d))
}

vi.mock('@/features/booking/api', () => ({
  fetchLocations: vi.fn().mockResolvedValue([
    {
      id: 'loc-airport',
      name: 'DXB Terminal 3',
      type: 'airport',
      city: 'Dubai',
      country: 'United Arab Emirates',
      airport_code: 'DXB',
      is_active: true,
      created_at: '',
    },
    {
      id: 'loc-city',
      name: 'Downtown Dubai',
      type: 'city',
      city: 'Dubai',
      country: 'United Arab Emirates',
      airport_code: null,
      is_active: true,
      created_at: '',
    },
  ]),
}))

describe('BookingSearchSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes #booking-section as an anchor/observer target and renders the real search form', async () => {
    const { container } = render(<BookingSearchSection onSearch={vi.fn()} />)
    expect(container.querySelector('#booking-section')).not.toBeNull()
    expect(await screen.findByRole('button', { name: /select pickup point/i })).toBeInTheDocument()
  })

  it('still calls onSearch with the entered criteria — no duplicated booking logic', async () => {
    const onSearch = vi.fn()
    const user = userEvent.setup()
    render(<BookingSearchSection onSearch={onSearch} />)
    await screen.findByRole('button', { name: /select pickup point/i })

    const startIso = futureIso(2)
    const endIso = futureIso(5)
    await user.click(document.querySelector('button[aria-haspopup="dialog"]') as HTMLElement)
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: fullDateLabel(startIso) }))
    await user.click(within(dialog).getByRole('button', { name: fullDateLabel(endIso) }))
    await user.click(within(dialog).getByRole('button', { name: 'Done' }))

    await user.click(screen.getByRole('button', { name: /select pickup point/i }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /DXB Terminal 3/ }))

    // "Same Return Location" is checked by default — drop-off mirrors pickup.
    await user.click(screen.getByRole('button', { name: /search cars/i }))

    await waitFor(() =>
      expect(onSearch).toHaveBeenCalledWith({
        startDate: startIso,
        endDate: endIso,
        pickupLocationId: 'loc-airport',
        dropoffLocationId: 'loc-airport',
        pickupTime: '10:00',
        returnTime: '10:00',
      }),
    )
  })
})
