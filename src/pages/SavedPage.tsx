import { PlaceholderPage } from './PlaceholderPage'

export function SavedPage() {
  return (
    <PlaceholderPage
      title="Saved comparisons"
      description="Return to journeys you have compared before."
      icon="bookmark"
      emptyTitle="Saving comparisons is not available yet"
    >
      <p>Once journey comparison is available, comparisons you choose to keep will appear here.</p>
    </PlaceholderPage>
  )
}
