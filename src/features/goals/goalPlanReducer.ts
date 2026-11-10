/*
 * State changes for the user's carbon plan.
 *
 * The reducer is pure: ids and timestamps are created by the caller. The plan
 * is held in memory only (see goalPlanStore.ts); saving it to the project
 * database is planned but not implemented.
 */
import { allocationFromAmounts, getBudgetKg } from './budget'
import { toYearMonth } from './format'
import { DEFAULT_PRIORITIES, REDUCTION_LIMITS, SAMPLE_BASELINE } from './sampleData'
import type { Baseline, CategoryId, GoalPlan, PriorityId } from './types'

export type GoalPlanAction =
  | { type: 'setBaseline'; baseline: Baseline }
  | { type: 'setReduction'; percent: number }
  | { type: 'setDuration'; months: number }
  | { type: 'setStartMonth'; month: string }
  | { type: 'setAllocation'; category: CategoryId; percent: number }
  | { type: 'resetAllocation' }
  | { type: 'movePriority'; id: PriorityId; direction: 'up' | 'down' }
  | { type: 'toggleOpportunity'; id: string }
  | {
      type: 'reallocate'
      id: string
      createdAt: string
      from: CategoryId
      to: CategoryId
      percentPoints: number
      reason: string
    }
  | { type: 'changeGoal'; id: string; createdAt: string; reductionPercent: number; reason: string }
  | { type: 'resetPlan' }

export function createInitialPlan(): GoalPlan {
  return {
    baseline: { source: 'sample', amounts: { ...SAMPLE_BASELINE } },
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

export function isValidReduction(value: number): boolean {
  return Number.isInteger(value) && value >= REDUCTION_LIMITS.min && value <= REDUCTION_LIMITS.max
}

export function goalPlanReducer(plan: GoalPlan, action: GoalPlanAction): GoalPlan {
  switch (action.type) {
    case 'setBaseline':
      return { ...plan, baseline: action.baseline }

    case 'setReduction':
      return isValidReduction(action.percent) ? { ...plan, reductionPercent: action.percent } : plan

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
      return { ...plan, allocation: allocationFromAmounts(plan.baseline.amounts) }

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

    case 'reallocate': {
      const { from, to, percentPoints } = action
      if (
        from === to ||
        !Number.isInteger(percentPoints) ||
        percentPoints <= 0 ||
        percentPoints > plan.allocation[from]
      ) {
        return plan
      }
      const allocationAfter = {
        ...plan.allocation,
        [from]: plan.allocation[from] - percentPoints,
        [to]: plan.allocation[to] + percentPoints,
      }
      const budget = getBudgetKg(plan)
      return {
        ...plan,
        allocation: allocationAfter,
        adjustments: [
          {
            kind: 'reallocate',
            id: action.id,
            createdAt: action.createdAt,
            reason: action.reason,
            from,
            to,
            percentPoints,
            reductionBefore: plan.reductionPercent,
            reductionAfter: plan.reductionPercent,
            budgetBefore: budget,
            budgetAfter: budget,
            allocationBefore: plan.allocation,
            allocationAfter,
          },
          ...plan.adjustments,
        ],
      }
    }

    case 'changeGoal': {
      if (!isValidReduction(action.reductionPercent)) return plan
      if (action.reductionPercent === plan.reductionPercent) return plan
      const next = { ...plan, reductionPercent: action.reductionPercent }
      return {
        ...next,
        adjustments: [
          {
            kind: 'goal',
            id: action.id,
            createdAt: action.createdAt,
            reason: action.reason,
            reductionBefore: plan.reductionPercent,
            reductionAfter: action.reductionPercent,
            budgetBefore: getBudgetKg(plan),
            budgetAfter: getBudgetKg(next),
            allocationBefore: plan.allocation,
            allocationAfter: plan.allocation,
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
