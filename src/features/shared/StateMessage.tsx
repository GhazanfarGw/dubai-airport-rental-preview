import type { ReactNode } from 'react'

interface StateMessageProps {
  title: string
  body?: string
  action?: ReactNode
  tone?: 'neutral' | 'error'
}

/** One consistent look for every loading/empty/error state across the site. */
export function StateMessage({ title, body, action, tone = 'neutral' }: StateMessageProps) {
  return (
    <div
      className={
        'mx-auto flex max-w-md flex-col items-center rounded-2xl border px-6 py-12 text-center ' +
        (tone === 'error'
          ? 'border-red-200 bg-red-50'
          : 'border-brand-navy/10 bg-brand-lavender/40')
      }
    >
      <h3 className={'text-base font-semibold ' + (tone === 'error' ? 'text-red-800' : 'text-brand-navy')}>
        {title}
      </h3>
      {body && (
        <p className={'mt-2 text-sm ' + (tone === 'error' ? 'text-red-700' : 'text-slate-600')}>
          {body}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={'animate-spin text-brand-navy/40 ' + className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  )
}
