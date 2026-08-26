// Phase 2 — confirm-payment Edge Function.
//
// Resolves a pending payment to paid/failed and, on success, advances
// the booking to 'confirmed'. TEST ONLY payment provider — see
// _shared/testPaymentProvider.ts. Not reachable from the browser as a
// raw RPC (revoked from anon/authenticated) — this function, holding the
// service-role key, is the only caller.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'
import { handleConfirmPayment, type ConfirmPaymentRequestBody } from './logic.ts'
import { ApiError } from '../_shared/errors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonResponse({ code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' }, 405)
  }

  let body: ConfirmPaymentRequestBody
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ code: 'VALIDATION_ERROR', message: 'Request body must be JSON.' }, 400)
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  try {
    const result = await handleConfirmPayment(body, supabaseAdmin)
    return jsonResponse(result, 200)
  } catch (err) {
    if (err instanceof ApiError) {
      return jsonResponse(
        { code: err.code, message: err.message, fieldErrors: err.fieldErrors },
        err.httpStatus,
      )
    }
    console.error('confirm-payment unexpected error', err)
    return jsonResponse(
      { code: 'SERVER_ERROR', message: 'Something went wrong while confirming payment. Please try again.' },
      500,
    )
  }
})
