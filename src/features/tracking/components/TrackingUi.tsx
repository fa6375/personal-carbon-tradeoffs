/** Small presentational building blocks used across the Tracking screens. */
import type { ReactNode } from 'react'
import { Button } from '../../../components/Button'
import { Icon } from '../../../components/Icon'
import type { ActivityCategory } from '../types'
import { CATEGORY_ICONS } from '../categoryIcons'
import { CATEGORY_LABELS } from '../emissionFactors'


interface PanelProps {
  id: string
  title: string
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
}

/** Card-style section. Renders an <h3> labelled section. */
export function Panel({ id, title, description, actions, children }: PanelProps) {
  return (
    <section className="tracking-panel" aria-labelledby={id}>
      <div className="tracking-panel__header">
        <div>
          <h3 id={id} className="tracking-panel__title">
            {title}
          </h3>
          {description && <p className="tracking-panel__description">{description}</p>}
        </div>
        {actions && <div className="tracking-panel__actions">{actions}</div>}
      </div>
      {children}
    </section>
  )
}

export function StatTile({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="tracking-stat">
      <dt className="tracking-stat__label">{label}</dt>
      <dd className="tracking-stat__value">{value}</dd>
      {hint && <dd className="tracking-stat__hint">{hint}</dd>}
    </div>
  )
}

/** Category name with its icon, so category is never shown by colour alone. */
export function CategoryTag({ category }: { category: ActivityCategory }) {
  return (
    <span className={`tracking-tag tracking-tag--${category}`}>
      <Icon name={CATEGORY_ICONS[category]} size={14} />
      {CATEGORY_LABELS[category]}
    </span>
  )
}

interface ShareBarProps {
  label: string
  /** 0–1 */
  share: number
  valueText: string
  category?: ActivityCategory
}

/** Horizontal bar with its value in text next to it. */
export function ShareBar({ label, share, valueText, category }: ShareBarProps) {
  const percent = Math.round(Math.min(1, Math.max(0, share)) * 100)
  return (
    <div className="tracking-bar">
      <div className="tracking-bar__label">
        <span>{label}</span>
        <span className="tracking-bar__value">{valueText}</span>
      </div>
      <div
        className="tracking-bar__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={valueText}
      >
        <div
          className={`tracking-bar__fill${category ? ` tracking-bar__fill--${category}` : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

/** States that emissions are estimates from illustrative factors. */
export function EstimateNotice() {
  return (
    <p className="tracking-notice">
      <Icon name="info" size={16} />
      <span>
        <strong>Estimates.</strong> Emissions are calculated with illustrative average emission
        factors, not measured values. They will be replaced with data from an emission-factor
        service.
      </span>
    </p>
  )
}

export function LoadingState({ label = 'Loading activities…' }: { label?: string }) {
  return (
    <div className="tracking-loading" role="status">
      <span className="tracking-loading__spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="tracking-error" role="alert">
      <Icon name="info" size={20} />
      <div>
        <p className="tracking-error__title">Something went wrong</p>
        <p>{message}</p>
        {onRetry && (
          <Button variant="secondary" onClick={onRetry} className="tracking-error__retry">
            Try again
          </Button>
        )}
      </div>
    </div>
  )
}

/** Text-style back button at the top of sub-screens. */
export function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="tracking-back" onClick={onClick}>
      <Icon name="arrow-left" size={18} />
      <span>{label}</span>
    </button>
  )
}
