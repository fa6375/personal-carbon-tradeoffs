import { useI18n } from '../../../i18n'
import { categoryLabel } from '../labels'
import type { ActivityCategory, ActivityInput } from '../types'
import { emptyForm } from '../validation'
import { ActivityForm } from './ActivityForm'
import { EstimateNotice, Panel } from './TrackingUi'

interface ActivityEntryProps {
  category: ActivityCategory
  onSave: (input: ActivityInput) => Promise<void>
  onCancel: () => void
}

/** Screens 3, 4 and 5 — Transport, Food and Home Energy entry. */
export function ActivityEntry({ category, onSave, onCancel }: ActivityEntryProps) {
  const { t } = useI18n()
  return (
    <Panel
      id="tracking-entry-title"
      title={t('tracking.entry.title', { category: categoryLabel(category) })}
      description={t(`tracking.entry.descriptions.${category}`)}
    >
      <ActivityForm
        key={category}
        initialValues={emptyForm(category)}
        submitLabel={t('tracking.entry.save')}
        onSubmit={onSave}
        onCancel={onCancel}
      />
      <EstimateNotice />
    </Panel>
  )
}
