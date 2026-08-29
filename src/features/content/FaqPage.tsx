import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface FaqItem {
  question: string
  answer: string
}

interface FaqCategory {
  heading: string
  items: FaqItem[]
}

/**
 * Accordion FAQ page. Every answer restates a fact already established
 * elsewhere in the app (18+ driver age from checkout validation, self-drive
 * only, Dubai-only coverage, guest checkout, rental terms) — nothing here
 * invents a policy; questions about a still-placeholder rule (mileage,
 * fuel, cancellation) point to the Booking Terms page instead of guessing
 * a number.
 */
export function FaqPage() {
  const { t } = useTranslation()
  const categories = t('pages.faqs.categories', { returnObjects: true }) as FaqCategory[]
  const [openKey, setOpenKey] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">{t('pages.faqs.title')}</h1>
      <p className="mt-2 text-sm text-slate-600">{t('pages.faqs.subtitle')}</p>

      <div className="mt-8 space-y-8">
        {categories.map((category) => (
          <section key={category.heading}>
            <h2 className="text-base font-semibold text-brand-navy">{category.heading}</h2>
            <div className="mt-3 divide-y divide-brand-navy/10 rounded-2xl border border-brand-navy/10 bg-white">
              {category.items.map((item) => {
                const key = `${category.heading}__${item.question}`
                const isOpen = openKey === key
                return (
                  <div key={key}>
                    <button
                      type="button"
                      onClick={() => setOpenKey(isOpen ? null : key)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left rtl:text-right"
                    >
                      <span className="text-sm font-medium text-brand-navy">{item.question}</span>
                      <ChevronIcon className={`h-4 w-4 shrink-0 text-brand-gold-dark transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && <p className="px-5 pb-4 text-sm leading-relaxed text-slate-600">{item.answer}</p>}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
