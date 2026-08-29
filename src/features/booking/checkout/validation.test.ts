import { describe, it, expect } from 'vitest'
import { validateCustomerDraft, validateDriverDraft } from './validation'
import { EMPTY_CUSTOMER_DRAFT, EMPTY_DRIVER_DRAFT } from '@/types/domain'

describe('validateCustomerDraft', () => {
  it('accepts a fully valid customer', () => {
    expect(
      validateCustomerDraft({ fullName: 'Jane Renter', email: 'jane@example.com', phone: '+971501234567' }),
    ).toEqual({})
  })

  it('accepts a blank phone number (optional)', () => {
    expect(validateCustomerDraft({ fullName: 'Jane Renter', email: 'jane@example.com', phone: '' })).toEqual({})
  })

  it('flags every field on a totally empty draft', () => {
    const errors = validateCustomerDraft(EMPTY_CUSTOMER_DRAFT)
    expect(errors.fullName).toBeDefined()
    expect(errors.email).toBeDefined()
    expect(errors.phone).toBeUndefined() // blank phone is fine
  })

  it('rejects a malformed email', () => {
    expect(validateCustomerDraft({ fullName: 'Jane Renter', email: 'nope', phone: '' }).email).toBeDefined()
  })
})

describe('validateDriverDraft', () => {
  const start = '2026-09-10'
  const end = '2026-09-15'
  const valid = {
    fullName: 'John Driver',
    dateOfBirth: '1990-01-01',
    licenseNumber: 'DL123456',
    licenseCountry: 'UAE',
    licenseExpiry: '2027-01-01',
  }

  it('accepts a fully valid driver', () => {
    expect(validateDriverDraft(valid, start, end)).toEqual({})
  })

  it('flags every field on a totally empty draft', () => {
    const errors = validateDriverDraft(EMPTY_DRIVER_DRAFT, start, end)
    expect(errors.fullName).toBeDefined()
    expect(errors.licenseNumber).toBeDefined()
    expect(errors.licenseCountry).toBeDefined()
    expect(errors.dateOfBirth).toBeDefined()
    expect(errors.licenseExpiry).toBeDefined()
  })

  it('rejects an under-age driver', () => {
    expect(validateDriverDraft({ ...valid, dateOfBirth: '2015-01-01' }, start, end).dateOfBirth).toBeDefined()
  })

  it('rejects a license expiring before the rental ends', () => {
    expect(validateDriverDraft({ ...valid, licenseExpiry: '2026-09-11' }, start, end).licenseExpiry).toBeDefined()
  })
})
