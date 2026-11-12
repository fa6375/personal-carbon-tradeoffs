import { useState } from 'react'
import { Button } from '../../../components/Button'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { deleteSavedGoalPlan, retryGoalPlanSave, type GoalSyncState } from '../goalPlanSync'

const dateTime = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' })

/** Shows whether the plan is saved in the user's account, with retry and delete. */
export function GoalPlanSyncBar({ sync }: { sync: GoalSyncState }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleted, setDeleted] = useState(false)

  async function confirmDelete() {
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteSavedGoalPlan()
      setDeleted(true)
    } catch (reason) {
      setDeleteError(reason instanceof Error ? reason.message : 'The plan could not be deleted.')
    } finally {
      setDeleting(false)
      setConfirming(false)
    }
  }

  const text = {
    new: deleted
      ? 'Your saved plan was deleted. This default plan is saved as soon as you change something.'
      : 'This plan is saved to your account as soon as you change something.',
    pending: 'Saving changes…',
    saving: 'Saving changes…',
    saved: sync.savedAt
      ? `All changes saved to your account (${dateTime.format(new Date(sync.savedAt))}).`
      : 'Your plan is saved in your account.',
    error: `Your latest changes are not saved. ${sync.error ?? ''}`,
  }[sync.save]

  return (
    <div className={`goals-sync goals-sync--${sync.save}`}>
      <p role="status" aria-live="polite" className="goals-sync__text">
        {text}
      </p>
      {deleteError && (
        <p role="alert" className="goals-sync__error">
          {deleteError}
        </p>
      )}
      <div className="goals-sync__actions">
        {sync.save === 'error' && (
          <Button variant="secondary" onClick={retryGoalPlanSave}>
            Try saving again
          </Button>
        )}
        {sync.save !== 'new' && (
          <Button variant="secondary" onClick={() => setConfirming(true)}>
            Delete saved plan
          </Button>
        )}
      </div>
      <ConfirmDialog
        open={confirming}
        title="Delete your saved plan?"
        message="Your goal, budget, allocation, priorities, chosen ideas and adjustment history will be permanently deleted from your account. Your tracked activities are not affected. This cannot be undone."
        confirmLabel="Delete plan"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setConfirming(false)}
      />
    </div>
  )
}
