import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface FaqCategory { heading: string; items: { question: string; answer: string }[] }

/** Homepage FAQ preview reuses the canonical translated FAQ content. */
export function HomeFaqSection() {
  const { t } = useTranslation()
  const categories = t('pages.faqs.categories', { returnObjects: true }) as FaqCategory[]
  const items = categories.flatMap((category) => category.items).slice(0, 4)
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="bg-brand-lavender/25">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold-dark">{t('home.faq.eyebrow')}</p>
            <h2 className="mt-2 text-2xl font-bold text-brand-navy sm:text-3xl">{t('home.faq.title')}</h2>
            <p className="mt-2 text-sm text-slate-600">{t('home.faq.subtitle')}</p>
          </div>
          <Link to="/faqs" className="text-sm font-semibold text-brand-navy underline-offset-4 hover:underline">{t('home.faq.viewAll')}</Link>
        </div>
        <div className="mt-8 divide-y divide-brand-navy/10 rounded-2xl border border-brand-navy/10 bg-white">
          {items.map((item, index) => {
            const expanded = open === index
            return <div key={item.question}><button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : index)} className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-start focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-gold"><span className="text-sm font-medium text-brand-navy">{item.question}</span><span className="text-xl text-brand-gold" aria-hidden="true">{expanded ? '−' : '+'}</span></button>{expanded && <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">{item.answer}</p>}</div>
          })}
        </div>
      </div>
    </section>
  )
}