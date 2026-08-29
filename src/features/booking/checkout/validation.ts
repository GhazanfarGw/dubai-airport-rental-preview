/**
 * Client-side form validation for the Customer/Driver checkout steps.
 * UX ONLY — this exists purely to give the customer immediate feedback
 * as they type. It is NOT the authoritative check: the create-booking
 * Edge Function independently re-validates every one of these fields
 * server-side (supabase/functions/_shared/validation.ts) before a
 * booking can be created, so nothing here needs to be (or is) trusted.
 * The two are intentionally similar but kept as separate files — see
 * that module's own comment for why they aren't shared code.
 */
import type { CustomerDraft, DriverDraft } from '@/types/domain'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[0-9+()\-\s]{7,20}$/
const MIN_DRIVER_AGE_YEARS = 18

export type CustomerFieldErrors = Partial<Record<keyof CustomerDraft, string>>
export type DriverFieldErrors = Partial<Record<keyof DriverDraft, string>>

export function validateCustomerDraft(customer: CustomerDraft): CustomerFieldErrors {
  const errors: CustomerFieldErrors = {}
  if (customer.fullName.trim().length < 2) errors.fullName = "Please enter the customer's full name."
  if (!EMAIL_RE.test(customer.email.trim())) errors.email = 'Please enter a valid email address.'
  if (customer.phone.trim() && !PHONE_RE.test(customer.phone.trim())) {
    errors.phone = 'Please enter a valid phone number, or leave it blank.'
  }
  return errors
}

export function validateDriverDraft(
  driver: DriverDraft,
  rentalStartDate: string,
  rentalEndDate: string,
): DriverFieldErrors {
  const errors: DriverFieldErrors = {}

  if (driver.fullName.trim().length < 2) errors.fullName = "Please enter the driver's full name."
  if (driver.licenseNumber.trim().length < 3) errors.licenseNumber = 'Please enter a valid driving license number.'
  if (driver.licenseCountry.trim().length < 2) errors.licenseCountry = 'Please enter the country that issued the license.'

  if (!driver.dateOfBirth) {
    errors.dateOfBirth = 'Please enter a date of birth.'
  } else {
    const dob = new Date(driver.dateOfBirth + 'T00:00:00')
    const start = new Date(rentalStartDate + 'T00:00:00')
    const eighteenthBirthday = new Date(dob.getFullYear() + MIN_DRIVER_AGE_YEARS, dob.getMonth(), dob.getDate())
    if (Number.isNaN(dob.getTime())) errors.dateOfBirth = 'Please enter a valid date of birth.'
    else if (eighteenthBirthday > start) errors.dateOfBirth = 'The driver must be at least 18 years old at the start of the rental.'
  }

  if (!driver.licenseExpiry) {
    errors.licenseExpiry = 'Please enter the license expiry date.'
  } else {
    const expiry = new Date(driver.licenseExpiry + 'T00:00:00')
    const end = new Date(rentalEndDate + 'T00:00:00')
    if (Number.isNaN(expiry.getTime())) errors.licenseExpiry = 'Please enter a valid expiry date.'
    else if (expiry < end) errors.licenseExpiry = 'The license must still be valid through the end of the rental.'
  }

  return errors
}
