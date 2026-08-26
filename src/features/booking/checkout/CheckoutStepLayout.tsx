import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckoutSummaryCard } from '@/features/booking/checkout/CheckoutSummaryCard'
import type { Location, VehicleWithDetails } from '@/types/domain'

interface CheckoutStepLayoutProps {
  stepIndex: number // 0-based index into the translated steps list
  title: string
  vehicle: VehicleWithDetails
  startDate: string
  endDate: string
  pickup: Location | null
  dropoff: Location | null
  children: ReactNode
}

export function CheckoutStepLayout({
  stepIndex,
  title,
  vehicle,
  startDate,
  endDate,
  pickup,
  dropoff,
  children,
}: CheckoutStepLayoutProps) {
  const { t } = useTranslation()
  const steps = t('checkout.steps', { returnObjects: true }) as string[]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <ol className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-2 text-xs font-medium">
        {steps.map((step, i) => (
          <li key={step} className="flex items-center gap-2">
            <span
              className={
                'flex h-6 w-6 items-center justify-center rounded-full text-[11px] ' +
                (i < stepIndex
                  ? 'bg-brand-navy text-white'
                  : i === stepIndex
                    ? 'bg-brand-gold text-brand-navy-dark'
                    : 'bg-slate-100 text-slate-400')
              }
            >
              {i + 1}
            </span>
            <span className={i === stepIndex ? 'text-brand-navy' : 'text-slate-400'}>{step}</span>
            {i < steps.length - 1 && <span className="mx-1 text-slate-300">→</span>}
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-xl font-bold text-brand-navy">{title}</h1>
          <div className="mt-5">{children}</div>
        </div>
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <CheckoutSummaryCard vehicle={vehicle} startDate={startDate} endDate={endDate} pickup={pickup} dropoff={dropoff} />
          </div>
        </div>
      </div>
    </div>
  )
}
