import { useEffect, useId, useRef } from 'react'
import { useI18n } from '../i18n'
import { Button } from './Button'
import './ConfirmDialog.css'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  /** Text on the confirm button while busy. Defaults to "Deleting…". */
  busyLabel?: string
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Shared confirmation for destructive actions, on the native <dialog> element
 * (focus trap, Esc to cancel, focus returns to the opener). Focus starts on Cancel.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  busyLabel,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useI18n()
  const ref = useRef<HTMLDialogElement>(null)
  // Unique ids, so two dialogs on one page never share their labels.
  const id = useId()
  const titleId = `${id}-title`
  const messageId = `${id}-message`

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onCancel()
      }}
    >
      <h2 id={titleId} className="confirm-dialog__title">
        {title}
      </h2>
      <p id={messageId}>{message}</p>
      <div className="confirm-dialog__actions">
        <Button variant="secondary" onClick={onCancel} disabled={busy} autoFocus>
          {t('actions.cancel')}
        </Button>
        <Button className="confirm-dialog__danger" onClick={onConfirm} disabled={busy} aria-busy={busy || undefined}>
          {busy ? (busyLabel ?? t('actions.deleting')) : confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
