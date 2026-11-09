/** Small presentational building blocks used across the Goals screens. */
import type { ReactNode } from 'react'
import { Icon } from '../../../components/Icon'
import type { PaceStatus } from '../budget'

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
  tone?: 'default' | 'muted' | 'warning'
  /** Optional marker position (0–1), e.g. how much of the month has passed. */
  marker?: number
}

export function ProgressBar({
  value,
  max,
  label,
  valueText,
  tone = 'default',
  marker,
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
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
        className={`goals-progress__fill goals-progress__fill--${tone}`}
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

/** Marks content that is based on temporary sample data. */
export function SampleDataNotice({ children }: { children: ReactNode }) {
  return (
    <p className="goals-notice">
      <Icon name="info" size={16} />
      <span>
        <strong>Sample data.</strong> {children}
      </span>
    </p>
  )
}
