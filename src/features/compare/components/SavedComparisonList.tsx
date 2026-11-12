import { useState } from 'react'
import { Button } from '../../../components/Button'
import { ButtonLink } from '../../../components/ButtonLink'
import { EmptyState } from '../../../components/EmptyState'
import { Icon } from '../../../components/Icon'
import { isOffline } from '../../../hooks/useOnlineStatus'
import { useI18n } from '../../../i18n'
import type { DataErrorCode } from '../../../lib/dataErrors'
import { dataErrorCode, dataErrorText } from '../../../lib/errorMessages'
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
  const { t } = useI18n()
  const { status, comparisons, error, reload, remove } = useSavedComparisons()
  const [toDelete, setToDelete] = useState<SavedComparison | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<DataErrorCode | 'offline' | null>(null)

  async function confirmDelete() {
    if (!toDelete || deleting) return
    if (isOffline()) {
      setDeleteError('offline')
      setToDelete(null)
      return
    }
    setDeleting(true)
    setDeleteError(null)
    try {
      await remove(toDelete.id)
      setMessage(t('compare.saved.deleted', { name: toDelete.name }))
    } catch (reason) {
      setDeleteError(dataErrorCode(reason))
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  if (status === 'loading') return <LoadingState label={t('compare.saved.loading')} />

  if (status === 'error') {
    return (
      <div className="compare-error" role="alert">
        <span className="compare-error__icon">
          <Icon name="info" size={24} />
        </span>
        <div className="compare-error__body">
          <p className="compare-error__title">{t('compare.saved.loadFailed')}</p>
          <p>{dataErrorText(error ?? 'unknown')}</p>
          <div className="compare-actions compare-actions--start">
            <Button onClick={reload}>{t('actions.tryAgain')}</Button>
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
          {deleteError === 'offline'
            ? t('offline.saveBlocked')
            : t('compare.saved.deleteFailed', { error: dataErrorText(deleteError) })}
        </p>
      )}

      {comparisons.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title={t('compare.saved.emptyTitle')}
          action={
            <ButtonLink href="#/compare" icon="arrow-right">
              {t('compare.saved.emptyAction')}
            </ButtonLink>
          }
        >
          <p>{t('compare.saved.emptyText')}</p>
        </EmptyState>
      ) : (
        <>
          <p className="compare-muted">
            {t('compare.saved.count', { comparisons: formatComparisonCount(comparisons.length) })}
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
                      {t('compare.saved.meta', {
                        from: journey.from,
                        to: journey.to,
                        distance: journey.distanceKm,
                        people: formatPeople(journey.passengers),
                        date: formatDateTime(comparison.savedAt),
                      })}
                    </p>
                    <p className="compare-saved__modes">
                      {comparison.input.modes.map((mode) => (
                        <ModeName key={mode} mode={mode} size={14} />
                      ))}
                    </p>
                    {recommended && (
                      <p className="compare-saved__recommended">
                        <strong>{t('compare.saved.recommended', { option: getTransportOption(recommended.mode).label })}</strong> ·{' '}
                        {t('compare.saved.recommendedValues', {
                          kg: formatKg(recommended.emissionsKg),
                          cost: formatEuro(recommended.costEur),
                          time: formatDuration(recommended.timeMinutes),
                        })}
                      </p>
                    )}
                  </div>
                  <div className="compare-saved__actions">
                    <ButtonLink href={savedComparisonHref(comparison.id)} icon="arrow-right">
                      {t('compare.saved.open')}
                      <span className="visually-hidden"> {comparison.name}</span>
                    </ButtonLink>
                    <Button variant="secondary" className="compare-button--danger-outline" onClick={() => setToDelete(comparison)}>
                      {t('compare.saved.delete')}
                      <span className="visually-hidden"> {comparison.name}</span>
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
        title={t('compare.saved.confirmTitle')}
        message={toDelete ? t('compare.saved.confirmMessage', { name: toDelete.name }) : ''}
        confirmLabel={t('compare.saved.confirmButton')}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
