/** Types for the Carbon Reduction Goals & Recommendations feature. */
import type { ActivityCategory, ActivityDetails } from '../tracking/types'

/**
 * Goal categories are the same as the Personal Carbon Tracking categories,
 * so tracked emissions can be compared directly with the budget.
 */
export type CategoryId = ActivityCategory

/** Share of the monthly budget given to each category, in whole percent. */
export type Allocation = Record<CategoryId, number>

/** Amount of CO₂e per category, in kilograms. */
export type CategoryAmounts = Record<CategoryId, number>

/** Where the user's current monthly emissions (the starting point of the goal) come from. */
export type BaselineSource = 'sample' | 'tracked' | 'custom'

export interface Baseline {
  source: BaselineSource
  /** Current monthly emissions per category, in kg CO₂e. */
  amounts: CategoryAmounts
  /** ISO timestamp of when tracked data was read (source "tracked" only). */
  takenAt?: string
}

/** The trade-offs a user can rank when choosing how to cut emissions. */
export type PriorityId = 'cost' | 'time' | 'comfort' | 'impact'

export interface Priority {
  id: PriorityId
  label: string
  description: string
}

/** How an opportunity affects one trade-off compared with what the user does now. */
export type TradeoffEffect = 'better' | 'same' | 'worse'

export type Effort = 'low' | 'medium' | 'high'

export interface Opportunity {
  id: string
  categoryId: CategoryId
  title: string
  description: string
  /** The example monthly amounts behind the estimate, in plain language. */
  assumption: string
  /**
   * What a typical month looks like now and after the change, described as
   * Personal Carbon Tracking activities. The saving is calculated from these
   * with the same illustrative emission factors that Tracking uses.
   */
  before: ActivityDetails
  after: ActivityDetails
  cost: TradeoffEffect
  time: TradeoffEffect
  comfort: TradeoffEffect
  effort: Effort
}

interface AdjustmentBase {
  id: string
  /** ISO timestamp of when the adjustment was applied. */
  createdAt: string
  reason: string
  reductionBefore: number
  reductionAfter: number
  /** Final monthly budget before and after, in kg CO₂e. */
  budgetBefore: number
  budgetAfter: number
  allocationBefore: Allocation
  allocationAfter: Allocation
}

/** Part of the budget moved from one category to another; the total stays the same. */
export interface ReallocationAdjustment extends AdjustmentBase {
  kind: 'reallocate'
  from: CategoryId
  to: CategoryId
  /** Percentage points moved. */
  percentPoints: number
}

/** The reduction goal, and with it the whole monthly budget, changed. */
export interface GoalChangeAdjustment extends AdjustmentBase {
  kind: 'goal'
}

export type BudgetAdjustment = ReallocationAdjustment | GoalChangeAdjustment

export interface GoalPlan {
  baseline: Baseline
  /** Planned reduction compared with the baseline, in percent. */
  reductionPercent: number
  durationMonths: number
  /** First month of the plan, formatted as "YYYY-MM". */
  startMonth: string
  allocation: Allocation
  /** Trade-off priorities, most important first. */
  priorities: PriorityId[]
  selectedOpportunityIds: string[]
  /** Newest first. */
  adjustments: BudgetAdjustment[]
}

export type GoalsStageId = 'setup' | 'allocate' | 'plan' | 'track' | 'summary'
