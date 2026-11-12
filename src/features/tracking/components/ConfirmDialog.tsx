import { useEffect, useId, useRef } from 'react'
import { Button } from '../../../components/Button'
import { useI18n } from '../../../i18n'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Modal confirmation built on the native <dialog> element, which traps focus,
 * closes on Escape and restores focus to the opener.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useI18n()
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="tracking-dialog"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-message`}
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onCancel()
      }}
    >
      <h2 id={`${id}-title`} className="tracking-dialog__title">
        {title}
      </h2>
      <p id={`${id}-message`} className="tracking-dialog__message">
        {message}
      </p>
      <div className="tracking-dialog__actions">
        <Button variant="secondary" onClick={onCancel} disabled={busy} autoFocus>
          {t('actions.cancel')}
        </Button>
        <Button className="button--danger" onClick={onConfirm} disabled={busy}>
          {busy ? t('actions.deleting') : confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
