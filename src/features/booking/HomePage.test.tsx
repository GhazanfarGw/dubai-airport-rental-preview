import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HomePage } from '@/features/booking/HomePage'

vi.mock('@/features/booking/api', () => ({
  fetchLocations: vi.fn().mockResolvedValue([]),
  fetchFeaturedVehicles: vi.fn().mockResolvedValue([]),
}))

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the hero, booking search, why-choose, featured vehicles, and how-it-works sections in order', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    const hero = await screen.findByRole('heading', { name: 'A fleet for every budget' })
    const booking = screen.getByRole('heading', { name: 'Find your car' })
    const whyChoose = screen.getByRole('heading', { name: 'Why choose Bliss Rent' })
    const featured = screen.getByRole('heading', { name: 'Featured vehicles' })
    const howItWorks = await screen.findByRole('heading', { name: 'How it works' })

    const order = [hero, booking, whyChoose, featured, howItWorks]
    for (let i = 0; i < order.length - 1; i++) {
      // eslint-disable-next-line no-bitwise
      expect(order[i].compareDocumentPosition(order[i + 1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    }
  })

  it('gives the booking section an id="booking-section" anchor target for the hero CTA and sticky bar', async () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )
    await screen.findByRole('heading', { name: 'Find your car' })
    expect(container.querySelector('#booking-section')).not.toBeNull()
    expect(container.querySelector('#why-choose')).not.toBeNull()
    expect(container.querySelector('#how-it-works')).not.toBeNull()
  })

  it("renders the Featured Vehicles empty state rather than fake vehicle data when none exist", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )
    expect(await screen.findByText('No vehicles listed yet')).toBeInTheDocument()
  })
})
