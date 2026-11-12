// @vitest-environment jsdom
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { MobileHeader } from '../components/MobileHeader'
import { AuthForm } from '../features/auth/AuthForm'
import { calculateComparison } from '../features/compare/calculate'
import { AlternativeScenario } from '../features/compare/components/AlternativeScenario'
import { CalculationBreakdown } from '../features/compare/components/CalculationBreakdown'
import { ChooseTransport } from '../features/compare/components/ChooseTransport'
import { CompareStart } from '../features/compare/components/CompareStart'
import { ComparisonResults } from '../features/compare/components/ComparisonResults'
import { JourneyDetails } from '../features/compare/components/JourneyDetails'
import { RecommendedOption } from '../features/compare/components/RecommendedOption'
import { SetPriorities } from '../features/compare/components/SetPriorities'
import { DEFAULT_PRIORITIES } from '../features/compare/criteria'
import { EMPTY_JOURNEY } from '../features/compare/validation'
import { AdjustmentDetails } from '../features/goals/components/AdjustmentDetails'
import { BudgetAdjustmentForm } from '../features/goals/components/BudgetAdjustmentForm'
import { BudgetAllocation } from '../features/goals/components/BudgetAllocation'
import { BudgetSetup } from '../features/goals/components/BudgetSetup'
import { BudgetSummary } from '../features/goals/components/BudgetSummary'
import { GoalProgress } from '../features/goals/components/GoalProgress'
import { MonthlyPlan } from '../features/goals/components/MonthlyPlan'
import { PersonalBudget } from '../features/goals/components/PersonalBudget'
import { ReductionOpportunities } from '../features/goals/components/ReductionOpportunities'
import { TradeoffPriorities } from '../features/goals/components/TradeoffPriorities'
import { createInitialPlan } from '../features/goals/goalPlanReducer'
import type { TrackedData } from '../features/goals/trackedEmissions'
import { ActivityForm } from '../features/tracking/components/ActivityForm'
import { AddActivity } from '../features/tracking/components/AddActivity'
import { NoActivities } from '../features/tracking/components/NoActivities'
import { emptyForm } from '../features/tracking/validation'
import { setLocale, type Locale } from '../i18n'
import { AppLayout } from '../layouts/AppLayout'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { SettingsPage } from '../pages/SettingsPage'
import { axeViolations, failOnMissingTranslations, setupTestEnvironment } from './dom'

setupTestEnvironment()

const noop = () => undefined
const plan = createInitialPlan()
const tracked: TrackedData = {
  status: 'ready',
  error: null,
  reload: noop,
  last30Days: { count: 0, amounts: { transport: 0, food: 0, home: 0 } },
  thisMonth: { count: 0, amounts: { transport: 0, food: 0, home: 0 } },
}
const comparison = calculateComparison({
  modes: ['bus', 'car', 'bicycle'],
  journey: { from: 'Home', to: 'Campus', distanceKm: 12, passengers: 1 },
  priorities: DEFAULT_PRIORITIES,
})

