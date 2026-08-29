import { supabase } from '@/lib/supabaseClient'
import { AdminApiError } from '@/features/admin/adminApi'
import type { AdminComplaintWithDetails } from '@/types/domain'
import type { Database } from '@/types/database'

type ComplaintStatus = Database['public']['Tables']['complaints']['Row']['status']

const COMPLAINT_SELECT = '*, customers(*), bookings(*)'

export async function fetchComplaints(status: ComplaintStatus | 'all'): Promise<AdminComplaintWithDetails[]> {
  let query = supabase.from('complaints').select(COMPLAINT_SELECT).order('created_at', { ascending: false })
  if (status !== 'all') query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw new AdminApiError(error.message)
  return (data ?? []) as unknown as AdminComplaintWithDetails[]
}

export async function fetchComplaintById(id: string): Promise<AdminComplaintWithDetails | null> {
  const { data, error } = await supabase.from('complaints').select(COMPLAINT_SELECT).eq('id', id).maybeSingle()
  if (error) throw new AdminApiError(error.message)
  return data as unknown as AdminComplaintWithDetails | null
}

export interface ComplaintUpdate {
  status: ComplaintStatus
  internalNotes: string
  resolution: string
}

/**
 * Plain RLS-governed update — "admins manage complaints" already covers
 * this; the complaints_audit trigger logs any status change automatically.
 * resolved_at is stamped here (not by a trigger) because it only applies
 * on the transition INTO resolved/closed, which is simplest to express
 * where the intent is known rather than re-derived in SQL.
 */
export async function updateComplaint(id: string, update: ComplaintUpdate): Promise<void> {
  const isResolvedNow = update.status === 'resolved' || update.status === 'closed'
  const { error } = await supabase
    .from('complaints')
    .update({
      status: update.status,
      internal_notes: update.internalNotes || null,
      resolution: update.resolution || null,
      resolved_at: isResolvedNow ? new Date().toISOString() : null,
    })
    .eq('id', id)
  if (error) throw new AdminApiError(error.message)
}
