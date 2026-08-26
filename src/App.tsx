import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/features/shared/Layout'
import { HomePage } from '@/features/booking/HomePage'
import { SearchResultsPage } from '@/features/booking/SearchResultsPage'
import { VehicleDetailPage } from '@/features/booking/VehicleDetailPage'
import { CustomerDetailsPage } from '@/features/booking/checkout/CustomerDetailsPage'
import { DriverDetailsPage } from '@/features/booking/checkout/DriverDetailsPage'
import { BookingSummaryPage } from '@/features/booking/checkout/BookingSummaryPage'
import { PaymentPage } from '@/features/booking/checkout/PaymentPage'
import { ConfirmationPage } from '@/features/booking/checkout/ConfirmationPage'
import { ManageBookingPage } from '@/features/booking/ManageBookingPage'
import { AdminAuthProvider } from '@/features/admin/AdminAuthContext'
import { AdminRoute } from '@/features/admin/AdminRoute'
import { AdminLoginPage } from '@/features/admin/AdminLoginPage'
import { AdminLayout } from '@/features/admin/AdminLayout'
import { DashboardPage } from '@/features/admin/dashboard/DashboardPage'
import { BookingsListPage } from '@/features/admin/bookings/BookingsListPage'
import { BookingDetailPage } from '@/features/admin/bookings/BookingDetailPage'
import { FleetListPage } from '@/features/admin/fleet/FleetListPage'
import { VehicleFormPage } from '@/features/admin/fleet/VehicleFormPage'
import { AvailabilityCalendarPage } from '@/features/admin/availability/AvailabilityCalendarPage'
import { CustomersListPage } from '@/features/admin/customers/CustomersListPage'
import { CustomerDetailPage } from '@/features/admin/customers/CustomerDetailPage'
import { PaymentsListPage } from '@/features/admin/payments/PaymentsListPage'
import { ComplaintsListPage } from '@/features/admin/complaints/ComplaintsListPage'
import { ComplaintDetailPage } from '@/features/admin/complaints/ComplaintDetailPage'
import { PricingManagementPage } from '@/features/admin/pricing/PricingManagementPage'
import { AuditLogPage } from '@/features/admin/auditlog/AuditLogPage'
import { AdminSettingsPage } from '@/features/admin/settings/AdminSettingsPage'

/**
 * Phase 3 — Admin Dashboard & Operations, built on Phase 0's admin_profiles
 * / is_admin() / RLS foundation and Phase 1–2's booking, pricing, and
 * availability logic (all reused, none duplicated — see
 * supabase/migrations/20260827000000_phase3_admin_dashboard.sql).
 * AdminAuthProvider wraps the whole app (cheap: it only checks the
 * session/profile once) so /admin/login can also read auth state; every
 * other /admin/* route is wrapped in AdminRoute.
 *
 * Still out of scope, deliberately: WhatsApp Business API integration,
 * production deployment, advanced analytics, automated marketing, other
 * emirates, and new business features — those are later phases.
 *
 * Phase 6 — Booking Engine & Reservation System adds exactly one route,
 * /manage-booking (ManageBookingPage): a guest-safe "check my booking"
 * lookup by reference + email, the one genuine gap the Phase 6 audit
 * found (see supabase/migrations/20260829000000_phase6_booking_lookup.sql).
 * Every other Phase 6 in-scope item already existed from Phases 0–5 and
 * is reused unchanged.
 */
function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
            <Route path="/checkout/:id/customer" element={<CustomerDetailsPage />} />
            <Route path="/checkout/:id/driver" element={<DriverDetailsPage />} />
            <Route path="/checkout/:id/summary" element={<BookingSummaryPage />} />
            <Route path="/checkout/:id/payment/:bookingId" element={<PaymentPage />} />
            <Route path="/checkout/:id/confirmation/:bookingId" element={<ConfirmationPage />} />
            <Route path="/manage-booking" element={<ManageBookingPage />} />
          </Route>

          <Route path="/admin/login" element={<AdminLoginPage />} />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="bookings" element={<BookingsListPage />} />
            <Route path="bookings/:id" element={<BookingDetailPage />} />
            <Route path="fleet" element={<FleetListPage />} />
            <Route path="fleet/new" element={<VehicleFormPage />} />
            <Route path="fleet/:id" element={<VehicleFormPage />} />
            <Route path="availability" element={<AvailabilityCalendarPage />} />
            <Route path="customers" element={<CustomersListPage />} />
            <Route path="customers/:id" element={<CustomerDetailPage />} />
            <Route path="payments" element={<PaymentsListPage />} />
            <Route path="complaints" element={<ComplaintsListPage />} />
            <Route path="complaints/:id" element={<ComplaintDetailPage />} />
            <Route path="pricing" element={<PricingManagementPage />} />
            <Route path="audit-log" element={<AuditLogPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  )
}

export default App