/** Important screens of every feature, as they are rendered in the app. */
const SCREENS: [string, () => ReactElement][] = [
  ['App shell with home page', () => <AppLayout activeRoute="home"><HomePage /></AppLayout>],
  ['Settings', () => <SettingsPage />],
  ['Not found', () => <NotFoundPage />],
  ['Sign-in form', () => <AuthForm />],
  ['Registration form', () => <AuthForm initialMode="register" />],
  ['Tracking: no activities', () => <NoActivities onAdd={noop} />],
  ['Tracking: add activity', () => <AddActivity onChoose={noop} />],
  ['Tracking: transport form', () => <ActivityForm initialValues={emptyForm('transport')} submitLabel="Save" onSubmit={async () => undefined} onCancel={noop} />],
  ['Tracking: home energy form', () => <ActivityForm initialValues={emptyForm('home')} submitLabel="Save" onSubmit={async () => undefined} onCancel={noop} />],
  ['Goals: setup', () => <BudgetSetup plan={plan} dispatch={noop} tracked={tracked} />],
  ['Goals: personal budget', () => <PersonalBudget plan={plan} />],
  ['Goals: allocation', () => <BudgetAllocation plan={plan} dispatch={noop} />],
  ['Goals: priorities', () => <TradeoffPriorities plan={plan} dispatch={noop} />],
  ['Goals: monthly plan', () => <MonthlyPlan plan={plan} currentMonth={plan.startMonth} />],
  ['Goals: opportunities', () => <ReductionOpportunities plan={plan} dispatch={noop} />],
  ['Goals: progress', () => <GoalProgress plan={plan} tracked={tracked} currentMonth={plan.startMonth} />],
  ['Goals: adjustment', () => <BudgetAdjustmentForm plan={plan} dispatch={noop} onApplied={noop} />],
  ['Goals: adjustment details', () => <AdjustmentDetails plan={plan} selectedId={null} onSelect={noop} />],
  ['Goals: summary', () => <BudgetSummary plan={plan} dispatch={noop} onEdit={noop} currentMonth={plan.startMonth} />],
  ['Compare: start', () => <CompareStart hasCurrent={false} onStart={noop} onContinue={noop} />],
  ['Compare: transport', () => <ChooseTransport initial={[]} onContinue={noop} onBack={noop} />],
  ['Compare: journey', () => <JourneyDetails initial={EMPTY_JOURNEY} modes={['bus', 'car']} onContinue={noop} onBack={noop} />],
  ['Compare: priorities', () => <SetPriorities initial={DEFAULT_PRIORITIES} onCompare={noop} onBack={noop} />],
  ['Compare: results', () => <ComparisonResults result={comparison} onRecommendation={noop} onBreakdown={noop} onScenario={noop} />],
  ['Compare: breakdown', () => <CalculationBreakdown result={comparison} />],
  ['Compare: recommendation', () => <RecommendedOption result={comparison} onScenario={noop} onSave={noop} />],
  ['Compare: scenario', () => <AlternativeScenario result={comparison} onApply={noop} onCancel={noop} />],
]

describe('automated accessibility checks (axe-core)', () => {
  it.each(SCREENS)('%s has no axe violations', async (name, screenFactory) => {
    const { container } = render(screenFactory())
    expect(await axeViolations(container, { page: name.startsWith('App shell') })).toEqual([])
  })
})

describe.each(['hr', 'de'] as Locale[])('screens in %s', (locale) => {
  it.each(SCREENS)('%s renders without missing translations', (_name, screenFactory) => {
    setLocale(locale)
    const missing = failOnMissingTranslations()
    render(screenFactory())
    expect(missing).toEqual([])
  })
})

