import { useTranslation } from 'react-i18next'

interface Step {
  title: string
  body: string
}

/**
 * The real customer journey — choose dates/location, select a vehicle,
 * enter customer/driver details, complete booking/payment — all online.
 * Doubles as the header's "Services" anchor target.
 */
export function HowItWorksSection() {
  const { t } = useTranslation()
  const steps = t('home.howItWorks.steps', { returnObjects: true }) as Step[]

  return (
    <section id="how-it-works" className="scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-brand-navy sm:text-3xl">{t('home.howItWorks.title')}</h2>
          <p className="mt-2 text-sm text-slate-600">{t('home.howItWorks.subtitle')}</p>
        </div>

        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="relative rounded-2xl border border-brand-navy/10 bg-white p-5 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold text-sm font-bold text-brand-navy-dark">
                {i + 1}
              </span>
              <h3 className="mt-4 text-sm font-semibold text-brand-navy">{step.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
