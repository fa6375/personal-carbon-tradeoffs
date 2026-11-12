/** Small presentational building blocks shared by the Compare screens. */
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from '../../../components/Button'
import { Icon } from '../../../components/Icon'
import { t } from '../../../i18n'
import { getTransportOption } from '../transportOptions'
import type { TransportOptionId } from '../types'

interface PanelProps {
  id: string
  title: string
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}

/** Card-style section. Renders an <h3> labelled section. */
export function Panel({ id, title, description, actions, children, className }: PanelProps) {
  return (
    <section className={['compare-panel', className].filter(Boolean).join(' ')} aria-labelledby={id}>
      <div className="compare-panel__header">
        <div>
          <h3 id={id} className="compare-panel__title">
            {title}
          </h3>
          {description && <p className="compare-panel__description">{description}</p>}
        </div>
        {actions && <div className="compare-panel__actions">{actions}</div>}
      </div>
      {children}
    </section>
  )
}

/** Transport option name with its icon, so options are never identified by colour alone. */
export function ModeName({ mode, size = 18 }: { mode: TransportOptionId; size?: number }) {
  const option = getTransportOption(mode)
  return (
    <span className="compare-mode">
      <span className={`compare-mode__icon compare-mode__icon--${mode}`}>
        <Icon name={option.icon} size={size} />
      </span>
      <span>{option.label}</span>
    </span>
  )
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'best' | 'recommended' }) {
  return <span className={`compare-badge compare-badge--${tone}`}>{children}</span>
}

/** States that every figure is an illustrative estimate. */
export function EstimateNotice() {
  return (
    <p className="compare-notice">
      <Icon name="info" size={16} />
      <span>
        <strong>{t('compare.estimateTitle')}</strong> {t('compare.estimateNotice')}
      </span>
    </p>
  )
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="compare-loading" role="status">
      <span className="compare-loading__spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

/** Text-style back button at the top of sub-screens. */
export function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="compare-back" onClick={onClick}>
      <Icon name="arrow-left" size={18} />
      <span>{label}</span>
    </button>
  )
}

interface FieldProps {
  id: string
  label: string
  value: string
  error?: string
  hint?: string
  unit?: string
  inputMode?: 'decimal' | 'numeric' | 'text'
  autoComplete?: string
  maxLength?: number
  onChange: (value: string) => void
}

/** Labelled text input with hint and error linked through aria-describedby. */
export function Field({
  id,
  label,
  value,
  error,
  hint,
  unit,
  inputMode = 'text',
  autoComplete = 'off',
  maxLength,
  onChange,
}: FieldProps) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ')
  const isNumber = inputMode !== 'text'
  return (
    <div className={`compare-field${error ? ' compare-field--invalid' : ''}`}>
      <label className="compare-field__label" htmlFor={id}>
        {label} <span className="compare-field__required">{t('actions.required')}</span>
      </label>
      {hint && (
        <p id={`${id}-hint`} className="compare-field__hint">
          {hint}
        </p>
      )}
      <div className="compare-field__control">
        <input
          id={id}
          className={`compare-input${isNumber ? ' compare-input--number' : ''}`}
          type="text"
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          required
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          onChange={(event) => onChange(event.target.value)}
        />
        {unit && <span className="compare-field__unit">{unit}</span>}
      </div>
      {error && (
        <p id={`${id}-error`} className="compare-field__error">
          {error}
        </p>
      )}
    </div>
  )
}

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Modal confirmation on the native <dialog> element (focus trap, Esc to close, focus restore). */
export function ConfirmDialog({ open, title, message, confirmLabel, busy = false, onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const dialogId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="compare-dialog"
      aria-labelledby={`${dialogId}-title`}
      aria-describedby={`${dialogId}-message`}
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onCancel()
      }}
    >
      <h2 id={`${dialogId}-title`} className="compare-dialog__title">
        {title}
      </h2>
      <p id={`${dialogId}-message`}>{message}</p>
      <div className="compare-dialog__actions">
        <Button variant="secondary" onClick={onCancel} disabled={busy} autoFocus>
          {t('actions.cancel')}
        </Button>
        <Button className="compare-button--danger" onClick={onConfirm} disabled={busy}>
          {busy ? t('actions.deleting') : confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
