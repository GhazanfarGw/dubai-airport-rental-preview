import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FeaturedVehicles } from '@/features/booking/FeaturedVehicles'
import { fetchFeaturedVehicles } from '@/features/booking/api'
import type { VehicleWithDetails } from '@/types/domain'

vi.mock('@/features/booking/api', () => ({
  fetchFeaturedVehicles: vi.fn(),
}))

const vehicle: VehicleWithDetails = {
  id: 'veh-1',
  category_id: 'cat-1',
  make: 'Toyota',
  model: 'Camry',
  model_year: 2024,
  transmission: 'automatic',
  seats: 5,
  plate_number: 'A12345',
  status: 'available',
  created_at: '2026-01-01T00:00:00Z',
  vehicle_categories: { id: 'cat-1', name: 'Sedan', description: null },
  vehicle_images: [],
  pricing: [
    { id: 'p1', vehicle_id: 'veh-1', term: 'daily', list_price: 200, client_price: 180, currency: 'AED' },
  ],
} as unknown as VehicleWithDetails

function renderIt() {
  return render(
    <MemoryRouter>
      <FeaturedVehicles />
    </MemoryRouter>,
  )
}

describe('FeaturedVehicles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a professional empty state when no vehicles exist — never fake data', async () => {
    vi.mocked(fetchFeaturedVehicles).mockResolvedValue([])
    renderIt()

    expect(await screen.findByText('No vehicles listed yet')).toBeInTheDocument()
    expect(screen.getByText(/check back soon/i)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /view details/i })).not.toBeInTheDocument()
  })

  it('renders real vehicles from the database using the shared VehicleCard', async () => {
    vi.mocked(fetchFeaturedVehicles).mockResolvedValue([vehicle])
    renderIt()

    expect(await screen.findByText('Toyota Camry')).toBeInTheDocument()
    expect(screen.getByText(/from/i)).toBeInTheDocument()
    expect(screen.getByText(/AED/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view details/i })).toHaveAttribute('href', '/vehicles/veh-1')
  })

  it('shows the empty state (not a crash) if the fetch fails', async () => {
    vi.mocked(fetchFeaturedVehicles).mockRejectedValue(new Error('network down'))
    renderIt()

    expect(await screen.findByText('No vehicles listed yet')).toBeInTheDocument()
  })
})
