import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ManageBookingPage } from './ManageBookingPage'
import { BookingLookupError } from './lookupApi'

const lookupMock = vi.fn()

vi.mock('./lookupApi', async () => {
  const actual = await vi.importActual<typeof import('./lookupApi')>('./lookupApi')
  return {
    ...actual,
    lookupBookingByReference: (...args: unknown[]) => lookupMock(...args),
  }
})

const result = {
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
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ManageBookingPage />
    </MemoryRouter>,
  )
}

function fillAndSubmit(reference: string, email: string) {
  fireEvent.change(screen.getByPlaceholderText('BLS-XXXXXXXX'), { target: { value: reference } })
  fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: email } })
  fireEvent.click(screen.getByRole('button', { name: /check status/i }))
}

describe('ManageBookingPage', () => {
  beforeEach(() => {
    lookupMock.mockReset()
  })

  it('shows the booking summary when the reference and email match', async () => {
    lookupMock.mockResolvedValue(result)
    renderPage()
    fillAndSubmit('BLS-ABCDEF12', 'jane@example.com')

    await waitFor(() => expect(screen.getByText('BLS-ABCDEF12')).toBeInTheDocument())
    expect(screen.getByText('Toyota Camry')).toBeInTheDocument()
    expect(screen.getByText('Jane Renter')).toBeInTheDocument()
    expect(lookupMock).toHaveBeenCalledWith('BLS-ABCDEF12', 'jane@example.com')
  })

  it('shows a not-found message, never fake data, when nothing matches', async () => {
    lookupMock.mockResolvedValue(null)
    renderPage()
    fillAndSubmit('BLS-NOTREAL1', 'nobody@example.com')

    await waitFor(() => expect(screen.getByText(/couldn't find a booking/i)).toBeInTheDocument())
    expect(screen.queryByText('BLS-NOTREAL1')).not.toBeInTheDocument()
  })

  it('shows the BookingLookupError message directly when the lookup itself fails', async () => {
    lookupMock.mockRejectedValue(new BookingLookupError('connection failed'))
    renderPage()
    fillAndSubmit('BLS-ABCDEF12', 'jane@example.com')

    await waitFor(() => expect(screen.getByText('connection failed')).toBeInTheDocument())
  })

  it('shows a generic error message for an unexpected (non-BookingLookupError) failure', async () => {
    lookupMock.mockRejectedValue(new Error('unexpected'))
    renderPage()
    fillAndSubmit('BLS-ABCDEF12', 'jane@example.com')

    await waitFor(() => expect(screen.getByText(/something went wrong/i)).toBeInTheDocument())
  })
})
