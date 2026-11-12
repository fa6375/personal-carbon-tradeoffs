import { useI18n } from '../../../i18n'
import { categoryLabelLower } from '../labels'
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
  const { t } = useI18n()
  return (
    <Panel
      id="tracking-edit-title"
      title={t('tracking.edit.title', { category: categoryLabelLower(activity.details.category) })}
      description={t('tracking.edit.description')}
    >
      <ActivityForm
        key={activity.id}
        initialValues={formFromActivity(activity)}
        submitLabel={t('tracking.edit.save')}
        onSubmit={onSave}
        onCancel={onCancel}
      />
    </Panel>
  )
}
