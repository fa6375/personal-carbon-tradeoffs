/**
 * The three comparison criteria and the priority levels. Names are translated
 * (compare.criteria.*, compare.levels.*) and read in the current language.
 */
import { t } from '../../i18n'
import type { IconName } from '../../types/icons'
import type { Criterion, Priorities, PriorityLevel } from './types'

interface CriterionInfo {
  id: Criterion
  label: string
  icon: IconName
  /** Short phrase used in reasons, e.g. "lowest emissions". */
  better: string
}

function criterion(id: Criterion, icon: IconName): CriterionInfo {
  return {
    id,
    icon,
    get label() {
      return t(`compare.criteria.${id}.label`)
    },
    get better() {
      return t(`compare.criteria.${id}.better`)
    },
  }
}

export const CRITERIA: CriterionInfo[] = [criterion('emissions', 'cloud'), criterion('cost', 'wallet'), criterion('time', 'clock')]

export function criterionLabel(id: Criterion): string {
  return t(`compare.criteria.${id}.label`)
}

const LEVEL_NAMES = ['none', 'little', 'important', 'very'] as const

export const PRIORITY_LEVELS: { value: PriorityLevel; label: string }[] = ([0, 1, 2, 3] as PriorityLevel[]).map(
  (value) => ({
    value,
    get label() {
      return priorityLabel(value)
    },
  }),
)

export function priorityLabel(level: PriorityLevel): string {
  const name = LEVEL_NAMES[level]
  return name ? t(`compare.levels.${name}`) : String(level)
}

export const DEFAULT_PRIORITIES: Priorities = { emissions: 3, cost: 2, time: 2 }

export function isPriorityLevel(value: unknown): value is PriorityLevel {
  return value === 0 || value === 1 || value === 2 || value === 3
}

/** English default (kept for code that needs a constant); the UI shows t('compare.noPriority'). */
export const NO_PRIORITY_ERROR = 'Mark at least one of CO₂, cost or travel time as important.'
