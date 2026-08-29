import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchLocations } from '@/features/booking/api'
import type { Location } from '@/types/domain'

const PREVIEW_LIMIT = 10

/**
 * Homepage teaser for the full /locations page — a dark band showing a
 * handful of real, active pickup/drop-off points (same fetchLocations()
 * the search widget uses, so this can't drift out of sync with what's
 * actually bookable) plus a "View all locations" button. Honest to
 * Bliss Rent's actual model (Dubai-only, airport pickup + city drop-off)
 * rather than a multi-emirate door-to-door delivery claim.
 */
export function LocationsPreviewSection() {
  const { t } = useTranslation()
  const [locations, setLocations] = useState<Location[] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchLocations()
      .then((data) => {
        if (!cancelled) setLocations(data)
      })
      .catch(() => {
        if (!cancelled) setLocations([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const preview = (locations ?? []).slice(0, PREVIEW_LIMIT)

  return (
    <section className="bg-brand-navy-dark">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold-light">
          {t('home.locationsPreview.eyebrow')}
        </p>
        <h2 className="mt-2 max-w-2xl text-2xl font-bold text-white sm:text-3xl">
          <HighlightDubai text={t('home.locationsPreview.title')} />
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">{t('home.locationsPreview.subtitle')}</p>

        {locations === null && <p className="mt-8 text-sm text-slate-500">{t('home.locationsPreview.loading')}</p>}

        {locations !== null && preview.length === 0 && (
          <p className="mt-8 max-w-xl text-sm text-slate-400">{t('home.locationsPreview.emptyBody')}</p>
        )}

        {preview.length > 0 && (
          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {preview.map((loc) => (
              <div
                key={loc.id}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200"
              >
                <PinIcon className="h-4 w-4 shrink-0 text-brand-gold-light" />
                <span className="truncate">{loc.name}</span>
              </div>
            ))}
          </div>
        )}

        <Link
          to="/locations"
          className="mt-10 inline-flex items-center gap-2 rounded-lg border border-brand-gold px-5 py-2.5 text-sm font-semibold text-brand-gold-light transition-colors hover:bg-brand-gold hover:text-brand-navy-dark"
        >
          {t('home.locationsPreview.viewAll')}
          <ArrowIcon className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    </section>
  )
}

/** Highlights the word "Dubai" / "دبي" in gold within an otherwise white heading — the one proper noun worth the visual accent, in either language. */
function HighlightDubai({ text }: { text: string }) {
  const parts = text.split(/(Dubai|دبي)/)
  return (
    <>
      {parts.map((part, i) =>
        part === 'Dubai' || part === 'دبي' ? (
          <span key={i} className="text-brand-gold">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden="true">
      <path d="M12 21s-6.5-6.06-6.5-11A6.5 6.5 0 0 1 18.5 10c0 4.94-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  )
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
