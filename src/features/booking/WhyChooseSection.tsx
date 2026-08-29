import { useTranslation } from 'react-i18next'

interface WhyChooseItem {
  title: string
  body: string
}

/**
 * Real business advantages only — easy online booking, Dubai focus,
 * flexible rental periods, customer-provided driver, customer support.
 * No invented awards, fleet-size claims, or statistics (see home.whyChoose
 * in en.ts/ar.ts). Doubles as the header's "About" anchor target.
 */
export function WhyChooseSection() {
  const { t } = useTranslation()
  const items = t('home.whyChoose.items', { returnObjects: true }) as WhyChooseItem[]

  return (
    <section id="why-choose" className="scroll-mt-20 bg-brand-lavender/30">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-brand-navy sm:text-3xl">{t('home.whyChoose.title')}</h2>
          <p className="mt-2 text-sm text-slate-600">{t('home.whyChoose.subtitle')}</p>
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <div key={item.title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-brand-gold-light">
                {i + 1}
              </span>
              <div>
                <h3 className="text-base font-semibold text-brand-navy">{item.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
