import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

type FormState = { status: 'idle' | 'sending' | 'sent' }

/**
 * Contact Us — contact methods (placeholders until real numbers/inboxes
 * exist) plus a message form. The form validates and shows a success
 * state client-side only: there is no email backend to actually deliver
 * it to yet (that's the Phase 7 email/WhatsApp build). Wiring this
 * `handleSubmit` to a real send is a one-function change once Resend is
 * connected — nothing about this UI needs to change then.
 */
export function ContactPage() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [state, setState] = useState<FormState>({ status: 'idle' })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (!name.trim()) nextErrors.name = t('pages.contact.form.errorName')
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = t('pages.contact.form.errorEmail')
    if (!message.trim()) nextErrors.message = t('pages.contact.form.errorMessage')
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setState({ status: 'sending' })
    window.setTimeout(() => {
      setState({ status: 'sent' })
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    }, 500)
  }

  type Method = { label: string; value: string; note: string }
  const methods: Method[] = [
    t('pages.contact.methods.whatsapp', { returnObjects: true }) as unknown as Method,
    t('pages.contact.methods.email', { returnObjects: true }) as unknown as Method,
    t('pages.contact.methods.address', { returnObjects: true }) as unknown as Method,
    t('pages.contact.methods.hours', { returnObjects: true }) as unknown as Method,
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">{t('pages.contact.title')}</h1>
        <p className="mt-2 text-sm text-slate-600">{t('pages.contact.subtitle')}</p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="space-y-5">
          {methods.map((m) => (
            <div key={m.label} className="rounded-xl border border-brand-navy/10 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{m.label}</p>
              <p className="mt-1 font-mono text-sm font-semibold text-brand-navy">{m.value}</p>
              {m.note && <p className="mt-1 text-xs text-slate-500">{m.note}</p>}
            </div>
          ))}
          <p className="rounded-xl border border-brand-lavender bg-brand-lavender/30 px-4 py-3 text-xs text-slate-600">
            {t('pages.contact.supportNote')}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-brand-navy/10 bg-white p-6">
          <h2 className="text-base font-semibold text-brand-navy">{t('pages.contact.form.heading')}</h2>

          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('pages.contact.form.name')}
              </span>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} autoComplete="name" />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('pages.contact.form.email')}
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                autoComplete="email"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('pages.contact.form.subject')}
              </span>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('pages.contact.form.message')}
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className={inputClass}
              />
              {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
            </label>

            <button
              type="submit"
              disabled={state.status === 'sending'}
              className="w-full rounded-lg bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-navy-dark shadow-sm transition-colors hover:bg-brand-gold-light disabled:opacity-60"
            >
              {state.status === 'sending' ? t('pages.contact.form.sending') : t('pages.contact.form.submit')}
            </button>

            {state.status === 'sent' && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {t('pages.contact.form.success')}
              </p>
            )}
            <p className="text-xs text-slate-500">{t('pages.contact.form.note')}</p>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-brand-navy outline-none transition-colors focus:border-brand-navy focus:ring-1 focus:ring-brand-navy'
