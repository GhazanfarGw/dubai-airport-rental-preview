import { describe, it, expect, vi, beforeEach } from 'vitest'
import { chainable } from '@/test/supabaseMock'

const fromMock = vi.fn()
let lastUpdatePayload: Record<string, unknown> | null = null

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
  },
}))

const { fetchComplaints, updateComplaint } = await import('./adminComplaintsApi')

describe('adminComplaintsApi', () => {
  beforeEach(() => {
    fromMock.mockReset()
    lastUpdatePayload = null
  })

  it('lists complaints filtered by status (Complaints / Support)', async () => {
    fromMock.mockReturnValue(chainable({ data: [{ id: 'cm1', status: 'open' }] }))
    const result = await fetchComplaints('open')
    expect(fromMock).toHaveBeenCalledWith('complaints')
    expect(result).toHaveLength(1)
  })

  it('stamps resolved_at when a complaint transitions to resolved', async () => {
    fromMock.mockImplementation(() => ({
      update: (payload: Record<string, unknown>) => {
        lastUpdatePayload = payload
        return chainable({ data: null, error: null })
      },
    }))

    await updateComplaint('cm1', { status: 'resolved', internalNotes: 'Checked with the customer.', resolution: 'Refunded the deposit.' })

    expect(lastUpdatePayload?.status).toBe('resolved')
    expect(lastUpdatePayload?.resolved_at).not.toBeNull()
    expect(lastUpdatePayload?.internal_notes).toBe('Checked with the customer.')
    expect(lastUpdatePayload?.resolution).toBe('Refunded the deposit.')
  })

  it('clears resolved_at when a complaint is reopened to in_progress', async () => {
    fromMock.mockImplementation(() => ({
      update: (payload: Record<string, unknown>) => {
        lastUpdatePayload = payload
        return chainable({ data: null, error: null })
      },
    }))

    await updateComplaint('cm1', { status: 'in_progress', internalNotes: '', resolution: '' })

    expect(lastUpdatePayload?.resolved_at).toBeNull()
    expect(lastUpdatePayload?.internal_notes).toBeNull()
  })
})
