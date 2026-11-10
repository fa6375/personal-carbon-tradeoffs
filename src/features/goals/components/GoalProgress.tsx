import { ButtonLink } from '../../../components/ButtonLink'
import {
  getPaceStatus,
  getPlanMonth,
  roundKg,
  splitKg,
  sumAmounts,
  usedPercent,
} from '../budget'
import { formatCount, formatKg, formatMonth, getMonthProgress } from '../format'
import { CATEGORIES, SAMPLE_CURRENT_USAGE, SAMPLE_DAY } from '../sampleData'
import type { TrackedData } from '../trackedEmissions'
import type { CategoryAmounts, GoalPlan } from '../types'
import {
  ErrorLine,
  LoadingLine,
  Notice,
  Panel,
  ProgressBar,
  SampleDataNotice,
  StatusBadge,
} from './GoalsUi'

interface GoalProgressProps {
  plan: GoalPlan
  tracked: TrackedData
  /** The current calendar month, "YYYY-MM". */
  currentMonth: string
}

/** Screen 8 – Goal progress. */
export function GoalProgress({ plan, tracked, currentMonth }: GoalProgressProps) {
  const planMonth = getPlanMonth(plan, currentMonth)
  const usesTracked = tracked.status === 'ready' && tracked.thisMonth.count > 0
  const day = usesTracked ? getMonthProgress() : SAMPLE_DAY

  return (
    <Panel
      id="goals-progress-title"
      title="Goal progress"
      description={`How ${formatMonth(currentMonth)} is going against this month’s target of ${formatKg(planMonth.targetKg)}. The line on each bar shows how much of the month has passed.`}
    >
      {tracked.status === 'loading' && <LoadingLine>Loading your tracked activities…</LoadingLine>}

      {tracked.status === 'error' && (
        <ErrorLine
          message={`${tracked.error ?? 'Your tracked activities could not be loaded.'} Progress cannot be shown until they load.`}
          onRetry={tracked.reload}
        />
      )}

      {tracked.status === 'ready' && (
        <>
          {usesTracked ? (
            <Notice title="From Carbon tracking.">
              {formatCount(tracked.thisMonth.count, 'activity', 'activities')} recorded this month,
              estimated with the illustrative emission factors from Carbon tracking.
            </Notice>
          ) : (
            <div className="goals-callout goals-callout--action">
              <p>
                No activities recorded in Carbon tracking this month, so a sample month is shown
                below.
              </p>
              <ButtonLink href="#/tracking" variant="secondary" icon="arrow-right">
                Record an activity
              </ButtonLink>
            </div>
          )}

          <ProgressDetails
            used={usesTracked ? tracked.thisMonth.amounts : SAMPLE_CURRENT_USAGE}
            targetKg={planMonth.targetKg}
            plan={plan}
            day={day}
          />

          {usesTracked ? (
            <div className="goals-crosslink">
              <p>Recorded something new? Progress updates when you come back to this step.</p>
              <ButtonLink href="#/tracking" variant="secondary" icon="arrow-right">
                Open Carbon tracking
              </ButtonLink>
            </div>
          ) : (
            <SampleDataNotice>
              Day {SAMPLE_DAY.current} of {SAMPLE_DAY.total} and the emissions used so far are
              placeholders.
            </SampleDataNotice>
          )}
        </>
      )}
    </Panel>
  )
}

interface ProgressDetailsProps {
  used: CategoryAmounts
  targetKg: number
  plan: GoalPlan
  day: { current: number; total: number }
}

function ProgressDetails({ used, targetKg, plan, day }: ProgressDetailsProps) {
  const elapsed = day.current / day.total
  const usedKg = sumAmounts(used)
  const status = getPaceStatus(usedKg, targetKg, elapsed)
  const categoryBudgets = splitKg(targetKg, plan.allocation)

  return (
    <>
      <div className="goals-progress-summary">
        <div className="goals-progress-summary__head">
          <span className="goals-label">Whole budget</span>
          <StatusBadge status={status} />
        </div>
        <ProgressBar
          label="Whole monthly budget used"
          value={usedKg}
          max={targetKg}
          valueText={`${usedPercent(usedKg, targetKg)}% used: ${formatKg(usedKg)} of ${formatKg(targetKg)}`}
          status={status}
          marker={elapsed}
        />
        <p className="goals-hint">
          <strong>{usedPercent(usedKg, targetKg)}% used</strong> ({formatKg(usedKg)} of{' '}
          {formatKg(targetKg)}) with {Math.round(elapsed * 100)}% of the month gone (day{' '}
          {day.current} of {day.total}).{' '}
          {usedKg <= targetKg
            ? `${formatKg(roundKg(targetKg - usedKg))} left.`
            : `${formatKg(roundKg(usedKg - targetKg))} over.`}
        </p>
      </div>

      <ul className="goals-progress-list">
        {CATEGORIES.map((category) => {
          const budget = categoryBudgets[category.id]
          const categoryUsed = used[category.id]
          const categoryStatus = getPaceStatus(categoryUsed, budget, elapsed)
          return (
            <li key={category.id} className="goals-progress-list__item">
              <div className="goals-progress-summary__head">
                <span>{category.label}</span>
                <StatusBadge status={categoryStatus} />
              </div>
              <ProgressBar
                label={`${category.label} budget used`}
                value={categoryUsed}
                max={budget}
                valueText={`${usedPercent(categoryUsed, budget)}% used: ${formatKg(categoryUsed)} of ${formatKg(budget)}`}
                status={categoryStatus}
                marker={elapsed}
              />
              <span className="goals-hint">
                {usedPercent(categoryUsed, budget)}% · {formatKg(categoryUsed)} of {formatKg(budget)}
              </span>
            </li>
          )
        })}
      </ul>
    </>
  )
}
