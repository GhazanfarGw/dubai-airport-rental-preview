import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  /** Heading level — 'h1' for a page's own title (the default, matching
   *  every existing admin page), 'h2' when nested under a page that
   *  already renders its own h1 (e.g. a section within a longer
   *  customer-facing page). */
  as?: 'h1' | 'h2'
}

/**
 * Generalizes the pre-Phase-8 `AdminPageHeader` (title/description/
 * action row) so customer-facing pages can use the identical pattern —
 * `AdminPageHeader` now aliases straight through with zero visual
 * change for every existing admin page.
 */
export function SectionHeader({ title, description, action, as = 'h1' }: SectionHeaderProps) {
  const Heading = as
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <Heading className="text-lg font-bold text-brand-navy sm:text-xl">{title}</Heading>
        {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
