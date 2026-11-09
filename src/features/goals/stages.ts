import type { GoalsStageId } from './types'

export interface GoalsStage {
  id: GoalsStageId
  label: string
  title: string
  description: string
}

/**
 * The Goals feature groups Martin's ten Deliverable 1 screens into five steps:
 *  1 Set up    – Carbon budget setup, Personal carbon budget
 *  2 Allocate  – Budget allocation by category, Trade-off priorities
 *  3 Plan      – Monthly carbon plan, Reduction opportunities
 *  4 Track     – Goal progress, Budget adjustment, Budget adjustment details
 *  5 Summary   – Carbon budget summary
 */
export const GOALS_STAGES: GoalsStage[] = [
  {
    id: 'setup',
    label: 'Set up',
    title: 'Set your carbon budget',
    description: 'Decide how far and how fast you want to reduce your emissions.',
  },
  {
    id: 'allocate',
    label: 'Allocate',
    title: 'Allocate your budget',
    description: 'Split your budget across categories and choose what matters most.',
  },
  {
    id: 'plan',
    label: 'Plan',
    title: 'Plan your months',
    description: 'See your monthly targets and pick changes that fit your priorities.',
  },
  {
    id: 'track',
    label: 'Track',
    title: 'Track and adjust',
    description: 'Check how this month is going and move budget where you need it.',
  },
  {
    id: 'summary',
    label: 'Summary',
    title: 'Your carbon budget',
    description: 'Review your whole plan.',
  },
]
