import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ManageBookingPage } from './ManageBookingPage'
import { BookingLookupError } from './lookupApi'

const lookupMock = vi.fn()
const submitExtendMock = vi.fn()

vi.mock('./lookupApi', async () => {
  const actual = await vi.importActual<typeof import('./lookupApi')>('./lookupApi')
  return {
    ...actual,
    lookupBooking: (...args: unknown[]) => lookupMock(...args),
  }
})

vi.mock('./extendRentalApi', async () => {
  const actual = await vi.importActual<typeof import('./extendRentalApi')>('./extendRentalApi')
  return {
    ...actual,
    submitExtendRentalRequest: (...args: unknown[]) => submitExtendMock(...args),
  }
})

const confirmedResult = {
  bookingId: 'bk-1',
  bookingReference: 'BLS-ABCDEF12',
  bookingStatus: 'confirmed',
  startDate: '2026-09-10',
  endDate: '2026-09-15',
  totalPrice: 900,
  currency: 'AED',
  vehicleMake: 'Toyota',
  vehicleModel: 'Camry',
  vehiclePlate: 'ABC-123',
  pickupLocationName: 'DXB Terminal 3',
  dropoffLocationName: 'Downtown Dubai',
  customerName: 'Jane Renter',
  paymentStatus: 'paid',
  createdAt: '2026-08-20T10:00:00Z',
}

const completedResult = {
  ...confirmedResult,
  bookingId: 'bk-2',
  bookingReference: 'BLS-99887766',
  bookingStatus: 'completed',
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ManageBookingPage />
    </MemoryRouter>,
  )
}

function fillAndSubmit(query: string) {
  fireEvent.change(screen.getByPlaceholderText('BLS-XXXXXXXX or ABC-123'), { target: { value: query } })
  fireEvent.click(screen.getByRole('button', { name: /check status/i }))
}

describe('ManageBookingPage', () => {
  beforeEach(() => {
    lookupMock.mockReset()
    submitExtendMock.mockReset()
  })

  it('shows the booking summary when found by booking reference', async () => {
    lookupMock.mockResolvedValue(confirmedResult)
    renderPage()
    fillAndSubmit('BLS-ABCDEF12')

    await waitFor(() => expect(screen.getByText('BLS-ABCDEF12')).toBeInTheDocument())
    expect(screen.getByText('Toyota Camry')).toBeInTheDocument()
    expect(screen.getByText('Jane Renter')).toBeInTheDocument()
    expect(screen.getByText('ABC-123')).toBeInTheDocument()
    expect(lookupMock).toHaveBeenCalledWith('BLS-ABCDEF12')
  })

  it('shows the booking summary when found by vehicle plate alone', async () => {
    lookupMock.mockResolvedValue(confirmedResult)
    renderPage()
    fillAndSubmit('ABC-123')

    await waitFor(() => expect(screen.getByText('BLS-ABCDEF12')).toBeInTheDocument())
    expect(lookupMock).toHaveBeenCalledWith('ABC-123')
  })

  it('shows a generic not-found message, never fake data, when nothing matches', async () => {
    lookupMock.mockResolvedValue(null)
    renderPage()
    fillAndSubmit('BLS-NOTREAL1')

    await waitFor(() => expect(screen.getByText(/couldn't find a booking/i)).toBeInTheDocument())
    expect(screen.queryByText('BLS-NOTREAL1')).not.toBeInTheDocument()
  })

  it('shows the BookingLookupError message directly when the lookup itself fails', async () => {
    lookupMock.mockRejectedValue(new BookingLookupError('connection failed'))
    renderPage()
    fillAndSubmit('BLS-ABCDEF12')

    await waitFor(() => expect(screen.getByText('connection failed')).toBeInTheDocument())
  })

  it('shows a generic error message for an unexpected (non-BookingLookupError) failure', async () => {
    lookupMock.mockRejectedValue(new Error('unexpected'))
    renderPage()
    fillAndSubmit('BLS-ABCDEF12')

    await waitFor(() => expect(screen.getByText(/something went wrong/i)).toBeInTheDocument())
  })

  it('shows the inline extend-rental section for a confirmed booking', async () => {
    lookupMock.mockResolvedValue(confirmedResult)
    renderPage()
    fillAndSubmit('BLS-ABCDEF12')

    await waitFor(() => expect(screen.getByText('Extend This Rental')).toBeInTheDocument())
  })

  it('does not show the extend-rental section for a completed booking', async () => {
    lookupMock.mockResolvedValue(completedResult)
    renderPage()
    fillAndSubmit('BLS-99887766')

    await waitFor(() => expect(screen.getByText('BLS-99887766')).toBeInTheDocument())
    expect(screen.queryByText('Extend This Rental')).not.toBeInTheDocument()
  })
})
