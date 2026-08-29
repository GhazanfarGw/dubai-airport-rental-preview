import { useTranslation } from 'react-i18next'

interface LegalSection {
  heading: string
  paragraphs?: string[]
  list?: string[]
}

interface LegalPageProps {
  title: string
  updated: string
  draftNotice: string
  intro?: string
  sections: LegalSection[]
}

/**
 * Shared renderer for the three draft legal pages (Privacy Policy, Cookie
 * Policy, Booking Terms & Conditions). All three are standard,
 * plain-language starting points — not legal advice — and carry bracketed
 * placeholders (e.g. "[__]") for business-specific numbers the owner still
 * needs to supply. The amber "DRAFT" banner is intentionally the same
 * component on all three so none of them can quietly lose it during a
 * future edit.
 */
export function LegalPage({ title, updated, draftNotice, intro, sections }: LegalPageProps) {
  const { t } = useTranslation()
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{updated}</p>

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
        <p className="font-semibold">{t('pages.draftBannerTitle')}</p>
        <p className="mt-1">{draftNotice}</p>
      </div>

      {intro && <p className="mt-6 text-sm leading-relaxed text-slate-700">{intro}</p>}

      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-base font-semibold text-brand-navy">{section.heading}</h2>
            {section.paragraphs?.map((p, i) => (
              <p key={i} className="mt-2 text-sm leading-relaxed text-slate-700">
                {p}
              </p>
            ))}
            {section.list && (
              <ul className="mt-2 list-disc space-y-1.5 ps-5 text-sm leading-relaxed text-slate-700">
                {section.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
