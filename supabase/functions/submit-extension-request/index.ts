// Phase 7 (booking reassignment respec) — submit-extension-request Edge
// Function.
//
// The customer self-service "Extend Rental" entry point. Runs with the
// service-role key (never shipped to the browser) so it can call
// submit_extension_request_public() — that SQL function is revoked from
// anon/authenticated and granted only to service_role, same "guest
// mutation needs a service-role key" convention as create-booking. All the
// actual logic lives in ./logic.ts so it can be unit-tested; this file
// only wires up the HTTP/Deno plumbing.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'
import { handleSubmitExtensionRequest, type SubmitExtensionRequestBody } from './logic.ts'
import { ApiError } from '../_shared/errors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonResponse({ code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' }, 405)
  }

  let body: SubmitExtensionRequestBody
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
    const result = await handleSubmitExtensionRequest(body, supabaseAdmin)
    return jsonResponse(result, 200)
  } catch (err) {
    if (err instanceof ApiError) {
      return jsonResponse(
        { code: err.code, message: err.message, fieldErrors: err.fieldErrors },
        err.httpStatus,
      )
    }
    console.error('submit-extension-request unexpected error', err)
    return jsonResponse(
      { code: 'SERVER_ERROR', message: 'Something went wrong while submitting your request. Please try again.' },
      500,
    )
  }
})
