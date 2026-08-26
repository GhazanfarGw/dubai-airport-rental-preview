import type { Database } from '@/types/database'

type VehicleRow = Database['public']['Tables']['vehicles']['Row']
type CategoryRow = Database['public']['Tables']['vehicle_categories']['Row']
type ImageRow = Database['public']['Tables']['vehicle_images']['Row']
type PricingRow = Database['public']['Tables']['pricing']['Row']
type LocationRow = Database['public']['Tables']['locations']['Row']
type CustomerRow = Database['public']['Tables']['customers']['Row']
type DriverRow = Database['public']['Tables']['drivers']['Row']
type BookingRow = Database['public']['Tables']['bookings']['Row']
type BookingStatusHistoryRow = Database['public']['Tables']['booking_status_history']['Row']
type PaymentRow = Database['public']['Tables']['payments']['Row']
type ComplaintRow = Database['public']['Tables']['complaints']['Row']
type AuditLogRow = Database['public']['Tables']['audit_logs']['Row']
type AdminProfileRow = Database['public']['Tables']['admin_profiles']['Row']
type OperationalStatusRow = Database['public']['Views']['vehicle_operational_status']['Row']

/**
 * A vehicle enriched with its publicly-readable related data, shaped the
 * way our Supabase select-with-embeds queries return it. Only ever built
 * from tables/columns that are public per Phase 0 RLS — see
 * src/features/booking/api.ts.
 */
export interface VehicleWithDetails extends VehicleRow {
  vehicle_categories: CategoryRow | null
  vehicle_images: ImageRow[]
  pricing: PricingRow[]
}

/**
 * A vehicle returned from a dated search, additionally tagged with whether
 * it's actually free for the searched date range. `false` means it has an
 * overlapping booking for those specific dates — it still appears in
 * results (so the customer can see the whole fleet and try other dates)
 * but is shown as "Reserved" and can't be booked.
 */
export interface VehicleSearchResult extends VehicleWithDetails {
  isAvailable: boolean
}

export type Location = LocationRow

export interface SearchCriteria {
  startDate: string
  endDate: string
  pickupLocationId: string
  dropoffLocationId: string
}

export interface VehicleFilters {
  categoryId: string | null
  brand: string | null
  transmission: string | null
  /** Only meaningful once dates are chosen — see VehicleSearchResult. */
  availability: 'available' | 'reserved' | null
}

export type SortOption = 'price_asc' | 'price_desc'

export const EMPTY_FILTERS: VehicleFilters = {
  categoryId: null,
  brand: null,
  transmission: null,
  availability: null,
}

// ---------------------------------------------------------------------------
// Phase 2 — Booking & Checkout
// ---------------------------------------------------------------------------

/** What the Customer Details step collects. Matches the create_booking Edge Function's `customer` shape exactly. */
export interface CustomerDraft {
  fullName: string
  email: string
  phone: string
}

/** What the Driver Details step collects. The customer supplies their own driver — see docs/ARCHITECTURE.md. */
export interface DriverDraft {
  fullName: string
  dateOfBirth: string
  licenseNumber: string
  licenseCountry: string
  licenseExpiry: string
}

export const EMPTY_CUSTOMER_DRAFT: CustomerDraft = { fullName: '', email: '', phone: '' }
export const EMPTY_DRIVER_DRAFT: DriverDraft = {
  fullName: '',
  dateOfBirth: '',
  licenseNumber: '',
  licenseCountry: '',
  licenseExpiry: '',
}

/**
 * The in-progress checkout state for one vehicle, persisted to
 * sessionStorage (see useCheckoutDraft.ts) so it survives a refresh or
 * back/forward navigation across the multi-step flow without needing a
 * server-side session — this is a guest checkout, there is no auth
 * session to hang state off of.
 */
export interface CheckoutDraft {
  vehicleId: string
  criteria: SearchCriteria
  customer: CustomerDraft
  driver: DriverDraft
}

