/*
 * In-memory state for the user's carbon plan.
 *
 * The plan lives only in React state: it is lost on reload. Saving to the
 * project database is planned but not implemented.
 */
import { allocationFromAmounts, getBudgetKg } from './budget'
import { toYearMonth } from './format'
import { DEFAULT_PRIORITIES, SAMPLE_BASELINE } from './sampleData'
import type { CategoryId, GoalPlan, PriorityId } from './types'

export type GoalPlanAction =
  | { type: 'setReduction'; percent: number }
  | { type: 'setDuration'; months: number }
  | { type: 'setStartMonth'; month: string }
  | { type: 'setAllocation'; category: CategoryId; percent: number }
  | { type: 'resetAllocation' }
  | { type: 'movePriority'; id: PriorityId; direction: 'up' | 'down' }
  | { type: 'toggleOpportunity'; id: string }
  | {
      type: 'applyAdjustment'
      id: string
      createdAt: string
      from: CategoryId
      to: CategoryId
      percentPoints: number
      reason: string
    }
  | { type: 'resetPlan' }

export function createInitialPlan(): GoalPlan {
  return {
    reductionPercent: 20,
    durationMonths: 6,
    startMonth: toYearMonth(new Date()),
    allocation: allocationFromAmounts(SAMPLE_BASELINE),
    priorities: [...DEFAULT_PRIORITIES],
    selectedOpportunityIds: [],
    adjustments: [],
  }
}

function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.min(100, Math.max(0, Math.round(value)))
}

export function goalPlanReducer(plan: GoalPlan, action: GoalPlanAction): GoalPlan {
  switch (action.type) {
    case 'setReduction':
      return { ...plan, reductionPercent: action.percent }

    case 'setDuration':
      return { ...plan, durationMonths: action.months }

    case 'setStartMonth':
      return { ...plan, startMonth: action.month }

    case 'setAllocation':
      return {
        ...plan,
        allocation: { ...plan.allocation, [action.category]: clampPercent(action.percent) },
      }

    case 'resetAllocation':
      return { ...plan, allocation: allocationFromAmounts(SAMPLE_BASELINE) }

    case 'movePriority': {
      const index = plan.priorities.indexOf(action.id)
      const target = action.direction === 'up' ? index - 1 : index + 1
      if (index < 0 || target < 0 || target >= plan.priorities.length) return plan
      const priorities = [...plan.priorities]
      ;[priorities[index], priorities[target]] = [priorities[target], priorities[index]]
      return { ...plan, priorities }
    }

    case 'toggleOpportunity': {
      const selected = plan.selectedOpportunityIds.includes(action.id)
      return {
        ...plan,
        selectedOpportunityIds: selected
          ? plan.selectedOpportunityIds.filter((id) => id !== action.id)
          : [...plan.selectedOpportunityIds, action.id],
      }
    }

    case 'applyAdjustment': {
      const { from, to, percentPoints } = action
      if (from === to || percentPoints <= 0 || percentPoints > plan.allocation[from]) {
        return plan
      }
      const allocationAfter = {
        ...plan.allocation,
        [from]: plan.allocation[from] - percentPoints,
        [to]: plan.allocation[to] + percentPoints,
      }
      return {
        ...plan,
        allocation: allocationAfter,
        adjustments: [
          {
            id: action.id,
            createdAt: action.createdAt,
            from,
            to,
            percentPoints,
            reason: action.reason,
            budgetKg: getBudgetKg(plan),
            allocationBefore: plan.allocation,
            allocationAfter,
          },
          ...plan.adjustments,
        ],
      }
    }

    case 'resetPlan':
      return { ...createInitialPlan(), startMonth: plan.startMonth }

    default:
      return plan
  }
}
