// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { OfflineBanner } from '../components/OfflineBanner'
import { AuthForm } from '../features/auth/AuthForm'
import { AdjustmentDetails } from '../features/goals/components/AdjustmentDetails'
import { GoalPlanSyncBar } from '../features/goals/components/GoalPlanSyncBar'
import { GoalProgress } from '../features/goals/components/GoalProgress'
import { createInitialPlan } from '../features/goals/goalPlanReducer'
import type { GoalSyncState } from '../features/goals/goalPlanSync'
import type { TrackedData } from '../features/goals/trackedEmissions'
import { ActivityForm } from '../features/tracking/components/ActivityForm'
import { NoActivities } from '../features/tracking/components/NoActivities'
import { ErrorState, LoadingState } from '../features/tracking/components/TrackingUi'
import { emptyForm } from '../features/tracking/validation'
import { setLocale } from '../i18n'
import { DataError } from '../lib/dataErrors'
import { dataErrorText } from '../lib/errorMessages'
import { setOnline, setupTestEnvironment } from './dom'

setupTestEnvironment()

const noop = () => undefined
const plan = createInitialPlan()

function trackedState(overrides: Partial<TrackedData>): TrackedData {
  return {
    status: 'ready',
    error: null,
    reload: noop,
    last30Days: { count: 0, amounts: { transport: 0, food: 0, home: 0 } },
    thisMonth: { count: 0, amounts: { transport: 0, food: 0, home: 0 } },
    ...overrides,
  }
}

function syncState(overrides: Partial<GoalSyncState>): GoalSyncState {
  return { load: 'ready', save: 'saved', error: null, savedAt: null, createdAt: null, ...overrides }
}

function renderTransportForm(onSubmit: (input: unknown) => Promise<void>) {
  render(<ActivityForm initialValues={emptyForm('transport')} submitLabel="Save activity" onSubmit={onSubmit} onCancel={noop} />)
  const distance = screen.getByRole('textbox', { name: /Distance/ }) as HTMLInputElement
  fireEvent.change(distance, { target: { value: '12' } })
  return distance
}

describe('loading states', () => {
  it('announces loading with a live status message', () => {
    render(<LoadingState />)
    expect(screen.getByRole('status').textContent).toBe('Loading activities…')
  })

  it('shows loading while Goals reads tracked activities', () => {
    render(<GoalProgress plan={plan} tracked={trackedState({ status: 'loading' })} currentMonth={plan.startMonth} />)
    expect(screen.getByRole('status').textContent).toContain('Loading your tracked activities…')
  })

  it('disables the save button while saving, so a form cannot be sent twice', async () => {
    let finish: () => void = noop
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)))
    renderTransportForm(onSubmit)

    fireEvent.click(screen.getByRole('button', { name: 'Save activity' }))
    const saving = screen.getByRole('button', { name: 'Saving…' })
    expect(saving.hasAttribute('disabled')).toBe(true)
    fireEvent.submit(saving.closest('form')!)
    expect(onSubmit).toHaveBeenCalledTimes(1)
    await act(async () => finish())
  })
})

