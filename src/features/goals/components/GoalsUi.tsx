/** Small presentational building blocks used across the Goals screens. */
import type { ReactNode } from 'react'
import { Button } from '../../../components/Button'
import { Icon } from '../../../components/Icon'
import { getAllocationTotal, type PaceStatus } from '../budget'
import type { Allocation } from '../types'

interface PanelProps {
  /** Id for the panel heading; the section is labelled by it. */
  id: string
  title: string
  description?: ReactNode
  children: ReactNode
}

/** A card-style section for one Goals screen. Renders an <h3>. */
export function Panel({ id, title, description, children }: PanelProps) {
  return (
    <section className="goals-panel" aria-labelledby={id}>
      <div className="goals-panel__header">
        <h3 id={id} className="goals-panel__title">
          {title}
        </h3>
        {description && <p className="goals-panel__description">{description}</p>}
      </div>
      {children}
    </section>
  )
}

interface StatTileProps {
  label: string
  value: ReactNode
  hint?: ReactNode
  highlight?: boolean
}

/** One label/value pair. Use inside a <dl className="goals-stats">. */
export function StatTile({ label, value, hint, highlight = false }: StatTileProps) {
  return (
    <div className={`goals-stat${highlight ? ' goals-stat--highlight' : ''}`}>
      <dt className="goals-stat__label">{label}</dt>
      <dd className="goals-stat__value">{value}</dd>
      {hint && <dd className="goals-stat__hint">{hint}</dd>}
    </div>
  )
}

interface ProgressBarProps {
  value: number
  max: number
  /** Accessible name of the bar. */
  label: string
  /** Human-readable value for screen readers, e.g. "120 of 200 kg". */
  valueText: string
  tone?: 'default' | 'muted' | 'warning' | 'danger'
  /** Sets the tone from a pace status; overrides `tone`. */
  status?: PaceStatus
  /** Optional marker position (0–1), e.g. how much of the month has passed. */
  marker?: number
}

export function ProgressBar({
  value,
  max,
  label,
  valueText,
  tone = 'default',
  status,
  marker,
}: ProgressBarProps) {
  const fillTone = status ? STATUS_TONE[status] : tone
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : value > 0 ? 100 : 0
  return (
    <div
      className="goals-progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      aria-valuetext={valueText}
    >
      <div
        className={`goals-progress__fill goals-progress__fill--${fillTone}`}
        style={{ width: `${percent}%` }}
      />
      {marker !== undefined && (
        <div className="goals-progress__marker" style={{ left: `${marker * 100}%` }} />
      )}
    </div>
  )
}

const STATUS_LABEL: Record<PaceStatus, string> = {
  'on-track': 'On track',
  close: 'Ahead of pace',
  over: 'Over budget',
}

export function StatusBadge({ status }: { status: PaceStatus }) {
  return <span className={`goals-badge goals-badge--${status}`}>{STATUS_LABEL[status]}</span>
}

const STATUS_TONE: Record<PaceStatus, ProgressBarProps['tone']> = {
  'on-track': 'default',
  close: 'warning',
  over: 'danger',
}

interface NoticeProps {
  /** Bold lead-in, e.g. "Sample data." */
  title: string
  children: ReactNode
}

/** Small print explaining where figures come from. */
export function Notice({ title, children }: NoticeProps) {
  return (
    <p className="goals-notice">
      <Icon name="info" size={16} />
      <span>
        <strong>{title}</strong> {children}
      </span>
    </p>
  )
}

/** Marks content that is based on temporary sample data. */
export function SampleDataNotice({ children }: { children: ReactNode }) {
  return <Notice title="Sample data.">{children}</Notice>
}

/** Explains that figures are estimates from the shared illustrative factors. */
export function EstimateNotice({ children }: { children: ReactNode }) {
  return <Notice title="Estimates.">{children}</Notice>
}

interface AllocationWarningProps {
  allocation: Allocation
  onFix: () => void
}

/**
 * Shown on later steps when the categories do not add up to 100%, because
 * category budgets would then not add up to the monthly budget.
 */
export function AllocationWarning({ allocation, onFix }: AllocationWarningProps) {
  const total = getAllocationTotal(allocation)
  if (total === 100) return null
  return (
    <div className="goals-callout goals-callout--warning goals-callout--action" role="alert">
      <p>
        Your categories add up to <strong>{total}%</strong> of the budget, not 100%, so category
        budgets do not match your monthly budget.
      </p>
      <Button variant="secondary" onClick={onFix}>
        Fix allocation
      </Button>
    </div>
  )
}

/** Inline loading message for data read from Carbon tracking. */
export function LoadingLine({ children }: { children: ReactNode }) {
  return (
    <p className="goals-loading" role="status">
      <span className="goals-loading__spinner" aria-hidden="true" />
      {children}
    </p>
  )
}

interface ErrorLineProps {
  message: string
  onRetry: () => void
}

export function ErrorLine({ message, onRetry }: ErrorLineProps) {
  return (
    <div className="goals-callout goals-callout--danger goals-callout--action" role="alert">
      <p>{message}</p>
      <Button variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
