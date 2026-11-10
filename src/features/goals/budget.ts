/*
 * Budget calculations for the Goals feature.
 *
 * Everything that depends on the plan is derived here from the plan state,
 * so changing one value (baseline, reduction goal, timeframe, allocation)
 * updates every screen. Amounts are kept to 0.1 kg CO₂e.
 *
 * Emissions are not estimated here. Recommendation savings use the
 * Personal Carbon Tracking emission factors (calculateEmissions), so Goals,
 * Tracking and Compare give the same figure for the same activity.
 */
import { calculateEmissions } from '../tracking/emissionFactors'
import { CATEGORY_IDS } from './sampleData'
import type {
  Allocation,
  CategoryAmounts,
  CategoryId,
  GoalPlan,
  Opportunity,
  PriorityId,
  TradeoffEffect,
} from './types'

/** Rounds to one decimal place (0.1 kg). */
export function roundKg(kg: number): number {
  return Math.round(kg * 10) / 10
}

export function sumAmounts(amounts: CategoryAmounts): number {
  return roundKg(CATEGORY_IDS.reduce((total, id) => total + amounts[id], 0))
}

export function emptyAmounts(): CategoryAmounts {
  return { transport: 0, food: 0, home: 0 }
}

/** Current monthly emissions the goal starts from. */
export function getBaselineKg(plan: Pick<GoalPlan, 'baseline'>): number {
  return sumAmounts(plan.baseline.amounts)
}

/** Final monthly budget in kg CO₂e after the planned reduction. */
export function getBudgetKg(plan: Pick<GoalPlan, 'baseline' | 'reductionPercent'>): number {
  return roundKg(getBaselineKg(plan) * (1 - plan.reductionPercent / 100))
}

export function getAllocationTotal(allocation: Allocation): number {
  return CATEGORY_IDS.reduce((total, id) => total + allocation[id], 0)
}

/**
 * Splits an amount of kg across categories by the allocation percentages,
 * using largest-remainder rounding (in 0.1 kg steps) so the parts add up
 * exactly to the share of the total that is allocated.
 */
export function splitKg(totalKg: number, allocation: Allocation): CategoryAmounts {
  const tenths = Math.round(totalKg * 10)
  const exact = CATEGORY_IDS.map((id) => ({ id, value: (tenths * allocation[id]) / 100 }))
  const parts = Object.fromEntries(exact.map(({ id, value }) => [id, Math.floor(value)])) as Record<
    CategoryId,
    number
  >
  const target = Math.round(exact.reduce((sum, { value }) => sum + value, 0))
  let remaining = target - CATEGORY_IDS.reduce((sum, id) => sum + parts[id], 0)
  for (const { id } of [...exact].sort((a, b) => (b.value % 1) - (a.value % 1))) {
    if (remaining <= 0) break
    parts[id] += 1
    remaining -= 1
  }
  return Object.fromEntries(CATEGORY_IDS.map((id) => [id, parts[id] / 10])) as CategoryAmounts
}

/** Kg for one category's share of a total, consistent with splitKg. */
export function shareToKg(totalKg: number, allocation: Allocation, category: CategoryId): number {
  return splitKg(totalKg, allocation)[category]
}

/**
 * Splits 100% across categories in proportion to the given amounts, using
 * largest-remainder rounding so the whole percentages always add up to 100.
 * With no emissions at all, the budget is split evenly.
 */
export function allocationFromAmounts(amounts: CategoryAmounts): Allocation {
  const total = CATEGORY_IDS.reduce((sum, id) => sum + amounts[id], 0)
  const exact = CATEGORY_IDS.map((id) => ({
    id,
    value: total > 0 ? (amounts[id] / total) * 100 : 100 / CATEGORY_IDS.length,
  }))
  const allocation = Object.fromEntries(
    exact.map(({ id, value }) => [id, Math.floor(value)]),
  ) as Allocation
  let remaining = 100 - getAllocationTotal(allocation)
  for (const { id } of [...exact].sort((a, b) => (b.value % 1) - (a.value % 1))) {
    if (remaining <= 0) break
    allocation[id] += 1
    remaining -= 1
  }
  return allocation
}

/** Number of whole months from one "YYYY-MM" to another (negative if earlier). */
export function monthsBetween(from: string, to: string): number {
  const [fromYear, fromMonth] = from.split('-').map(Number)
  const [toYear, toMonth] = to.split('-').map(Number)
  return (toYear - fromYear) * 12 + (toMonth - fromMonth)
}

export interface MonthlyTarget {
  index: number
  targetKg: number
  /** How much lower than the baseline this month's target is. */
  reductionKg: number
}

