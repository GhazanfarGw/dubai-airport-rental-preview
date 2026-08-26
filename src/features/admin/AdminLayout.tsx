import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAdminAuth } from '@/features/admin/AdminAuthContext'
import { LanguageSwitcher } from '@/features/shared/LanguageSwitcher'
import { fetchPendingBookingsCount } from '@/features/admin/bookings/adminBookingsApi'

/** How often the sidebar re-checks the pending-bookings count for its workload badge. */
const PENDING_COUNT_POLL_MS = 60_000

const NAV_ITEMS = [
  { to: '/admin', key: 'dashboard', end: true },
  { to: '/admin/bookings', key: 'bookings', end: false },
  { to: '/admin/fleet', key: 'fleet', end: false },
  { to: '/admin/availability', key: 'availability', end: false },
  { to: '/admin/customers', key: 'customers', end: false },
  { to: '/admin/payments', key: 'payments', end: false },
  { to: '/admin/complaints', key: 'complaints', end: false },
  { to: '/admin/pricing', key: 'pricing', end: false },
  { to: '/admin/audit-log', key: 'auditLog', end: false },
  { to: '/admin/settings', key: 'settings', end: false },
] as const

export function AdminLayout() {
  const { t } = useTranslation()
  const { adminProfile, signOut } = useAdminAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    function load() {
      fetchPendingBookingsCount()
        .then((count) => {
          if (!cancelled) setPendingCount(count)
        })
        .catch(() => {
          // Non-critical — the badge just stays hidden if this fails.
        })
    }
    load()
    const interval = setInterval(load, PENDING_COUNT_POLL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  async function handleSignOut() {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-brand-lavender/20 text-brand-navy">
      {/* Sidebar — desktop */}
      <aside className="hidden w-60 shrink-0 flex-col border-e border-brand-navy/10 bg-white lg:flex">
        <SidebarContent adminName={adminProfile?.full_name ?? ''} onSignOut={handleSignOut} pendingCount={pendingCount} />
      </aside>

      {/* Sidebar — mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 start-0 flex w-64 flex-col bg-white shadow-xl">
            <SidebarContent
              adminName={adminProfile?.full_name ?? ''}
              onSignOut={handleSignOut}
              onNavigate={() => setMobileOpen(false)}
              pendingCount={pendingCount}
            />
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-brand-navy/10 bg-white px-4 sm:px-6">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand-navy lg:hidden"
            aria-label={t('admin.nav.toggleMenu')}
            onClick={() => setMobileOpen(true)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-brand-navy lg:hidden">{t('admin.nav.title')}</span>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SidebarContent({
  adminName,
  onSignOut,
  onNavigate,
  pendingCount,
}: {
  adminName: string
  onSignOut: () => void
  onNavigate?: () => void
  pendingCount: number | null
}) {
  const { t } = useTranslation()

  return (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-brand-navy/10 px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-xs font-bold text-white">
          BR
        </span>
        <div>
          <p className="text-sm font-semibold leading-tight text-brand-navy">{t('nav.brand')}</p>
          <p className="text-[11px] leading-tight text-slate-400">{t('admin.nav.title')}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              'flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ' +
              (isActive ? 'bg-brand-navy text-white' : 'text-slate-600 hover:bg-brand-lavender hover:text-brand-navy')
            }
          >
            <span>{t(`admin.nav.${item.key}`)}</span>
            {item.key === 'bookings' && <WorkloadBadge count={pendingCount} />}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-brand-navy/10 p-3">
        <p className="truncate px-2 text-xs text-slate-400">{adminName}</p>
        <button
          type="button"
          onClick={onSignOut}
          className="mt-1 w-full rounded-lg px-3 py-2 text-start text-sm font-medium text-slate-600 transition-colors hover:bg-brand-lavender hover:text-brand-navy"
        >
          {t('admin.nav.signOut')}
        </button>
      </div>
    </>
  )
}

/**
 * Workload indicator for bookings that have been created but not yet paid
 * for (`pending_payment`) — the thing an admin most needs to notice at a
 * glance. Hidden entirely at 0 so a quiet day doesn't add visual noise;
 * green for a light, easily-cleared queue; amber once it's built up enough
 * to want attention soon.
 */
function WorkloadBadge({ count }: { count: number | null }) {
  if (!count) return null
  const heavy = count >= 4
  return (
    <span
      className={
        'flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ' +
        (heavy ? 'bg-amber-400 text-amber-950' : 'bg-emerald-400 text-emerald-950')
      }
      title={heavy ? 'Multiple bookings awaiting payment' : 'Bookings awaiting payment'}
    >
      {count}
    </span>
  )
}