describe('language switching', () => {
  it('updates the interface immediately, sets <html lang> and announces the change', () => {
    render(
      <AppLayout activeRoute="home">
        <HomePage />
      </AppLayout>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Welcome to Carbon Choices' })).toBeTruthy()

    const select = screen.getAllByLabelText('Language')[0]
    fireEvent.change(select, { target: { value: 'hr' } })

    expect(screen.getByRole('heading', { level: 1, name: 'Dobro došli u Carbon Choices' })).toBeTruthy()
    expect(screen.getAllByRole('link', { name: /Početna/ }).length).toBeGreaterThan(0)
    expect(document.documentElement.lang).toBe('hr')
    expect(screen.getAllByText('Jezik je promijenjen u hrvatski.').length).toBeGreaterThan(0)
    expect(window.localStorage.getItem('carbon-choices.locale')).toBe('hr')

    fireEvent.change(screen.getAllByLabelText('Jezik')[0], { target: { value: 'de' } })
    expect(screen.getByRole('heading', { level: 1, name: 'Willkommen bei Carbon Choices' })).toBeTruthy()
    expect(document.documentElement.lang).toBe('de')
  })

  it('lists every language in its own language, marked with lang', () => {
    render(<SettingsPage />)
    const options = within(screen.getByRole('combobox', { name: 'Language' })).getAllByRole('option') as HTMLOptionElement[]
    expect(options.map((option) => [option.value, option.lang, option.textContent])).toEqual([
      ['en', 'en', 'English'],
      ['hr', 'hr', 'Hrvatski'],
      ['de', 'de', 'Deutsch'],
    ])
  })
})

describe('keyboard and screen reader support', () => {
  it('makes the skip link the first focusable element and moves focus to the main content', () => {
    render(
      <AppLayout activeRoute="home">
        <HomePage />
      </AppLayout>,
    )
    const focusable = document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea')
    expect(focusable[0].textContent).toBe('Skip to main content')
    fireEvent.click(focusable[0])
    expect(document.activeElement?.id).toBe('main-content')
  })

  it('gives the icon-only menu button a name and state, and closes the menu with Escape', () => {
    render(<MobileHeader activeRoute="home" />)
    const toggle = screen.getByRole('button', { name: 'Open navigation menu' })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Close navigation menu' }).getAttribute('aria-expanded')).toBe('true')
    expect(document.getElementById('mobile-nav-menu')?.hidden).toBe(false)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(document.getElementById('mobile-nav-menu')?.hidden).toBe(true)
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open navigation menu' }))
  })

  it('marks the current page in the navigation', () => {
    render(<MobileHeader activeRoute="goals" />)
    const current = document.querySelectorAll('[aria-current="page"]')
    expect(current).toHaveLength(1)
    expect(current[0].textContent).toBe('Carbon goals')
  })

  it('opens a confirmation dialog with focus on Cancel, and Escape cancels it', () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    render(<ConfirmDialog open title="Delete this?" message="This cannot be undone." confirmLabel="Delete" onConfirm={onConfirm} onCancel={onCancel} />)

    const dialog = screen.getByRole('dialog', { hidden: true })
    expect(dialog.hasAttribute('open')).toBe(true)
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy()
    expect(document.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent).toBe('Delete this?')
    expect(document.activeElement?.textContent).toBe('Cancel')

    // Pressing Escape in a modal <dialog> fires "cancel"; the dialog then calls onCancel.
    act(() => {
      dialog.dispatchEvent(new Event('cancel', { cancelable: true }))
    })
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('does not let Escape close a dialog while it is busy', () => {
    const onCancel = vi.fn()
    render(<ConfirmDialog open busy title="Delete this?" message="…" confirmLabel="Delete" onConfirm={noop} onCancel={onCancel} />)
    act(() => {
      screen.getByRole('dialog', { hidden: true }).dispatchEvent(new Event('cancel', { cancelable: true }))
    })
    expect(onCancel).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Deleting…', hidden: true }).hasAttribute('disabled')).toBe(true)
  })

  it('links form errors to their fields and moves focus to the first invalid field', () => {
    render(<ActivityForm initialValues={emptyForm('transport')} submitLabel="Save" onSubmit={async () => undefined} onCancel={noop} />)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    const distance = screen.getByRole('textbox', { name: /Distance/ })
    expect(distance.getAttribute('aria-invalid')).toBe('true')
    const describedBy = distance.getAttribute('aria-describedby')!.split(' ')
    const errorText = describedBy.map((id) => document.getElementById(id)?.textContent).join(' ')
    expect(errorText).toContain('Enter the distance.')
    expect(document.activeElement).toBe(distance)
    expect(screen.getByRole('alert').textContent).toBe('Please correct the highlighted field.')
  })

  it('marks required fields in their labels', () => {
    render(<AuthForm />)
    expect(screen.getByLabelText(/Email/).getAttribute('required')).not.toBeNull()
    expect(screen.getByText('Email').parentElement?.textContent).toContain('(required)')
  })
})
