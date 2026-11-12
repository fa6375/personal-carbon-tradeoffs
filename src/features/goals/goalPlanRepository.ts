/**
 * Cloud Firestore storage for the user's carbon plan.
 *
 * Each user has one active plan, stored as a single document at
 * users/{uid}/goalPlans/current. The plan holds the reduction goal, the
 * monthly budget settings, the category allocation, the trade-off priorities,
 * the chosen reduction opportunities and the history of budget adjustments.
 * They are always read and changed together, so one document is simpler and
 * cheaper than separate goal, budget and adjustment collections.
 *
 * Goal progress is NOT stored: it is calculated from the activities in
 * users/{uid}/activities, so it can never go out of date.
 */
import {
  deleteDoc,
  doc,
  getDocFromServer,
  serverTimestamp,
  setDoc,
  updateDoc,
  Timestamp,
  type Firestore,
} from 'firebase/firestore'
import { DataError, toDataError, withTimeout } from '../../lib/dataErrors'
import type { GoalPlan } from './types'

export const GOAL_PLAN_SCHEMA_VERSION = 1

export interface StoredGoalPlan {
  plan: GoalPlan
  /** ISO timestamp (UTC) of when the plan was first saved. */
  createdAt: string | null
}

export interface GoalPlanRepository {
  load(): Promise<StoredGoalPlan | null>
  /** Creates the document the first time (`exists` false), otherwise updates it. */
  save(plan: GoalPlan, exists: boolean): Promise<void>
  remove(): Promise<void>
}

const CATEGORY_KEYS = ['transport', 'food', 'home'] as const

function isAmounts(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    CATEGORY_KEYS.every((key) => typeof (value as Record<string, unknown>)[key] === 'number')
  )
}

/** Checks the shape of a stored plan before the screens use it. */
export function isGoalPlan(value: unknown): value is GoalPlan {
  if (typeof value !== 'object' || value === null) return false
  const plan = value as Record<string, unknown>
  const baseline = plan.baseline as Record<string, unknown> | undefined
  return (
    typeof baseline === 'object' &&
    baseline !== null &&
    ['sample', 'tracked', 'custom'].includes(String(baseline.source)) &&
    isAmounts(baseline.amounts) &&
    typeof plan.reductionPercent === 'number' &&
    typeof plan.durationMonths === 'number' &&
    typeof plan.startMonth === 'string' &&
    isAmounts(plan.allocation) &&
    Array.isArray(plan.priorities) &&
    Array.isArray(plan.selectedOpportunityIds) &&
    Array.isArray(plan.adjustments)
  )
}

/** Plain JSON copy: drops undefined fields, which Firestore does not accept. */
function toDocument(plan: GoalPlan) {
  const copy = JSON.parse(JSON.stringify(plan)) as GoalPlan
  return {
    baseline: copy.baseline,
    reductionPercent: copy.reductionPercent,
    durationMonths: copy.durationMonths,
    startMonth: copy.startMonth,
    allocation: copy.allocation,
    priorities: copy.priorities,
    selectedOpportunityIds: copy.selectedOpportunityIds,
    adjustments: copy.adjustments,
    schemaVersion: GOAL_PLAN_SCHEMA_VERSION,
  }
}

export function createFirestoreGoalPlanRepository(db: Firestore, uid: string): GoalPlanRepository {
  const ref = doc(db, 'users', uid, 'goalPlans', 'current')
  return {
    async load() {
      try {
        const snapshot = await withTimeout(getDocFromServer(ref))
        if (!snapshot.exists()) return null
        const data = snapshot.data()
        const { createdAt, ...rest } = data
        if (!isGoalPlan(rest)) throw new DataError('invalid-data')
        const plan = toDocument(rest)
        return {
          plan: {
            baseline: plan.baseline,
            reductionPercent: plan.reductionPercent,
            durationMonths: plan.durationMonths,
            startMonth: plan.startMonth,
            allocation: plan.allocation,
            priorities: plan.priorities,
            selectedOpportunityIds: plan.selectedOpportunityIds,
            adjustments: plan.adjustments,
          },
          createdAt: createdAt instanceof Timestamp ? createdAt.toDate().toISOString() : null,
        }
      } catch (reason) {
        throw toDataError(reason)
      }
    },
    async save(plan, exists) {
      try {
        // updateDoc replaces each top-level field as a whole, so removed keys do not linger,
        // and it leaves createdAt untouched.
        await withTimeout(
          exists
            ? updateDoc(ref, { ...toDocument(plan), updatedAt: serverTimestamp() })
            : setDoc(ref, { ...toDocument(plan), createdAt: serverTimestamp(), updatedAt: serverTimestamp() }),
        )
      } catch (reason) {
        throw toDataError(reason)
      }
    },
    async remove() {
      try {
        await withTimeout(deleteDoc(ref))
      } catch (reason) {
        throw toDataError(reason)
      }
    },
  }
}
