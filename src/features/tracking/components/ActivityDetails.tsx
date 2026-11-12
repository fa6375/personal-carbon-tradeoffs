import { useState } from 'react'
import { Button } from '../../../components/Button'
import { isOffline } from '../../../hooks/useOnlineStatus'
import { t, useI18n } from '../../../i18n'
import type { DataErrorCode } from '../../../lib/dataErrors'
import { dataErrorCode, dataErrorText } from '../../../lib/errorMessages'
import { SHARED_VEHICLE_MODES, calculateEmissions, energyFactor, foodFactor, transportFactor } from '../emissionFactors'
import { formatAmount, formatDateTime, formatKg, formatLongDay, formatNumber } from '../format'
import { describeActivityLocalized, energyLabel, foodLabel, modeLabel } from '../labels'
import type { Activity } from '../types'
import { ConfirmDialog } from './ConfirmDialog'
import { CategoryTag, EstimateNotice, Panel } from './TrackingUi'

interface ActivityDetailsProps {
  activity: Activity
  onEdit: () => void
  onDelete: () => Promise<void>
}

/** Explains how the estimate was calculated, step by step. */
function calculationSteps(activity: Activity): string {
  const d = activity.details
  const factor = (value: number) => formatNumber(value)
  if (d.category === 'transport') {
    const shared = SHARED_VEHICLE_MODES.includes(d.mode) && d.passengers > 1
    const divide = shared ? ` ${t('tracking.details.sharedBy', { people: t('tracking.people', { count: d.passengers }) })}` : ''
    return `${formatNumber(d.distanceKm)} km × ${factor(transportFactor(d.mode).kgPerUnit)} ${t('tracking.details.perKm')}${divide}`
  }
  if (d.category === 'food') {
    return `${formatNumber(d.servings)} × ${factor(foodFactor(d.item).kgPerUnit)} ${t('tracking.details.perServing')}`
  }
  const divide =
    d.householdSize > 1 ? ` ${t('tracking.details.sharedBy', { people: t('tracking.people', { count: d.householdSize }) })}` : ''
  return `${formatNumber(d.kwh)} kWh × ${factor(energyFactor(d.source).kgPerUnit)} ${t('tracking.details.perKwh')}${divide}`
}

/** Screen 7 — Activity Details, with edit and delete (with confirmation). */
export function ActivityDetails({ activity, onEdit, onDelete }: ActivityDetailsProps) {
  const { t } = useI18n()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<DataErrorCode | 'offline' | null>(null)
  const d = activity.details

  async function handleDelete() {
    if (deleting) return
    if (isOffline()) {
      setError('offline')
      setConfirming(false)
      return
    }
    setDeleting(true)
    setError(null)
    try {
      await onDelete()
    } catch (reason) {
      setError(dataErrorCode(reason))
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <Panel
      id="tracking-details-title"
      title={`${describeActivityLocalized(d)} · ${formatAmount(d)}`}
      description={formatLongDay(activity.date)}
    >
      <div className="tracking-details__hero">
        <span className="tracking-details__label">{t('tracking.details.estimate')}</span>
        <span className="tracking-details__value">{formatKg(calculateEmissions(d))}</span>
        <span className="tracking-details__calc">{calculationSteps(activity)}</span>
      </div>

      <dl className="tracking-details__list">
        <div>
          <dt>{t('tracking.details.category')}</dt>
          <dd>
            <CategoryTag category={d.category} />
          </dd>
        </div>
        {d.category === 'transport' && (
          <>
            <div>
              <dt>{t('tracking.details.mode')}</dt>
              <dd>{modeLabel(d.mode)}</dd>
            </div>
            <div>
              <dt>{t('tracking.details.distance')}</dt>
              <dd>{formatNumber(d.distanceKm)} km</dd>
            </div>
            {SHARED_VEHICLE_MODES.includes(d.mode) && (
              <div>
                <dt>{t('tracking.details.passengers')}</dt>
                <dd>{d.passengers}</dd>
              </div>
            )}
          </>
        )}
        {d.category === 'food' && (
          <>
            <div>
              <dt>{t('tracking.details.food')}</dt>
              <dd>{foodLabel(d.item)}</dd>
            </div>
            <div>
              <dt>{t('tracking.details.servings')}</dt>
              <dd>{formatNumber(d.servings)}</dd>
            </div>
          </>
        )}
        {d.category === 'home' && (
          <>
            <div>
              <dt>{t('tracking.details.source')}</dt>
              <dd>{energyLabel(d.source)}</dd>
            </div>
            <div>
              <dt>{t('tracking.details.kwh')}</dt>
              <dd>{formatNumber(d.kwh)} kWh</dd>
            </div>
            <div>
              <dt>{t('tracking.details.householdSize')}</dt>
              <dd>{d.householdSize}</dd>
            </div>
          </>
        )}
        <div>
          <dt>{t('tracking.details.note')}</dt>
          <dd>{activity.note || <span className="tracking-muted">{t('tracking.details.noNote')}</span>}</dd>
        </div>
        <div>
          <dt>{t('tracking.details.recorded')}</dt>
          <dd>{formatDateTime(activity.createdAt)}</dd>
        </div>
        {activity.updatedAt !== activity.createdAt && (
          <div>
            <dt>{t('tracking.details.edited')}</dt>
            <dd>{formatDateTime(activity.updatedAt)}</dd>
          </div>
        )}
      </dl>

      {error && (
        <p className="tracking-form__submit-error" role="alert">
          {error === 'offline'
            ? t('offline.saveBlocked')
            : `${t('tracking.details.deleteFailed')} ${dataErrorText(error)}`}
        </p>
      )}

      <div className="tracking-form__actions">
        <Button variant="secondary" icon="trash" className="button--danger-outline" onClick={() => setConfirming(true)}>
          {t('tracking.details.delete')}
        </Button>
        <Button icon="pencil" onClick={onEdit}>
          {t('tracking.details.editActivity')}
        </Button>
      </div>

      <EstimateNotice />

      <ConfirmDialog
        open={confirming}
        title={t('tracking.details.confirmTitle')}
        message={t('tracking.details.confirmMessage', {
          activity: describeActivityLocalized(d),
          date: formatLongDay(activity.date),
        })}
        confirmLabel={t('tracking.details.confirmButton')}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirming(false)}
      />
    </Panel>
  )
}
