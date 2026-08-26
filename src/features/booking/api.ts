import { supabase } from '@/lib/supabaseClient'
import type { Location, VehicleSearchResult, VehicleWithDetails } from '@/types/domain'

const VEHICLE_SELECT =
  '*, vehicle_categories(id, name, description), vehicle_images(id, storage_path, is_primary, sort_order), pricing(id, term, list_price, client_price, currency)'

export class BookingApiError extends Error {}

/** Dubai-only by construction — `locations` has no region/country column at all (see docs/ARCHITECTURE.md). */
export async function fetchLocations(): Promise<Location[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .order('type')
    .order('name')

  if (error) throw new BookingApiError(error.message)
  return data
}

/**
 * Two-step, RLS-safe availability search:
 *  1. `available_vehicles` (a SECURITY DEFINER function) checks the
 *     private `bookings` table server-side and returns only the ids of
 *     vehicles with no overlapping non-cancelled booking for this range.
 *  2. A normal, RLS-respecting select re-fetches the WHOLE customer-facing
 *     fleet (every vehicle with status = 'available' in the admin Fleet
 *     sense) with public category/image/pricing data joined in.
 *
 * Every result is returned, not just the free ones — a vehicle with an
 * overlapping booking for these specific dates is still included, tagged
 * `isAvailable: false`, so customers can see the whole fleet and browse a
 * "Reserved" car's details or try different dates instead of it silently
 * vanishing from the list. No availability logic runs in this file or in
 * any component — `available_vehicles` in the database is the only source
 * of truth for what's actually bookable.
 */
export async function searchVehiclesWithAvailability(
  startDate: string,
  endDate: string,
): Promise<VehicleSearchResult[]> {
  const { data: available, error: rpcError } = await supabase.rpc('available_vehicles', {
    p_start_date: startDate,
    p_end_date: endDate,
  })
  if (rpcError) throw new BookingApiError(rpcError.message)
  const availableIds = new Set((available ?? []).map((v) => v.id))

  const { data, error } = await supabase
    .from('vehicles')
    .select(VEHICLE_SELECT)
    .eq('status', 'available')
    .order('created_at', { ascending: false })

  if (error) throw new BookingApiError(error.message)
  return ((data ?? []) as unknown as VehicleWithDetails[]).map((v) => ({
    ...v,
    isAvailable: availableIds.has(v.id),
  }))
}

/**
 * A plain, read-only listing of vehicles for the homepage's Featured
 * Vehicles section — no date range, no availability RPC. Queries the same
 * already-public `vehicles`/`vehicle_categories`/`vehicle_images`/`pricing`
 * tables `fetchVehicleById` already reads (same RLS, same shape), just
 * without an id filter. This is not new backend functionality: no schema
 * change, no migration, no Edge Function — only a new client-side read.
 */
export async function fetchFeaturedVehicles(limit = 6): Promise<VehicleWithDetails[]> {
  const { data, error } = await supabase
    .from('vehicles')
    .select(VEHICLE_SELECT)
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new BookingApiError(error.message)
  return (data ?? []) as unknown as VehicleWithDetails[]
}

/**
 * All currently-available vehicles with no date-range filtering — the
 * Search page's default view before the customer has chosen pickup/
 * drop-off dates, so they can browse the fleet first instead of hitting a
 * "please choose dates" wall. Same public columns/RLS as
 * `fetchFeaturedVehicles`, just without the homepage's 6-car limit.
 */
export async function fetchAllAvailableVehicles(): Promise<VehicleWithDetails[]> {
  const { data, error } = await supabase
    .from('vehicles')
    .select(VEHICLE_SELECT)
    .eq('status', 'available')
    .order('created_at', { ascending: false })

  if (error) throw new BookingApiError(error.message)
  return (data ?? []) as unknown as VehicleWithDetails[]
}

export async function fetchVehicleById(id: string): Promise<VehicleWithDetails | null> {
  const { data, error } = await supabase
    .from('vehicles')
    .select(VEHICLE_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) throw new BookingApiError(error.message)
  return data as unknown as VehicleWithDetails | null
}

/** Used on the vehicle detail page to recheck a specific vehicle against the requested dates. */
export async function isVehicleAvailable(
  vehicleId: string,
  startDate: string,
  endDate: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc('available_vehicles', {
    p_start_date: startDate,
    p_end_date: endDate,
  })
  if (error) throw new BookingApiError(error.message)
  return (data ?? []).some((v) => v.id === vehicleId)
}
