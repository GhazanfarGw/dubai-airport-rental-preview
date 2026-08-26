import { supabase } from '@/lib/supabaseClient'
import { AdminApiError } from '@/features/admin/adminApi'
import type { AdminProfile } from '@/types/domain'

/**
 * Read-only staff directory — "admins read all admin profiles" (Phase 0
 * RLS) already allows this for any signed-in admin; there is no
 * super_admin-only DB gate, so the UI is what restricts this list to
 * super_admin, per the spec ("no creation UI — provisioning stays a
 * manual SQL step", see docs/SETUP.md).
 */
export async function fetchAdminDirectory(): Promise<AdminProfile[]> {
  const { data, error } = await supabase.from('admin_profiles').select('*').order('full_name')
  if (error) throw new AdminApiError(error.message)
  return data ?? []
}
