import { PageHeader } from '../components/PageHeader'
import { SavedComparisonList } from '../features/compare/components/SavedComparisonList'
import '../features/compare/compare.css'
import { useI18n } from '../i18n'

/** Saved comparisons, part of Compare Everyday Choices (Faraj Aliyev). */
export function SavedPage() {
  const { t } = useI18n()
  return (
    <div className="compare-page">
      <PageHeader
        eyebrow={t('pages.saved.eyebrow')}
        title={t('pages.saved.title')}
        description={t('pages.saved.description')}
      />
      <SavedComparisonList />
    </div>
  )
}
