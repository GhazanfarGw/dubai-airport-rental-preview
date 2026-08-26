import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { NavBar } from '@/features/shared/NavBar'
import { Footer } from '@/features/shared/Footer'
import { prefersReducedMotion } from '@/lib/motion'

export function Layout() {
  const location = useLocation()

  // Smoothly scrolls to an in-page anchor (e.g. the header's About/Services
  // links to #why-choose / #how-it-works) whenever the URL hash changes,
  // including navigation from a different page — react-router doesn't do
  // this automatically. Each target section sets `scroll-mt-*` so it isn't
  // hidden behind the sticky header.
  useEffect(() => {
    if (!location.hash) return
    const el = document.getElementById(location.hash.slice(1))
    el?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  }, [location])

  return (
    <div className="flex min-h-screen flex-col bg-white text-brand-navy">
      <NavBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