/** Result of a successful create-booking call — everything the Summary/Payment/Confirmation steps need, with no re-fetch required. */
export interface BookingCreationResult {
  bookingId: string
  bookingReference: string
  customerId: string
  driverId: string
  paymentId: string
  status: string
  term: string
  unitPrice: number
  totalPrice: number
  currency: string
  currencyCode?: string
  days: number
}

/** Everything the Confirmation page displays, assembled once at payment-confirmation time and stored in sessionStorage — see checkoutApi.ts. Guest checkout means there is no session to re-query this from later, so it is captured here rather than re-fetched. */
export interface BookingConfirmationSnapshot {
  bookingReference: string
  bookingId: string
  vehicleMake: string
  vehicleModel: string
  startDate: string
  endDate: string
  pickupLocationName: string
  dropoffLocationName: string
  customerName: string
  driverName: string
  totalPrice: number
  currency: string
  paymentStatus: string
  bookingStatus: string
}

// ---------------------------------------------------------------------------
// Phase 3 — Admin Dashboard & Operations
// ---------------------------------------------------------------------------

export type AdminProfile = AdminProfileRow

/** A booking enriched with the joined rows the admin list/detail views need — all reachable under the existing "admins manage X" RLS policies, no new privileged path. */
export interface AdminBookingWithDetails extends BookingRow {
  customers: CustomerRow | null
  vehicles: (VehicleRow & { vehicle_categories: CategoryRow | null }) | null
  pickup_location: LocationRow | null
  dropoff_location: LocationRow | null
  drivers: DriverRow[]
  payments: PaymentRow[]
}

export type AdminBookingStatusHistoryEntry = BookingStatusHistoryRow

export interface AdminCustomerWithStats extends CustomerRow {
  booking_count: number
  active_booking_count: number
}

export interface AdminVehicleWithDetails extends VehicleRow {
  vehicle_categories: CategoryRow | null
  vehicle_images: ImageRow[]
  pricing: PricingRow[]
  operational_status: OperationalStatusRow['operational_status']
}

export type AdminPaymentWithDetails = PaymentRow & {
  bookings: (BookingRow & { customers: CustomerRow | null }) | null
}

export type AdminComplaintWithDetails = ComplaintRow & {
  customers: CustomerRow | null
  bookings: BookingRow | null
}

export type AdminAuditLogEntry = AuditLogRow

// ---------------------------------------------------------------------------
// Phase 6 — Booking Engine & Reservation System (booking retrieval)
// ---------------------------------------------------------------------------

/**
 * Result of the guest-safe get_booking_by_reference() lookup — a small,
 * non-sensitive summary (no driver license/document fields, no phone),
 * deliberately the same shape of information already shown on
 * ConfirmationPage. See src/features/booking/lookupApi.ts.
 */
export interface BookingLookupResult {
  bookingId: string
  bookingReference: string
  bookingStatus: string
  startDate: string
  endDate: string
  totalPrice: number
  currency: string
  vehicleMake: string
  vehicleModel: string
  pickupLocationName: string
  dropoffLocationName: string
  customerName: string
  paymentStatus: string
  createdAt: string
}

/** Draft shape for the admin Add/Edit Vehicle form. Mirrors vehicles' writable columns exactly — see adminFleetApi.ts. */
export interface VehicleDraft {
  categoryId: string
  make: string
  model: string
  modelYear: string
  transmission: string
  seats: string
  plateNumber: string
  status: VehicleRow['status']
}

export const EMPTY_VEHICLE_DRAFT: VehicleDraft = {
  categoryId: '',
  make: '',
  model: '',
  modelYear: String(new Date().getFullYear()),
  transmission: 'automatic',
  seats: '5',
  plateNumber: '',
  status: 'available',
}

/** Draft shape for one pricing-ladder row in the admin Pricing page. */
export interface PricingDraft {
  id: string | null
  term: PricingRow['term']
  listPrice: string
  clientPrice: string
}
