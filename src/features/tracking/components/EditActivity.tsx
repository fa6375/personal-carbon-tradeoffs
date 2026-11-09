import { CATEGORY_LABELS } from '../emissionFactors'
import type { Activity, ActivityInput } from '../types'
import { formFromActivity } from '../validation'
import { ActivityForm } from './ActivityForm'
import { Panel } from './TrackingUi'

interface EditActivityProps {
  activity: Activity
  onSave: (input: ActivityInput) => Promise<void>
  onCancel: () => void
}

/** Screen 8 — Edit Activity. The category stays the same; everything else can change. */
export function EditActivity({ activity, onSave, onCancel }: EditActivityProps) {
  return (
    <Panel
      id="tracking-edit-title"
      title={`Edit ${CATEGORY_LABELS[activity.details.category].toLowerCase()} activity`}
      description="Change the details and save. The estimate updates as you type."
    >
      <ActivityForm
        key={activity.id}
        initialValues={formFromActivity(activity)}
        submitLabel="Save changes"
        onSubmit={onSave}
        onCancel={onCancel}
      />
    </Panel>
  )
}
