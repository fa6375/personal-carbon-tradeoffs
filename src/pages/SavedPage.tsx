import { PageHeader } from '../components/PageHeader'
import { SavedComparisonList } from '../features/compare/components/SavedComparisonList'
import '../features/compare/compare.css'

/** Saved comparisons, part of Compare Everyday Choices (Faraj Aliyev). */
export function SavedPage() {
  return (
    <div className="compare-page">
      <PageHeader
        eyebrow="Compare everyday choices"
        title="Saved comparisons"
        description="Return to journeys you have compared before. Comparisons are stored in this browser only."
      />
      <SavedComparisonList />
    </div>
  )
}
