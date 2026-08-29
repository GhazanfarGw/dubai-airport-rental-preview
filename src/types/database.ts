/**
 * Hand-written placeholder for the Supabase-generated database types.
 *
 * Once this project is linked to a real Supabase project, replace this
 * file by running:
 *
 *   supabase gen types typescript --linked > src/types/database.ts
 *
 * Until then, this is kept in sync BY HAND with
 * supabase/migrations/20260824000000_phase0_foundation.sql — if you add a
 * column there, add it here too.
 */

export type AdminRole = 'super_admin' | 'staff'
export type VehicleStatus = 'available' | 'maintenance' | 'retired'
export type PricingTerm = 'daily' | 'weekly' | 'monthly' | '3_month'
export type BookingStatus = 'pending_payment' | 'confirmed' | 'active' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type LocationType = 'airport' | 'city'
export type ExtensionStatus = 'requested' | 'pending' | 'approved' | 'rejected' | 'conflict_unresolved'
export type ExtensionPricingPolicy = 'original_rate' | 'current_rate' | 'custom_rate'
export type ExtensionPenaltyPolicy = 'fixed_fee' | 'per_day' | 'percentage'
export type ExtensionSource = 'admin' | 'customer'
export type NotificationType = 'vehicle_reassigned' | 'extension_approved' | 'extension_rejected' | 'extension_conflict_pending_review'
export type NotificationDeliveryStatus = 'pending_delivery' | 'sent' | 'failed'