/**
 * Steps the monthly target evenly from the baseline down to the final budget,
 * reaching the budget in the last month of the plan.
 */
export function getMonthlyTargets(plan: GoalPlan): MonthlyTarget[] {
  const baselineKg = getBaselineKg(plan)
  const gap = baselineKg - getBudgetKg(plan)
  return Array.from({ length: plan.durationMonths }, (_, index) => {
    const targetKg = roundKg(baselineKg - (gap * (index + 1)) / plan.durationMonths)
    return { index, targetKg, reductionKg: roundKg(baselineKg - targetKg) }
  })
}

export type PlanTiming = 'not-started' | 'active' | 'finished'

export interface PlanMonth {
  timing: PlanTiming
  /** Index of the plan month whose target applies to the given month. */
  index: number
  targetKg: number
}

/**
 * The target that applies in a given month. Before the plan starts the first
 * month's target is used; after it ends, the final budget stays in place.
 */
export function getPlanMonth(plan: GoalPlan, yearMonth: string): PlanMonth {
  const targets = getMonthlyTargets(plan)
  const offset = monthsBetween(plan.startMonth, yearMonth)
  if (offset < 0) return { timing: 'not-started', index: 0, targetKg: targets[0].targetKg }
  if (offset >= targets.length) {
    const last = targets[targets.length - 1]
    return { timing: 'finished', index: last.index, targetKg: last.targetKg }
  }
  return { timing: 'active', index: offset, targetKg: targets[offset].targetKg }
}

/** How much each category has to come down by the end of the plan (never below 0). */
export function getCategoryGaps(plan: GoalPlan): CategoryAmounts {
  const finalSplit = splitKg(getBudgetKg(plan), plan.allocation)
  return Object.fromEntries(
    CATEGORY_IDS.map((id) => [id, roundKg(Math.max(0, plan.baseline.amounts[id] - finalSplit[id]))]),
  ) as CategoryAmounts
}

/** Estimated monthly saving of an opportunity, using the Tracking emission factors. */
export function getSavingKg(opportunity: Opportunity): number {
  return roundKg(
    Math.max(0, calculateEmissions(opportunity.before) - calculateEmissions(opportunity.after)),
  )
}

export function getSavingsByCategory(opportunities: Opportunity[]): CategoryAmounts {
  const totals = emptyAmounts()
  for (const opportunity of opportunities) {
    totals[opportunity.categoryId] = roundKg(totals[opportunity.categoryId] + getSavingKg(opportunity))
  }
  return totals
}

const EFFECT_SCORE: Record<TradeoffEffect, number> = { better: 1, same: 0, worse: -1 }

/** How well an opportunity does on one priority; higher is better. */
function priorityValue(opportunity: Opportunity, priority: PriorityId): number {
  return priority === 'impact' ? getSavingKg(opportunity) : EFFECT_SCORE[opportunity[priority]]
}

/**
 * Orders opportunities for the user. This is a simple, explainable rule for
 * the prototype, not an emissions model:
 *   1. ideas in categories that still need cutting come first;
 *   2. then ideas are sorted by the user's most important priority
 *      ("Cut the most emissions" = largest saving; cost, time and comfort =
 *      better, then same, then worse);
 *   3. ties are broken by the next priority, and so on.
 */
export function rankOpportunities(
  opportunities: Opportunity[],
  priorities: PriorityId[],
  gaps: CategoryAmounts,
): Opportunity[] {
  return [...opportunities].sort((a, b) => {
    const needed = Number(gaps[b.categoryId] > 0) - Number(gaps[a.categoryId] > 0)
    if (needed !== 0) return needed
    for (const priority of priorities) {
      const difference = priorityValue(b, priority) - priorityValue(a, priority)
      if (Math.abs(difference) > 0.05) return difference
    }
    return 0
  })
}

export type PaceStatus = 'on-track' | 'close' | 'over'

/**
 * Compares the share of a budget already used with the share of the month
 * that has passed. "close" means usage is running more than 5 percentage
 * points ahead of the calendar.
 */
export function getPaceStatus(usedKg: number, budgetKg: number, monthElapsed: number): PaceStatus {
  if (budgetKg <= 0) return usedKg > 0 ? 'over' : 'on-track'
  const usedShare = usedKg / budgetKg
  if (usedShare > 1) return 'over'
  if (usedShare > monthElapsed + 0.05) return 'close'
  return 'on-track'
}

/** Share of a budget used, as a whole percentage (can exceed 100). */
export function usedPercent(usedKg: number, budgetKg: number): number {
  if (budgetKg <= 0) return usedKg > 0 ? 100 : 0
  return Math.round((usedKg / budgetKg) * 100)
}
