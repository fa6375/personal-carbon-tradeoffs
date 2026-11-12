import { t } from '../../i18n'
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
 * Texts are translated (goals.stages.<id>) and read in the current language.
 */
export const GOALS_STAGES: GoalsStage[] = (['setup', 'allocate', 'plan', 'track', 'summary'] as GoalsStageId[]).map(
  (id) => ({
    id,
    get label() {
      return t(`goals.stages.${id}.label`)
    },
    get title() {
      return t(`goals.stages.${id}.title`)
    },
    get description() {
      return t(`goals.stages.${id}.description`)
    },
  }),
)
