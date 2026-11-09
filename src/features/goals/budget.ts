/*
 * Budget arithmetic for the Goals feature.
 *
 * These helpers only split and compare budget numbers (percentages, sums,
 * targets). They do not calculate emissions from activities; emission values
 * come from the sample data until Personal Carbon Tracking and the emissions
 * API are connected.
 */
import { CATEGORY_IDS, SAMPLE_BASELINE, SAMPLE_OPPORTUNITIES } from './sampleData'
import type {
  Allocation,
  CategoryAmounts,
  GoalPlan,
  Opportunity,
  PriorityId,
  TradeoffEffect,
} from './types'

export function sumAmounts(amounts: CategoryAmounts): number {
  return CATEGORY_IDS.reduce((total, id) => total + amounts[id], 0)
}

export const SAMPLE_BASELINE_TOTAL = sumAmounts(SAMPLE_BASELINE)

/** Monthly budget in kg CO₂e after the planned reduction. */
export function getBudgetKg(plan: Pick<GoalPlan, 'reductionPercent'>): number {
  return Math.round(SAMPLE_BASELINE_TOTAL * (1 - plan.reductionPercent / 100))
}

export function getAllocationTotal(allocation: Allocation): number {
  return sumAmounts(allocation)
}

/** Converts a percentage share of the budget into kg CO₂e. */
export function shareToKg(budgetKg: number, percent: number): number {
  return Math.round((budgetKg * percent) / 100)
}

/**
 * Splits 100% across categories in proportion to the given amounts, using
 * largest-remainder rounding so the whole percentages always add up to 100.
 */
export function allocationFromAmounts(amounts: CategoryAmounts): Allocation {
  const total = sumAmounts(amounts)
  const exact = CATEGORY_IDS.map((id) => ({ id, value: (amounts[id] / total) * 100 }))
  const allocation = Object.fromEntries(
    exact.map(({ id, value }) => [id, Math.floor(value)]),
  ) as Allocation

  let remaining = 100 - getAllocationTotal(allocation)
  const byRemainder = [...exact].sort(
    (a, b) => (b.value % 1) - (a.value % 1),
  )
  for (const { id } of byRemainder) {
    if (remaining <= 0) break
    allocation[id] += 1
    remaining -= 1
  }
  return allocation
}

export interface MonthlyTarget {
  index: number
  targetKg: number
  reductionKg: number
}

/** Steps the monthly target evenly from the sample baseline down to the budget. */
export function getMonthlyTargets(plan: GoalPlan): MonthlyTarget[] {
  const budgetKg = getBudgetKg(plan)
  const gap = SAMPLE_BASELINE_TOTAL - budgetKg
  return Array.from({ length: plan.durationMonths }, (_, index) => {
    const targetKg = Math.round(
      SAMPLE_BASELINE_TOTAL - (gap * (index + 1)) / plan.durationMonths,
    )
    return { index, targetKg, reductionKg: SAMPLE_BASELINE_TOTAL - targetKg }
  })
}

const EFFECT_SCORE: Record<TradeoffEffect, number> = { better: 1, same: 0, worse: -1 }
const MAX_SAMPLE_SAVING = Math.max(...SAMPLE_OPPORTUNITIES.map((o) => o.sampleSavingKg))

/**
 * Orders opportunities by how well they fit the user's ranked priorities.
 * Higher-ranked priorities carry more weight. This is a simple ranking rule
 * for the prototype, not an emissions model.
 */
export function rankOpportunities(
  opportunities: Opportunity[],
  priorities: PriorityId[],
): Opportunity[] {
  const score = (opportunity: Opportunity) =>
    priorities.reduce((total, priority, rank) => {
      const weight = priorities.length - rank
      const value =
        priority === 'impact'
          ? opportunity.sampleSavingKg / MAX_SAMPLE_SAVING
          : EFFECT_SCORE[opportunity[priority]]
      return total + weight * value
    }, 0)

  return [...opportunities].sort((a, b) => score(b) - score(a))
}

export type PaceStatus = 'on-track' | 'close' | 'over'

/**
 * Compares the share of a budget already used with the share of the month
 * that has passed.
 */
export function getPaceStatus(usedKg: number, budgetKg: number, monthElapsed: number): PaceStatus {
  if (budgetKg <= 0) return usedKg > 0 ? 'over' : 'on-track'
  const usedShare = usedKg / budgetKg
  if (usedShare > 1) return 'over'
  if (usedShare > monthElapsed + 0.05) return 'close'
  return 'on-track'
}
