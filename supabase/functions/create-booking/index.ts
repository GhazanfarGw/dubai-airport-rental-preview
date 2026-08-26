// Phase 2 — create-booking Edge Function.
//
// This is the ONLY place a booking can be created. It runs with the
// service-role key (never shipped to the browser) so it can write
// customers/bookings/drivers/payments for a guest checkout — see the
// migration comment in
// supabase/migrations/20260826000000_phase2_booking_checkout.sql for why
// that's necessary. All the actual logic lives in ./logic.ts so it can
// be unit-tested; this file only wires up the HTTP/Deno plumbing.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'
import { handleCreateBooking, type CreateBookingRequestBody } from './logic.ts'
import { ApiError } from '../_shared/errors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonResponse({ code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' }, 405)
  }

  let body: CreateBookingRequestBody
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ code: 'VALIDATION_ERROR', message: 'Request body must be JSON.' }, 400)
  }

  // Server-side only client, using the service-role key. This is what
  // lets create_booking()/confirm_payment() be reachable at all — they
  // are explicitly revoked from anon/authenticated in the migration.
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  try {
    const result = await handleCreateBooking(body, supabaseAdmin)
    return jsonResponse(result, 200)
  } catch (err) {
    if (err instanceof ApiError) {
      return jsonResponse(
        { code: err.code, message: err.message, fieldErrors: err.fieldErrors },
        err.httpStatus,
      )
    }
    console.error('create-booking unexpected error', err)
    return jsonResponse(
      { code: 'SERVER_ERROR', message: 'Something went wrong while processing your booking. Please try again.' },
      500,
    )
  }
})
