import { useState } from 'react'
import { Button } from '../../../components/Button'
import { ButtonLink } from '../../../components/ButtonLink'
import { EmptyState } from '../../../components/EmptyState'
import { Icon } from '../../../components/Icon'
import { savedComparisonHref } from '../comparisonRepository'
import {
  formatComparisonCount,
  formatDateTime,
  formatDuration,
  formatEuro,
  formatKg,
  formatPeople,
} from '../format'
import { getTransportOption } from '../transportOptions'
import type { SavedComparison } from '../types'
import { useSavedComparisons } from '../useSavedComparisons'
import { ConfirmDialog, LoadingState, ModeName } from './CompareUi'

/** The saved comparisons list shown on the Saved comparisons page (#/saved). */
export function SavedComparisonList() {
  const { status, comparisons, error, reload, remove } = useSavedComparisons()
  const [toDelete, setToDelete] = useState<SavedComparison | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await remove(toDelete.id)
      setMessage(`“${toDelete.name}” was deleted.`)
    } catch (reason) {
      setDeleteError(reason instanceof Error ? reason.message : 'The comparison could not be deleted.')
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  if (status === 'loading') return <LoadingState label="Loading saved comparisons…" />

  if (status === 'error') {
    return (
      <div className="compare-error" role="alert">
        <span className="compare-error__icon">
          <Icon name="info" size={24} />
        </span>
        <div className="compare-error__body">
          <p className="compare-error__title">Saved comparisons could not be loaded</p>
          <p>{error}</p>
          <div className="compare-actions compare-actions--start">
            <Button onClick={reload}>Try again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="compare-saved">
      <div className="visually-hidden" role="status" aria-live="polite">
        {message}
      </div>
      {message && (
        <p className="compare-flash" aria-hidden="true">
          {message}
        </p>
      )}
      {deleteError && (
        <p className="compare-form__summary" role="alert">
          {deleteError}
        </p>
      )}

      {comparisons.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title="No saved comparisons yet"
          action={
            <ButtonLink href="#/compare" icon="arrow-right">
              Compare a journey
            </ButtonLink>
          }
        >
          <p>When you compare a journey, choose “Save” to keep it here and open it again later.</p>
        </EmptyState>
      ) : (
        <>
          <p className="compare-muted">
            {formatComparisonCount(comparisons.length)} saved in this browser.
          </p>
          <ul className="compare-saved__list">
            {comparisons.map((comparison) => {
              const recommended = comparison.options.find((option) => option.mode === comparison.recommended)
              const { journey } = comparison.input
              return (
                <li key={comparison.id} className="compare-saved__item">
                  <div className="compare-saved__main">
                    <h2 className="compare-saved__name">{comparison.name}</h2>
                    <p className="compare-saved__meta">
                      {journey.from} → {journey.to} · {journey.distanceKm} km · {formatPeople(journey.passengers)} · saved{' '}
                      {formatDateTime(comparison.savedAt)}
                    </p>
                    <p className="compare-saved__modes">
                      {comparison.input.modes.map((mode) => (
                        <ModeName key={mode} mode={mode} size={14} />
                      ))}
                    </p>
                    {recommended && (
                      <p className="compare-saved__recommended">
                        <strong>Recommended: {getTransportOption(recommended.mode).label}</strong> ·{' '}
                        {formatKg(recommended.emissionsKg)} · {formatEuro(recommended.costEur)} ·{' '}
                        {formatDuration(recommended.timeMinutes)} per person
                      </p>
                    )}
                  </div>
                  <div className="compare-saved__actions">
                    <ButtonLink href={savedComparisonHref(comparison.id)} icon="arrow-right">
                      Open<span className="visually-hidden"> {comparison.name}</span>
                    </ButtonLink>
                    <Button variant="secondary" className="compare-button--danger-outline" onClick={() => setToDelete(comparison)}>
                      Delete<span className="visually-hidden"> {comparison.name}</span>
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this comparison?"
        message={toDelete ? `“${toDelete.name}” will be removed from this browser. This cannot be undone.` : ''}
        confirmLabel="Delete comparison"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
