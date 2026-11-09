import { useReducer, useRef, useState } from 'react'
import { Button } from '../components/Button'
import { PageHeader } from '../components/PageHeader'
import { SectionHeading } from '../components/SectionHeading'
import { AdjustmentDetails } from '../features/goals/components/AdjustmentDetails'
import { BudgetAdjustmentForm } from '../features/goals/components/BudgetAdjustmentForm'
import { BudgetAllocation } from '../features/goals/components/BudgetAllocation'
import { BudgetSetup } from '../features/goals/components/BudgetSetup'
import { BudgetSummary } from '../features/goals/components/BudgetSummary'
import { GoalProgress } from '../features/goals/components/GoalProgress'
import { GoalsStepper } from '../features/goals/components/GoalsStepper'
import { MonthlyPlan } from '../features/goals/components/MonthlyPlan'
import { PersonalBudget } from '../features/goals/components/PersonalBudget'
import { ReductionOpportunities } from '../features/goals/components/ReductionOpportunities'
import { TradeoffPriorities } from '../features/goals/components/TradeoffPriorities'
import { createInitialPlan, goalPlanReducer } from '../features/goals/goalPlanReducer'
import { GOALS_STAGES } from '../features/goals/stages'
import type { GoalsStageId } from '../features/goals/types'
import '../features/goals/goals.css'

/** Carbon Reduction Goals & Recommendations (Martin Mudrinic). */
export function GoalsPage() {
  const [plan, dispatch] = useReducer(goalPlanReducer, undefined, createInitialPlan)
  const [stageId, setStageId] = useState<GoalsStageId>('setup')
  const [selectedAdjustmentId, setSelectedAdjustmentId] = useState<string | null>(null)
  const stageRef = useRef<HTMLElement>(null)

  const stageIndex = GOALS_STAGES.findIndex((stage) => stage.id === stageId)
  const stage = GOALS_STAGES[stageIndex]
  const previous = GOALS_STAGES[stageIndex - 1]
  const next = GOALS_STAGES[stageIndex + 1]

  function goTo(id: GoalsStageId) {
    setStageId(id)
    // Move focus to the new step so keyboard and screen reader users start there.
    requestAnimationFrame(() => {
      stageRef.current?.focus()
      stageRef.current?.scrollIntoView({ block: 'start' })
    })
  }

  return (
    <div className="goals-page">
      <PageHeader
        eyebrow="Carbon goals"
        title="Carbon reduction goals"
        description="Set a monthly carbon budget, share it across the parts of your life, and find changes that fit how you want to live."
      />

      <GoalsStepper stages={GOALS_STAGES} current={stageId} onSelect={goTo} />

      <section
        ref={stageRef}
        className="goals-stage"
        aria-labelledby="goals-stage-title"
        tabIndex={-1}
      >
        <SectionHeading
          id="goals-stage-title"
          title={`Step ${stageIndex + 1}: ${stage.title}`}
          description={stage.description}
        />

        <div className="goals-stage__panels">
          {stageId === 'setup' && (
            <>
              <BudgetSetup plan={plan} dispatch={dispatch} />
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
              <MonthlyPlan plan={plan} />
              <ReductionOpportunities plan={plan} dispatch={dispatch} />
            </>
          )}
          {stageId === 'track' && (
            <>
              <GoalProgress plan={plan} />
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
            <BudgetSummary plan={plan} dispatch={dispatch} onEdit={goTo} />
          )}
        </div>

        <div className="goals-stage__nav">
          {previous && (
            <Button variant="secondary" onClick={() => goTo(previous.id)}>
              Back: {previous.label}
            </Button>
          )}
          {next && (
            <Button icon="arrow-right" onClick={() => goTo(next.id)}>
              Next: {next.label}
            </Button>
          )}
        </div>
      </section>
    </div>
  )
}