describe('empty states', () => {
  it('explains that no activities exist and offers the next action', () => {
    const onAdd = vi.fn()
    render(<NoActivities onAdd={onAdd} />)
    expect(screen.getByRole('heading', { name: 'No activities recorded yet' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Add your first activity' }))
    expect(onAdd).toHaveBeenCalled()
  })

  it('explains that there are no budget adjustments yet', () => {
    render(<AdjustmentDetails plan={plan} selectedId={null} onSelect={noop} />)
    expect(screen.getByText(/No adjustments yet/)).toBeTruthy()
  })

  it('shows a sample month and a link to record activities when nothing is tracked', () => {
    render(<GoalProgress plan={plan} tracked={trackedState({})} currentMonth={plan.startMonth} />)
    expect(screen.getByText(/so a sample month is shown below/)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Record an activity/ }).getAttribute('href')).toBe('#/tracking')
  })
})

describe('error states', () => {
  it('shows an understandable error with a working retry button', () => {
    const onRetry = vi.fn()
    render(<ErrorState message={dataErrorText('unavailable')} onRetry={onRetry} />)
    expect(screen.getByRole('alert').textContent).toContain('The database cannot be reached.')
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('translates backend error codes into the selected language', () => {
    setLocale('hr')
    expect(dataErrorText(new DataError('permission-denied'))).toBe(
      'Nemate dopuštenje za pristup ovim podacima. Pokušajte se ponovno prijaviti.',
    )
    setLocale('de')
    expect(dataErrorText(new DataError('timeout'))).toContain('zu lange nicht geantwortet')
    expect(dataErrorText(new Error('anything else'))).toBe(
      'Bei der Verbindung mit der Datenbank ist ein Fehler aufgetreten. Versuchen Sie es erneut.',
    )
  })

  it('keeps what the user typed when saving fails, and shows the reason', async () => {
    const onSubmit = vi.fn(async () => {
      throw new DataError('unavailable')
    })
    const distance = renderTransportForm(onSubmit)
    fireEvent.change(screen.getByRole('textbox', { name: /Note/ }), { target: { value: 'Trip to campus' } })

    fireEvent.click(screen.getByRole('button', { name: 'Save activity' }))

    const alert = await screen.findByText(/The activity could not be saved\./)
    expect(alert.textContent).toContain('The database cannot be reached.')
    expect(distance.value).toBe('12')
    expect((screen.getByRole('textbox', { name: /Note/ }) as HTMLInputElement).value).toBe('Trip to campus')
    expect(screen.getByRole('button', { name: 'Save activity' }).hasAttribute('disabled')).toBe(false)
  })

  it('shows a failed autosave in Goals with a retry action', () => {
    render(<GoalPlanSyncBar sync={syncState({ save: 'error', error: 'timeout' })} />)
    expect(screen.getByRole('status').textContent).toBe(
      'Your latest changes are not saved. The database took too long to answer. Check your connection and try again.',
    )
    expect(screen.getByRole('button', { name: 'Try saving again' })).toBeTruthy()
  })

  it('shows Tracking errors in Goals progress with a retry button', () => {
    const reload = vi.fn()
    render(
      <GoalProgress plan={plan} tracked={trackedState({ status: 'error', error: 'unavailable', reload })} currentMonth={plan.startMonth} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(reload).toHaveBeenCalled()
  })
})

describe('offline and unavailable states', () => {
  it('shows an offline banner and announces when the connection returns', () => {
    render(<OfflineBanner />)
    expect(screen.getByRole('status').textContent).toBe('')

    act(() => setOnline(false))
    expect(screen.getByRole('status').textContent).toContain('You are offline.')

    act(() => setOnline(true))
    expect(screen.getByRole('status').textContent).toBe('You are back online.')
  })

  it('does not try to save while offline, keeps the input and does not claim success', async () => {
    const onSubmit = vi.fn(async () => undefined)
    const distance = renderTransportForm(onSubmit)
    setOnline(false)

    fireEvent.click(screen.getByRole('button', { name: 'Save activity' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole('alert').textContent).toContain('You are offline, so this cannot be saved yet.')
    expect(distance.value).toBe('12')

    // Back online: the same form can be sent.
    setOnline(true)
    fireEvent.click(screen.getByRole('button', { name: 'Save activity' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
  })

  it('tells the user when the Goals plan is waiting for the connection, with a retry', () => {
    render(<GoalPlanSyncBar sync={syncState({ save: 'offline' })} />)
    expect(screen.getByRole('status').textContent).toContain('will be saved when you are back online')
    expect(screen.getByRole('button', { name: 'Try saving again' })).toBeTruthy()
  })

  it('explains that sign-in needs a connection instead of trying while offline', () => {
    render(<AuthForm />)
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'student@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'secret-password' } })
    setOnline(false)

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByRole('alert').textContent).toBe('Could not reach the sign-in service. Check your internet connection.')
    expect(screen.getByRole('button', { name: 'Sign in' }).hasAttribute('disabled')).toBe(false)
  })
})