export interface Database {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          id: string
          full_name: string
          role: AdminRole
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: AdminRole
          is_active?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['admin_profiles']['Insert']>
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          auth_user_id: string | null
          full_name: string
          email: string
          phone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          auth_user_id?: string | null
          full_name: string
          email: string
          phone?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
        Relationships: []
      }
      drivers: {
        Row: {
          id: string
          booking_id: string
          full_name: string
          date_of_birth: string
          license_number: string
          license_country: string
          license_expiry: string
          license_document_path: string | null
          id_document_path: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          full_name: string
          date_of_birth: string
          license_number: string
          license_country: string
          license_expiry: string
          license_document_path?: string | null
          id_document_path?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['drivers']['Insert']>
        Relationships: []
      }
      vehicle_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['vehicle_categories']['Insert']>
        Relationships: []
      }
      vehicles: {
        Row: {
          id: string
          category_id: string
          make: string
          model: string
          model_year: number
          transmission: string
          seats: number
          plate_number: string
          status: VehicleStatus
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          make: string
          model: string
          model_year: number
          transmission?: string
          seats?: number
          plate_number: string
          status?: VehicleStatus
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['vehicles']['Insert']>
        Relationships: []
      }
      vehicle_images: {
        Row: {
          id: string
          vehicle_id: string
          storage_path: string
          is_primary: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          storage_path: string
          is_primary?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['vehicle_images']['Insert']>
        Relationships: []
      }
      pricing: {
        Row: {
          id: string
          vehicle_id: string
          term: PricingTerm
          list_price: number
          client_price: number
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          term: PricingTerm
          list_price: number
          client_price: number
          currency?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['pricing']['Insert']>
        Relationships: []
      }
      locations: {
        Row: {
          id: string
          name: string
          type: LocationType
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: LocationType
          is_active?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['locations']['Insert']>
        Relationships: []
      }
      bookings: {
        Row: {
          id: string
          customer_id: string
          vehicle_id: string
          pickup_location_id: string
          dropoff_location_id: string
          term: PricingTerm
          start_date: string
          end_date: string
          status: BookingStatus
          total_price: number
          currency: string
          booking_channel: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          vehicle_id: string
          pickup_location_id: string
          dropoff_location_id: string
          term: PricingTerm
          start_date: string
          end_date: string
          status?: BookingStatus
          total_price: number
          currency?: string
          booking_channel?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
        Relationships: []
      }
      booking_status_history: {
        Row: {
          id: string
          booking_id: string
          old_status: BookingStatus | null
          new_status: BookingStatus
          changed_by: string | null
          changed_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          old_status?: BookingStatus | null
          new_status: BookingStatus
          changed_by?: string | null
          changed_at?: string
        }
        Update: Partial<Database['public']['Tables']['booking_status_history']['Insert']>
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          amount: number
          currency: string
          status: PaymentStatus
          provider: string
          provider_reference: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          amount: number
          currency?: string
          status?: PaymentStatus
          provider: string
          provider_reference?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
        Relationships: []
      }
      complaints: {
        Row: {
          id: string
          booking_id: string | null
          customer_id: string
          subject: string
          description: string
          status: ComplaintStatus
          created_at: string
          resolved_at: string | null
          internal_notes: string | null
          resolution: string | null
        }
        Insert: {
          id?: string
          booking_id?: string | null
          customer_id: string
          subject: string
          description: string
          status?: ComplaintStatus
          created_at?: string
          resolved_at?: string | null
          internal_notes?: string | null
          resolution?: string | null
        }
        Update: Partial<Database['public']['Tables']['complaints']['Insert']>
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          entity_table: string
          entity_id: string | null
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          action: string
          entity_table: string
          entity_id?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
        Relationships: []
      }
      extension_pricing_settings: {
        Row: {
          id: number
          policy: ExtensionPricingPolicy | null
          custom_daily_rate: number | null
          custom_currency: string
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: number
          policy?: ExtensionPricingPolicy | null
          custom_daily_rate?: number | null
          custom_currency?: string
          updated_by?: string | null
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['extension_pricing_settings']['Insert']>
        Relationships: []
      }
      booking_extensions: {
        Row: {
          id: string
          booking_id: string
          vehicle_id: string
          previous_return_date: string
          requested_return_date: string
          extension_days: number
          availability_confirmed: boolean | null
          pricing_policy_used: ExtensionPricingPolicy | null
          amount: number | null
          currency: string | null
          payment_method: 'cash' | 'online' | null
          payment_status: PaymentStatus | null
          status: ExtensionStatus
          rejection_reason: string | null
          support_confirmed_by: string | null
          support_confirmation_note: string | null
          processed_by: string | null
          payment_confirmed_by: string | null
          source: ExtensionSource
          is_late: boolean
          penalty_amount: number | null
          penalty_policy_used: ExtensionPenaltyPolicy | null
          penalty_rate_used: number | null
          conflict_booking_id: string | null
          replacement_vehicle_id: string | null
          booking_reference_verified: string | null
          vehicle_number_verified: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          vehicle_id: string
          previous_return_date: string
          requested_return_date: string
          extension_days: number
          availability_confirmed?: boolean | null
          pricing_policy_used?: ExtensionPricingPolicy | null
          amount?: number | null
          currency?: string | null
          payment_method?: 'cash' | 'online' | null
          payment_status?: PaymentStatus | null
          status?: ExtensionStatus
          rejection_reason?: string | null
          support_confirmed_by?: string | null
          support_confirmation_note?: string | null
          processed_by?: string | null
          payment_confirmed_by?: string | null
          source?: ExtensionSource
          is_late?: boolean
          penalty_amount?: number | null
          penalty_policy_used?: ExtensionPenaltyPolicy | null
          penalty_rate_used?: number | null
          conflict_booking_id?: string | null
          replacement_vehicle_id?: string | null
          booking_reference_verified?: string | null
          vehicle_number_verified?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['booking_extensions']['Insert']>
        Relationships: []
      }
      extension_penalty_settings: {
        Row: {
          id: number
          policy: ExtensionPenaltyPolicy | null
          fixed_fee_amount: number | null
          per_day_amount: number | null
          percentage_rate: number | null
          currency: string
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: number
          policy?: ExtensionPenaltyPolicy | null
          fixed_fee_amount?: number | null
          per_day_amount?: number | null
          percentage_rate?: number | null
          currency?: string
          updated_by?: string | null
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['extension_penalty_settings']['Insert']>
        Relationships: []
      }
      vehicle_reassignments: {
        Row: {
          id: string
          booking_id: string
          triggering_extension_id: string | null
          original_vehicle_id: string
          replacement_vehicle_id: string
          reason: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          triggering_extension_id?: string | null
          original_vehicle_id: string
          replacement_vehicle_id: string
          reason: string
          created_by: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['vehicle_reassignments']['Insert']>
        Relationships: []
      }
      booking_notifications: {
        Row: {
          id: string
          booking_id: string
          notification_type: NotificationType
          status: NotificationDeliveryStatus
          payload: Record<string, unknown>
          created_at: string
          sent_at: string | null
        }
        Insert: {
          id?: string
          booking_id: string
          notification_type: NotificationType
          status?: NotificationDeliveryStatus
          payload: Record<string, unknown>
          created_at?: string
          sent_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['booking_notifications']['Insert']>
        Relationships: []
      }
    }
    Views: {
      /**
       * Phase 3 admin dashboard only. security_invoker view — enforces RLS
       * as the querying admin. Classifies each vehicle's CURRENT
       * operational state; NOT a second availability engine (that remains
       * exclusively available_vehicles()). See
       * supabase/migrations/20260827000000_phase3_admin_dashboard.sql.
       */
      vehicle_operational_status: {
        Row: {
          vehicle_id: string
          vehicle_status: VehicleStatus
          operational_status: 'available' | 'reserved' | 'rented' | 'maintenance' | 'unavailable'
        }
        Relationships: []
      }
    }
    Functions: {
      /**
       * Phase 1 search. SECURITY DEFINER — see
       * supabase/migrations/20260825000000_phase1_vehicle_availability.sql.
       * Returns vehicles with no overlapping non-cancelled booking for the
       * given date range. Never returns booking/customer data.
       */
      available_vehicles: {
        Args: { p_start_date: string; p_end_date: string }
        Returns: Database['public']['Tables']['vehicles']['Row'][]
      }
      /**
       * Phase 6 booking retrieval. SECURITY DEFINER — see
       * supabase/migrations/20260829000000_phase6_booking_lookup.sql.
       * Guest-safe: reference + email must both match or zero rows come
       * back. Never returns driver license/document fields or phone.
       */
      get_booking_by_reference: {
        Args: { p_booking_reference: string; p_email: string }
        Returns: {
          booking_id: string
          booking_reference: string
          booking_status: Database['public']['Tables']['bookings']['Row']['status']
          start_date: string
          end_date: string
          total_price: number
          currency: string
          vehicle_make: string
          vehicle_model: string
          pickup_location_name: string
          dropoff_location_name: string
          customer_name: string
          payment_status: Database['public']['Tables']['payments']['Row']['status']
          created_at: string
        }[]
      }
      /**
       * Manage Booking single-field lookup — reference OR vehicle plate,
       * either one alone is sufficient. See the migration's own header for
       * the deliberate, owner-approved trade-off versus every other guest
       * lookup in this project (which pairs two values together).
       */
      lookup_booking_for_customer: {
        Args: { p_query: string }
        Returns: {
          booking_id: string
          booking_reference: string
          booking_status: Database['public']['Tables']['bookings']['Row']['status']
          start_date: string
          end_date: string
          total_price: number
          currency: string
          vehicle_make: string
          vehicle_model: string
          vehicle_plate: string
          pickup_location_name: string
          dropoff_location_name: string
          customer_name: string
          payment_status: Database['public']['Tables']['payments']['Row']['status']
          created_at: string
        }[]
      }
      /**
       * TEMPORARY testing-phase helper. SECURITY DEFINER — see
       * supabase/migrations/20260830000000_admin_reset_test_data.sql.
       * super_admin only (checked inside the function). Wipes all
       * bookings/payments/complaints/vehicles/customers/audit_logs and
       * returns the row counts that were deleted. Remove this entry along
       * with the migration and its UI once testing is done.
       */
      admin_reset_all_test_data: {
        Args: Record<string, never>
        Returns: {
          payments: number
          complaints: number
          bookings: number
          drivers: number
          vehicles: number
          customers: number
          audit_logs: number
        }
      }
      /**
       * Phase 7. Read-only preview only — see
       * supabase/migrations/20260902000000_phase7_rental_extensions.sql.
       * is_admin() checked inside. Checks the exact vehicle_id, never
       * model/category. The real, race-safe guarantee is still the
       * bookings_no_overlap exclusion constraint, re-applied inside
       * request_booking_extension/confirm_booking_extension_payment.
       */
      check_vehicle_availability_for_extension: {
        Args: { p_booking_id: string; p_requested_return_date: string }
        Returns: boolean
      }
      /**
       * Phase 7 (booking reassignment respec). SECURITY DEFINER,
       * is_admin() checked inside. Two modes: p_existing_extension_id NULL
       * inserts a new admin/WhatsApp-channel row and processes it
       * immediately; supplied, it instead reviews an existing
       * customer-submitted 'requested' row — the SAME engine either way.
       * On a conflict with a future booking, attempts reassignment via
       * resolve_extension_conflict() before falling back to
       * conflict_unresolved. See
       * supabase/migrations/20260903000000_phase7_booking_reassignment.sql.
       */
      request_booking_extension: {
        Args: {
          p_booking_id: string
          p_requested_return_date: string
          p_support_confirmed_by: string | null
          p_support_confirmation_note: string | null
          p_payment_method: 'cash' | 'online'
          p_amount: number
          p_currency: string
          p_pricing_policy_used: ExtensionPricingPolicy
          p_existing_extension_id?: string | null
          p_penalty_amount?: number | null
          p_penalty_policy_used?: ExtensionPenaltyPolicy | null
          p_penalty_rate_used?: number | null
        }
        Returns: {
          extension_id: string
          status: ExtensionStatus
          payment_status: PaymentStatus | null
          rejection_reason: string | null
          is_late: boolean
          penalty_amount: number | null
          conflict_booking_id: string | null
          replacement_vehicle_id: string | null
        }[]
      }
      /**
       * Phase 7. Second step for an ONLINE extension only. Idempotent,
       * same convention as Phase 2's confirm_payment. Now also runs
       * resolve_extension_conflict() at the moment payment succeeds.
       */
      confirm_booking_extension_payment: {
        Args: { p_extension_id: string; p_outcome: 'paid' | 'failed'; p_reference: string | null }
        Returns: {
          extension_id: string
          status: ExtensionStatus
          payment_status: PaymentStatus
        }[]
      }
      /**
       * Phase 7 (booking reassignment respec). Explicit admin rejection
       * for a requested/conflict_unresolved/pending extension.
       */
      reject_extension_request: {
        Args: { p_extension_id: string; p_rejection_reason: string }
        Returns: { extension_id: string; status: ExtensionStatus }[]
      }
      /**
       * Phase 7 (booking reassignment respec). Guest-safe verification for
       * the self-service Extend Rental flow — zero rows on ANY mismatch
       * between the booking reference and the vehicle number, same
       * indistinguishable-failure shape as get_booking_by_reference.
       */
      verify_booking_for_extension: {
        Args: { p_booking_reference: string; p_vehicle_number: string }
        Returns: {
          booking_id: string
          booking_reference: string
          vehicle_make: string
          vehicle_model: string
          vehicle_plate: string
          current_return_date: string
          booking_status: Database['public']['Tables']['bookings']['Row']['status']
        }[]
      }
    }
  }
}
