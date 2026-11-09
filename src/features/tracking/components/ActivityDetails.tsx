import { useState } from 'react'
import { Button } from '../../../components/Button'
import {
  SHARED_VEHICLE_MODES,
  calculateEmissions,
  describeActivity,
  energyFactor,
  foodFactor,
  transportFactor,
} from '../emissionFactors'
import { formatAmount, formatDateTime, formatKg, formatLongDay, formatNumber } from '../format'
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
  if (d.category === 'transport') {
    const factor = transportFactor(d.mode).kgPerUnit
    const shared = SHARED_VEHICLE_MODES.includes(d.mode) && d.passengers > 1
    return `${formatNumber(d.distanceKm)} km × ${factor} kg CO₂e/km${shared ? ` ÷ ${d.passengers} people` : ''}`
  }
  if (d.category === 'food') {
    return `${formatNumber(d.servings)} × ${foodFactor(d.item).kgPerUnit} kg CO₂e per serving`
  }
  const shared = d.householdSize > 1
  return `${formatNumber(d.kwh)} kWh × ${energyFactor(d.source).kgPerUnit} kg CO₂e/kWh${shared ? ` ÷ ${d.householdSize} people` : ''}`
}

/** Screen 7 — Activity Details, with edit and delete (with confirmation). */
export function ActivityDetails({ activity, onEdit, onDelete }: ActivityDetailsProps) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const d = activity.details

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      await onDelete()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The activity could not be deleted.')
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <Panel
      id="tracking-details-title"
      title={`${describeActivity(d)} · ${formatAmount(d)}`}
      description={formatLongDay(activity.date)}
    >
      <div className="tracking-details__hero">
        <span className="tracking-details__label">Estimated emissions</span>
        <span className="tracking-details__value">{formatKg(calculateEmissions(d))}</span>
        <span className="tracking-details__calc">{calculationSteps(activity)}</span>
      </div>

      <dl className="tracking-details__list">
        <div>
          <dt>Category</dt>
          <dd>
            <CategoryTag category={d.category} />
          </dd>
        </div>
        {d.category === 'transport' && (
          <>
            <div>
              <dt>Mode</dt>
              <dd>{transportFactor(d.mode).label}</dd>
            </div>
            <div>
              <dt>Distance</dt>
              <dd>{formatNumber(d.distanceKm)} km</dd>
            </div>
            {SHARED_VEHICLE_MODES.includes(d.mode) && (
              <div>
                <dt>People in the vehicle</dt>
                <dd>{d.passengers}</dd>
              </div>
            )}
          </>
        )}
        {d.category === 'food' && (
          <>
            <div>
              <dt>Food</dt>
              <dd>{foodFactor(d.item).label}</dd>
            </div>
            <div>
              <dt>Servings</dt>
              <dd>{formatNumber(d.servings)}</dd>
            </div>
          </>
        )}
        {d.category === 'home' && (
          <>
            <div>
              <dt>Energy source</dt>
              <dd>{energyFactor(d.source).label}</dd>
            </div>
            <div>
              <dt>Energy used</dt>
              <dd>{formatNumber(d.kwh)} kWh</dd>
            </div>
            <div>
              <dt>Household size</dt>
              <dd>{d.householdSize}</dd>
            </div>
          </>
        )}
        <div>
          <dt>Note</dt>
          <dd>{activity.note || <span className="tracking-muted">No note</span>}</dd>
        </div>
        <div>
          <dt>Recorded</dt>
          <dd>{formatDateTime(activity.createdAt)}</dd>
        </div>
        {activity.updatedAt !== activity.createdAt && (
          <div>
            <dt>Last edited</dt>
            <dd>{formatDateTime(activity.updatedAt)}</dd>
          </div>
        )}
      </dl>

      {error && (
        <p className="tracking-form__submit-error" role="alert">
          {error}
        </p>
      )}

      <div className="tracking-form__actions">
        <Button variant="secondary" icon="trash" className="button--danger-outline" onClick={() => setConfirming(true)}>
          Delete
        </Button>
        <Button icon="pencil" onClick={onEdit}>
          Edit activity
        </Button>
      </div>

      <EstimateNotice />

      <ConfirmDialog
        open={confirming}
        title="Delete this activity?"
        message={`${describeActivity(d)} on ${formatLongDay(activity.date)} will be removed from your history, dashboard and breakdown. This cannot be undone.`}
        confirmLabel="Delete activity"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirming(false)}
      />
    </Panel>
  )
}
