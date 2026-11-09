import type { ReactNode } from 'react'
import type { IconName } from '../types/icons'
import { Icon } from './Icon'
import './EmptyState.css'

interface EmptyStateProps {
  icon?: IconName
  title: string
  children?: ReactNode
  /** Optional call to action, e.g. a ButtonLink. */
  action?: ReactNode
}

/** Placeholder panel for areas that have no content or are not built yet. */
export function EmptyState({ icon = 'info', title, children, action }: EmptyStateProps) {
  return (
    <section className="empty-state" aria-label={title}>
      <span className="empty-state__icon">
        <Icon name={icon} size={24} />
      </span>
      <h2 className="empty-state__title">{title}</h2>
      {children && <div className="empty-state__body">{children}</div>}
      {action && <div className="empty-state__action">{action}</div>}
    </section>
  )
}
