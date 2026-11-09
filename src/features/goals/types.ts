/** Types for the Carbon Reduction Goals & Recommendations feature. */

export type CategoryId = 'transport' | 'food' | 'home' | 'goods'

export interface Category {
  id: CategoryId
  label: string
  description: string
}

/** Share of the monthly budget given to each category, in whole percent. */
export type Allocation = Record<CategoryId, number>

/** Amount of CO₂e per category, in kilograms. */
export type CategoryAmounts = Record<CategoryId, number>

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
  /** Illustrative monthly saving in kg CO₂e. Sample value, not a calculation. */
  sampleSavingKg: number
  cost: TradeoffEffect
  time: TradeoffEffect
  comfort: TradeoffEffect
  effort: Effort
}

export interface BudgetAdjustment {
  id: string
  /** ISO timestamp of when the adjustment was applied. */
  createdAt: string
  from: CategoryId
  to: CategoryId
  /** Percentage points moved from one category to the other. */
  percentPoints: number
  reason: string
  /** Monthly budget at the time of the adjustment, in kg CO₂e. */
  budgetKg: number
  allocationBefore: Allocation
  allocationAfter: Allocation
}

export interface GoalPlan {
  /** Planned reduction compared with the sample baseline, in percent. */
  reductionPercent: number
  durationMonths: number
  /** First month of the plan, formatted as "YYYY-MM". */
  startMonth: string
  allocation: Allocation
  /** Trade-off priorities, most important first. */
  priorities: PriorityId[]
  selectedOpportunityIds: string[]
  adjustments: BudgetAdjustment[]
}

export type GoalsStageId = 'setup' | 'allocate' | 'plan' | 'track' | 'summary'
