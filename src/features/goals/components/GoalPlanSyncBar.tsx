import { useState } from 'react'
import { Button } from '../../../components/Button'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { useI18n } from '../../../i18n'
import type { DataErrorCode } from '../../../lib/dataErrors'
import { dataErrorCode, dataErrorText } from '../../../lib/errorMessages'
import { deleteSavedGoalPlan, retryGoalPlanSave, type GoalSyncState } from '../goalPlanSync'

/** Shows whether the plan is saved in the user's account, with retry and delete. */
export function GoalPlanSyncBar({ sync }: { sync: GoalSyncState }) {
  const { t, format } = useI18n()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<DataErrorCode | null>(null)
  const [deleted, setDeleted] = useState(false)

  async function confirmDelete() {
    if (deleting) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteSavedGoalPlan()
      setDeleted(true)
    } catch (reason) {
      setDeleteError(dataErrorCode(reason))
    } finally {
      setDeleting(false)
      setConfirming(false)
    }
  }

  const text = {
    new: deleted ? t('goals.sync.newAfterDelete') : t('goals.sync.new'),
    pending: t('goals.sync.saving'),
    saving: t('goals.sync.saving'),
    saved: sync.savedAt
      ? t('goals.sync.saved', { time: format.dateTime(new Date(sync.savedAt)) })
      : t('goals.sync.savedNoTime'),
    offline: t('goals.sync.offline'),
    error: t('goals.sync.error', { error: dataErrorText(sync.error ?? 'unknown') }),
  }[sync.save]

  return (
    <div className={`goals-sync goals-sync--${sync.save}`}>
      <p role="status" aria-live="polite" className="goals-sync__text">
        {text}
      </p>
      {deleteError && (
        <p role="alert" className="goals-sync__error">
          {t('goals.sync.deleteFailed', { error: dataErrorText(deleteError) })}
        </p>
      )}
      <div className="goals-sync__actions">
        {(sync.save === 'error' || sync.save === 'offline') && (
          <Button variant="secondary" onClick={retryGoalPlanSave}>
            {t('goals.sync.retry')}
          </Button>
        )}
        {sync.save !== 'new' && (
          <Button variant="secondary" onClick={() => setConfirming(true)}>
            {t('goals.sync.delete')}
          </Button>
        )}
      </div>
      <ConfirmDialog
        open={confirming}
        title={t('goals.sync.confirmTitle')}
        message={t('goals.sync.confirmMessage')}
        confirmLabel={t('goals.sync.confirmButton')}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setConfirming(false)}
      />
    </div>
  )
}
