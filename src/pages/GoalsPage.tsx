import { useRef, useState } from 'react'
import { Button } from '../components/Button'
import { PageHeader } from '../components/PageHeader'
import { SectionHeading } from '../components/SectionHeading'
import { AdjustmentDetails } from '../features/goals/components/AdjustmentDetails'
import { BudgetAdjustmentForm } from '../features/goals/components/BudgetAdjustmentForm'
import { BudgetAllocation } from '../features/goals/components/BudgetAllocation'
import { BudgetSetup } from '../features/goals/components/BudgetSetup'
import { BudgetSummary } from '../features/goals/components/BudgetSummary'
import { GoalProgress } from '../features/goals/components/GoalProgress'
import { GoalPlanSyncBar } from '../features/goals/components/GoalPlanSyncBar'
import { AllocationWarning, LoadingLine } from '../features/goals/components/GoalsUi'
import { GoalsStepper } from '../features/goals/components/GoalsStepper'
import { MonthlyPlan } from '../features/goals/components/MonthlyPlan'
import { PersonalBudget } from '../features/goals/components/PersonalBudget'
import { ReductionOpportunities } from '../features/goals/components/ReductionOpportunities'
import { TradeoffPriorities } from '../features/goals/components/TradeoffPriorities'
import { toYearMonth } from '../features/goals/format'
import { dispatchGoalPlan, setGoalsStage, useGoalsSession } from '../features/goals/goalPlanStore'
import { retryGoalPlanLoad, useGoalPlanSync } from '../features/goals/goalPlanSync'
import { GOALS_STAGES } from '../features/goals/stages'
import { summariseTracked } from '../features/goals/trackedEmissions'
import type { GoalsStageId } from '../features/goals/types'
import { useActivities } from '../features/tracking/useActivities'
import { useAuth } from '../features/auth/authContext'
import '../features/goals/goals.css'
import { useI18n } from '../i18n'
import { dataErrorText } from '../lib/errorMessages'

/** Carbon Reduction Goals & Recommendations (Martin Mudrinić). */
export function GoalsPage() {
  const { t } = useI18n()
  const { plan, stageId } = useGoalsSession()
  // The plan is loaded from and saved to the signed-in user's account.
  const { user } = useAuth()
  const sync = useGoalPlanSync(user?.uid ?? null)
  const [selectedAdjustmentId, setSelectedAdjustmentId] = useState<string | null>(null)
  const [currentMonth] = useState(() => toYearMonth(new Date()))
  const stageRef = useRef<HTMLElement>(null)

  // Read-only use of the activities recorded in Personal Carbon Tracking.
  const { status, activities, error, reload } = useActivities()
  const tracked = summariseTracked(status, activities, error, reload)

  const stageIndex = GOALS_STAGES.findIndex((stage) => stage.id === stageId)
  const stage = GOALS_STAGES[stageIndex]
  const previous = GOALS_STAGES[stageIndex - 1]
  const next = GOALS_STAGES[stageIndex + 1]
  const dispatch = dispatchGoalPlan

  function goTo(id: GoalsStageId) {
    setGoalsStage(id)
    // Move focus to the new step so keyboard and screen reader users start there.
    requestAnimationFrame(() => {
      stageRef.current?.focus()
      stageRef.current?.scrollIntoView({ block: 'start' })
    })
  }

  const showAllocationWarning = stageId === 'plan' || stageId === 'track' || stageId === 'summary'

  return (
    <div className="goals-page">
      <PageHeader
        eyebrow={t('goals.eyebrow')}
        title={t('goals.title')}
        description={t('goals.description')}
      />

      {(sync.load === 'idle' || sync.load === 'loading') && <LoadingLine>{t('goals.loadingPlan')}</LoadingLine>}

      {sync.load === 'error' && (
        <div className="goals-sync goals-sync--error" role="alert">
          <p className="goals-sync__text">{t('goals.loadFailed', { error: dataErrorText(sync.error ?? 'unknown') })}</p>
          <div className="goals-sync__actions">
            <Button variant="secondary" onClick={retryGoalPlanLoad}>
              {t('actions.tryAgain')}
            </Button>
          </div>
        </div>
      )}

      {sync.load === 'ready' && (
        <>
          <GoalPlanSyncBar sync={sync} />

          <GoalsStepper stages={GOALS_STAGES} current={stageId} onSelect={goTo} />

          <section
            ref={stageRef}
            className="goals-stage"
            aria-labelledby="goals-stage-title"
            tabIndex={-1}
          >
            <SectionHeading
              id="goals-stage-title"
              title={t('goals.stepHeading', { number: stageIndex + 1, total: GOALS_STAGES.length, title: stage.title })}
              description={stage.description}
            />

            {showAllocationWarning && (
              <AllocationWarning allocation={plan.allocation} onFix={() => goTo('allocate')} />
            )}

            <div className="goals-stage__panels">
              {stageId === 'setup' && (
                <>
                  <BudgetSetup plan={plan} dispatch={dispatch} tracked={tracked} />
                  <PersonalBudget plan={plan} />
                </>
              )}
              {stageId === 'allocate' && (
                <>
                  <BudgetAllocation plan={plan} dispatch={dispatch} />
                  <TradeoffPriorities plan={plan} dispatch={dispatch} />
                </>
              )}
              {stageId === 'plan' && (
                <>
                  <MonthlyPlan plan={plan} currentMonth={currentMonth} />
                  <ReductionOpportunities plan={plan} dispatch={dispatch} />
                </>
              )}
              {stageId === 'track' && (
                <>
                  <GoalProgress plan={plan} tracked={tracked} currentMonth={currentMonth} />
                  <BudgetAdjustmentForm
                    plan={plan}
                    dispatch={dispatch}
                    onApplied={setSelectedAdjustmentId}
                  />
                  <AdjustmentDetails
                    plan={plan}
                    selectedId={selectedAdjustmentId}
                    onSelect={setSelectedAdjustmentId}
                  />
                </>
              )}
              {stageId === 'summary' && (
                <BudgetSummary
                  plan={plan}
                  dispatch={dispatch}
                  onEdit={goTo}
                  currentMonth={currentMonth}
                />
              )}
            </div>

            <div className="goals-stage__nav">
              {previous && (
                <Button variant="secondary" onClick={() => goTo(previous.id)}>
                  {t('goals.backTo', { step: previous.label })}
                </Button>
              )}
              {next && (
                <Button icon="arrow-right" onClick={() => goTo(next.id)}>
                  {t('goals.nextTo', { step: next.label })}
                </Button>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
