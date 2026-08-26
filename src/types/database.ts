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

export interface Database {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          id: string
          full_name: string
          role: AdminRole
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: AdminRole
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
    }
  }
}
