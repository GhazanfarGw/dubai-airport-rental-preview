import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminAuth } from '@/features/admin/AdminAuthContext'
import { fetchAdminDirectory } from '@/features/admin/settings/adminSettingsApi'
import { AdminApiError } from '@/features/admin/adminApi'
import { AdminPageHeader } from '@/features/admin/shared/AdminPageHeader'
import { StateMessage, Spinner } from '@/features/shared/StateMessage'
import type { AdminProfile } from '@/types/domain'

type DirectoryState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; admins: AdminProfile[] }

export function AdminSettingsPage() {
  const { t } = useTranslation()
  const { adminProfile, session, signOut } = useAdminAuth()
  const [directory, setDirectory] = useState<DirectoryState>({ status: 'idle' })

  const isSuperAdmin = adminProfile?.role === 'super_admin'

  useEffect(() => {
    if (!isSuperAdmin) return
    let cancelled = false
    setDirectory({ status: 'loading' })
    fetchAdminDirectory()
      .then((admins) => {
        if (!cancelled) setDirectory({ status: 'loaded', admins })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setDirectory({ status: 'error', message: err instanceof AdminApiError || err instanceof Error ? err.message : t('admin.errorGeneric') })
      })
    return () => {
      cancelled = true
    }
  }, [isSuperAdmin, t])

  return (
    <div>
      <AdminPageHeader title={t('admin.nav.settings')} description={t('admin.settings.subtitle')} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-brand-navy/10 bg-white p-5">
          <h2 className="text-sm font-semibold text-brand-navy">{t('admin.settings.yourProfile')}</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">{t('admin.settings.name')}</dt>
              <dd className="font-medium text-brand-navy">{adminProfile?.full_name ?? '—'}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-brand-navy">{session?.user.email ?? '—'}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">{t('admin.settings.role')}</dt>
              <dd className="font-medium text-brand-navy">{adminProfile ? t(`admin.settings.roles.${adminProfile.role}`) : '—'}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-5 rounded-lg border border-brand-navy/20 px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-lavender/30"
          >
            {t('admin.nav.signOut')}
          </button>
        </div>

        {isSuperAdmin && (
          <div className="rounded-2xl border border-brand-navy/10 bg-white p-5">
            <h2 className="text-sm font-semibold text-brand-navy">{t('admin.settings.staffDirectory')}</h2>
            <p className="mt-1 text-xs text-slate-400">{t('admin.settings.staffDirectoryNote')}</p>

            {directory.status === 'loading' && (
              <div className="flex justify-center py-8">
                <Spinner className="h-6 w-6" />
              </div>
            )}

            {directory.status === 'error' && (
              <div className="mt-3">
                <StateMessage tone="error" title={t('admin.errorGeneric')} body={directory.message} />
              </div>
            )}

            {directory.status === 'loaded' && (
              <ul className="mt-3 divide-y divide-brand-navy/5">
                {directory.admins.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="font-medium text-brand-navy">{a.full_name}</span>
                    <span className="text-xs text-slate-400">{t(`admin.settings.roles.${a.role}`)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
