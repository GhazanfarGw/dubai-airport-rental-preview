import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchWidget } from '@/features/booking/SearchWidget'

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
    {
      id: 'loc-auh-airport',
      name: 'Abu Dhabi International Airport (AUH)',
      type: 'airport',
      city: 'Abu Dhabi',
      country: 'United Arab Emirates',
      airport_code: 'AUH',
      is_active: true,
      created_at: '',
    },
  ]),
}))

describe('SearchWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads and shows pickup/drop-off locations from the API', async () => {
    render(<SearchWidget onSearch={vi.fn()} />)
    const pickupSelect = await screen.findByLabelText(/pickup location/i)
    expect(within(pickupSelect).getByRole('option', { name: /DXB Terminal 3/ })).toBeInTheDocument()
    // Pickup Location Type defaults to "Airport" (first in the fixed
    // display order) — the city-type Downtown Dubai point shouldn't show
    // up as a pickup option until the customer switches Location Type.
    expect(within(pickupSelect).queryByRole('option', { name: /Downtown Dubai/ })).not.toBeInTheDocument()

    const dropoffSelect = screen.getByLabelText(/drop-off location/i)
    expect(within(dropoffSelect).getByRole('option', { name: /DXB Terminal 3/ })).toBeInTheDocument()
    expect(within(dropoffSelect).getByRole('option', { name: /Downtown Dubai/ })).toBeInTheDocument()
  })

  it('filters pickup/drop-off options by the selected pickup city', async () => {
    const user = userEvent.setup()
    render(<SearchWidget onSearch={vi.fn()} />)
    const pickupSelect = await screen.findByLabelText(/pickup location/i)
    const dropoffSelect = screen.getByLabelText(/drop-off location/i)

    // Dubai is the default city — the Abu Dhabi airport isn't offered yet.
    expect(within(pickupSelect).queryByRole('option', { name: /abu dhabi/i })).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText(/pickup city/i), 'Abu Dhabi')

    expect(within(pickupSelect).getByRole('option', { name: /Abu Dhabi International Airport \(AUH\)/ })).toBeInTheDocument()
    expect(within(pickupSelect).queryByRole('option', { name: /DXB Terminal 3/ })).not.toBeInTheDocument()
    expect(within(dropoffSelect).queryByRole('option', { name: /DXB Terminal 3/ })).not.toBeInTheDocument()
  })

  it('shows a validation message and does not call onSearch when submitted empty', async () => {
    const onSearch = vi.fn()
    const user = userEvent.setup()
    render(<SearchWidget onSearch={onSearch} />)
    await screen.findByLabelText(/pickup location/i)

    await user.click(screen.getByRole('button', { name: /search cars/i }))

    expect(await screen.findByText('Please choose a pickup date.')).toBeInTheDocument()
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('calls onSearch with the entered criteria once the form is valid', async () => {
    const onSearch = vi.fn()
    const user = userEvent.setup()
    render(<SearchWidget onSearch={onSearch} />)
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
