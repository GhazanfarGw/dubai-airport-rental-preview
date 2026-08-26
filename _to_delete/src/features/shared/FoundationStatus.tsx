import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type ConnectionState = 'checking' | 'connected' | 'error'

/**
 * Temporary Phase 0 landing screen. Its only job is to prove the
 * frontend, Tailwind, and the Supabase client are wired together
 * correctly. It gets replaced by the real customer journey in Phase 1+
 * (see docs/ARCHITECTURE.md for the planned route map).
 */
export function FoundationStatus() {
  const [state, setState] = useState<ConnectionState>('checking')
  const [message, setMessage] = useState('Checking Supabase connection…')

  useEffect(() => {
    let cancelled = false

    async function check() {
      const { error } = await supabase.from('vehicle_categories').select('id').limit(1)
      if (cancelled) return
      if (error) {
        setState('error')
        setMessage(error.message)
      } else {
        setState('connected')
        setMessage('Connected to Supabase. Foundation is ready for Phase 1.')
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center text-slate-100">
      <h1 className="text-2xl font-semibold tracking-tight">
        Dubai Airport Car Rental — Phase 0 Foundation
      </h1>
      <p className="max-w-md text-sm text-slate-400">
        Booking UI, admin dashboard, and payment flows are not built yet on
        purpose. This screen only confirms the project scaffold and
        Supabase connection are working.
      </p>
      <div
        className={
          'rounded-md border px-4 py-2 text-sm ' +
          (state === 'connected'
            ? 'border-emerald-700 bg-emerald-950 text-emerald-300'
            : state === 'error'
              ? 'border-red-700 bg-red-950 text-red-300'
              : 'border-slate-700 bg-slate-900 text-slate-300')
        }
      >
        {message}
      </div>
      {state === 'error' && (
        <p className="max-w-md text-xs text-slate-500">
          This is expected until .env.local is filled in with a real
          Supabase project's URL and anon key — see .env.example.
        </p>
      )}
    </main>
  )
}
