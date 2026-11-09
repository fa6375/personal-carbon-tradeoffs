import { CATEGORY_LABELS } from '../emissionFactors'
import type { ActivityCategory, ActivityInput } from '../types'
import { emptyForm } from '../validation'
import { ActivityForm } from './ActivityForm'
import { EstimateNotice, Panel } from './TrackingUi'

const DESCRIPTIONS: Record<ActivityCategory, string> = {
  transport: 'Record a journey. Walking and cycling are recorded with zero emissions.',
  food: 'Record a meal or food item and how many servings you had.',
  home: 'Record energy used at home, for example from a meter reading or monthly bill.',
}

interface ActivityEntryProps {
  category: ActivityCategory
  onSave: (input: ActivityInput) => Promise<void>
  onCancel: () => void
}

/** Screens 3, 4 and 5 — Transport, Food and Home Energy entry. */
export function ActivityEntry({ category, onSave, onCancel }: ActivityEntryProps) {
  return (
    <Panel
      id="tracking-entry-title"
      title={`${CATEGORY_LABELS[category]} activity`}
      description={DESCRIPTIONS[category]}
    >
      <ActivityForm
        key={category}
        initialValues={emptyForm(category)}
        submitLabel="Save activity"
        onSubmit={onSave}
        onCancel={onCancel}
      />
      <EstimateNotice />
    </Panel>
  )
}
