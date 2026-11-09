import { PlaceholderPage } from './PlaceholderPage'

export function NotFoundPage() {
  return (
    <PlaceholderPage
      title="Page not found"
      description="The page you were looking for does not exist."
      icon="info"
      emptyTitle="Nothing here"
    >
      <p>Check the address, or use the navigation to find your way.</p>
    </PlaceholderPage>
  )
}
