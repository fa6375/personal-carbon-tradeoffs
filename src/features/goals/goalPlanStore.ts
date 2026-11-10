/*
 * In-memory store for the Goals feature.
 *
 * Keeps the plan and the current step outside the page component, so they are
 * kept while the user visits Compare or Carbon tracking and comes back. It is
 * NOT persistent storage: everything is lost when the page is reloaded or the
 * tab is closed. Saving plans to the project database is planned but not
 * implemented.
 */
import { useSyncExternalStore } from 'react'
import { createInitialPlan, goalPlanReducer, type GoalPlanAction } from './goalPlanReducer'
import type { GoalPlan, GoalsStageId } from './types'

export interface GoalsSession {
  plan: GoalPlan
  stageId: GoalsStageId
}

let session: GoalsSession | null = null
const listeners = new Set<() => void>()

function getSession(): GoalsSession {
  if (!session) session = { plan: createInitialPlan(), stageId: 'setup' }
  return session
}

function update(next: GoalsSession) {
  session = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function dispatchGoalPlan(action: GoalPlanAction): void {
  const current = getSession()
  const plan = goalPlanReducer(current.plan, action)
  if (plan !== current.plan) update({ ...current, plan })
}

export function setGoalsStage(stageId: GoalsStageId): void {
  const current = getSession()
  if (current.stageId !== stageId) update({ ...current, stageId })
}

export function useGoalsSession(): GoalsSession {
  return useSyncExternalStore(subscribe, getSession)
}
