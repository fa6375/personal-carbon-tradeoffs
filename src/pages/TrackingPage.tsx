import { useRef, useState } from 'react'
import { Button } from '../components/Button'
import { PageHeader } from '../components/PageHeader'
import { ActivityDetails } from '../features/tracking/components/ActivityDetails'
import { ActivityEntry } from '../features/tracking/components/ActivityEntry'
import { ActivityHistory } from '../features/tracking/components/ActivityHistory'
import { AddActivity } from '../features/tracking/components/AddActivity'
import { EditActivity } from '../features/tracking/components/EditActivity'
import { EmissionsBreakdown } from '../features/tracking/components/EmissionsBreakdown'
import { NoActivities } from '../features/tracking/components/NoActivities'
import { TrackingDashboard } from '../features/tracking/components/TrackingDashboard'
import {
  BackButton,
  ErrorState,
  LoadingState,
} from '../features/tracking/components/TrackingUi'
import { CATEGORY_LABELS } from '../features/tracking/emissionFactors'
import type { ActivityInput, TrackingView } from '../features/tracking/types'
import { useActivities } from '../features/tracking/useActivities'
import '../features/tracking/tracking.css'

const TABS: { name: 'dashboard' | 'history' | 'breakdown'; label: string }[] = [
  { name: 'dashboard', label: 'Dashboard' },
  { name: 'history', label: 'History' },
  { name: 'breakdown', label: 'Breakdown' },
]

function viewTitle(view: TrackingView): string {
  switch (view.name) {
    case 'dashboard':
      return 'Dashboard'
    case 'add':
      return 'Add activity'
    case 'entry':
      return `New ${CATEGORY_LABELS[view.category].toLowerCase()} activity`
    case 'history':
      return 'Activity history'
    case 'details':
      return 'Activity details'
    case 'edit':
      return 'Edit activity'
    case 'breakdown':
      return 'Emissions breakdown'
  }
}

/** Personal Carbon Tracking (Lazar Jovović). */
export function TrackingPage() {
  const { status, activities, error, reload, create, update, remove } = useActivities()
  const [view, setView] = useState<TrackingView>({ name: 'dashboard' })
  const [message, setMessage] = useState<string | null>(null)
  const viewRef = useRef<HTMLElement>(null)

  function go(next: TrackingView, announce: string | null = null) {
    setView(next)
    setMessage(announce)
    // Move focus to the new screen so keyboard and screen reader users start there.
    requestAnimationFrame(() => {
      viewRef.current?.focus()
      viewRef.current?.scrollIntoView({ block: 'start' })
    })
  }

  async function handleCreate(input: ActivityInput) {
    const created = await create(input)
    go({ name: 'details', id: created.id }, 'Activity saved.')
  }

  const current =
    view.name === 'details' || view.name === 'edit'
      ? activities.find((activity) => activity.id === view.id)
      : undefined

  const tabView = TABS.some((tab) => tab.name === view.name) ? view.name : null
  const back: { label: string; to: TrackingView } | null =
    view.name === 'add'
      ? { label: 'Back to dashboard', to: { name: 'dashboard' } }
      : view.name === 'entry'
        ? { label: 'Back to categories', to: { name: 'add' } }
        : view.name === 'details'
          ? { label: 'Back to history', to: { name: 'history' } }
          : view.name === 'edit'
            ? { label: 'Back to details', to: { name: 'details', id: view.id } }
            : null

  function renderView() {
    if (status === 'loading') return <LoadingState />
    if (status === 'error') return <ErrorState message={error ?? ''} onRetry={reload} />

    const noActivities = activities.length === 0
    switch (view.name) {
      case 'dashboard':
      case 'history':
      case 'breakdown':
        if (noActivities) return <NoActivities onAdd={() => go({ name: 'add' })} />
        if (view.name === 'dashboard')
          return (
            <TrackingDashboard
              activities={activities}
              onOpen={(id) => go({ name: 'details', id })}
              onHistory={() => go({ name: 'history' })}
              onBreakdown={() => go({ name: 'breakdown' })}
            />
          )
        if (view.name === 'history')
          return <ActivityHistory activities={activities} onOpen={(id) => go({ name: 'details', id })} />
        return <EmissionsBreakdown activities={activities} />
      case 'add':
        return <AddActivity onChoose={(category) => go({ name: 'entry', category })} />
      case 'entry':
        return (
          <ActivityEntry
            category={view.category}
            onSave={handleCreate}
            onCancel={() => go({ name: 'add' })}
          />
        )
      case 'details':
        if (!current)
          return <ErrorState message="This activity could not be found. It may have been deleted." />
        return (
          <ActivityDetails
            activity={current}
            onEdit={() => go({ name: 'edit', id: current.id })}
            onDelete={async () => {
              await remove(current.id)
              go({ name: 'history' }, 'Activity deleted.')
            }}
          />
        )
      case 'edit':
        if (!current)
          return <ErrorState message="This activity could not be found. It may have been deleted." />
        return (
          <EditActivity
            activity={current}
            onSave={async (input) => {
              await update(current.id, input)
              go({ name: 'details', id: current.id }, 'Changes saved.')
            }}
            onCancel={() => go({ name: 'details', id: current.id })}
          />
        )
    }
  }

  return (
    <div className="tracking-page">
      <PageHeader
        eyebrow="Carbon tracking"
        title="Personal carbon tracking"
        description="Record your everyday transport, food and home energy, and see where your emissions come from."
      />

      <div className="tracking-toolbar">
        <nav aria-label="Carbon tracking sections">
          <ul className="tracking-tabs">
            {TABS.map((tab) => (
              <li key={tab.name}>
                <button
                  type="button"
                  className="tracking-tabs__button"
                  aria-current={tabView === tab.name ? 'page' : undefined}
                  onClick={() => go({ name: tab.name })}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {status === 'ready' && view.name !== 'add' && view.name !== 'entry' && (
          <Button icon="plus" onClick={() => go({ name: 'add' })}>
            Add activity
          </Button>
        )}
      </div>

      <div className="visually-hidden" role="status" aria-live="polite">
        {message}
      </div>

      <section
        ref={viewRef}
        className="tracking-view"
        aria-labelledby="tracking-view-title"
        tabIndex={-1}
      >
        {back && <BackButton label={back.label} onClick={() => go(back.to)} />}
        <h2 id="tracking-view-title" className="tracking-view__title">
          {viewTitle(view)}
        </h2>
        {message && (
          <p className="tracking-flash" aria-hidden="true">
            {message}
          </p>
        )}
        {renderView()}
      </section>
    </div>
  )
}
