import type { IconName } from '../../types/icons'
import type { Criterion, Priorities, PriorityLevel } from './types'

export const CRITERIA: { id: Criterion; label: string; icon: IconName; better: string }[] = [
  { id: 'emissions', label: 'CO₂ emissions', icon: 'cloud', better: 'lowest emissions' },
  { id: 'cost', label: 'Cost', icon: 'wallet', better: 'lowest cost' },
  { id: 'time', label: 'Travel time', icon: 'clock', better: 'fastest journey' },
]

export const CRITERION_LABELS: Record<Criterion, string> = {
  emissions: 'CO₂ emissions',
  cost: 'Cost',
  time: 'Travel time',
}

export const PRIORITY_LEVELS: { value: PriorityLevel; label: string }[] = [
  { value: 0, label: 'Not important' },
  { value: 1, label: 'A little' },
  { value: 2, label: 'Important' },
  { value: 3, label: 'Very important' },
]

export function priorityLabel(level: PriorityLevel): string {
  return PRIORITY_LEVELS.find((entry) => entry.value === level)?.label ?? String(level)
}

export const DEFAULT_PRIORITIES: Priorities = { emissions: 3, cost: 2, time: 2 }

export function isPriorityLevel(value: unknown): value is PriorityLevel {
  return value === 0 || value === 1 || value === 2 || value === 3
}

export const NO_PRIORITY_ERROR = 'Mark at least one of CO₂, cost or travel time as important.'
