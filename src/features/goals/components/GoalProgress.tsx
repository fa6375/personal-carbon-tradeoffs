import { getBudgetKg, getPaceStatus, shareToKg, sumAmounts } from '../budget'
import { formatKg } from '../format'
import { CATEGORIES, SAMPLE_CURRENT_USAGE, SAMPLE_DAY } from '../sampleData'
import type { GoalPlan } from '../types'
import { Panel, ProgressBar, SampleDataNotice, StatusBadge } from './GoalsUi'

const MONTH_ELAPSED = SAMPLE_DAY.current / SAMPLE_DAY.total

/** Screen 8 – Goal progress. */
export function GoalProgress({ plan }: { plan: GoalPlan }) {
  const budgetKg = getBudgetKg(plan)
  const usedKg = sumAmounts(SAMPLE_CURRENT_USAGE)
  const overallStatus = getPaceStatus(usedKg, budgetKg, MONTH_ELAPSED)

  return (
    <Panel
      id="goals-progress-title"
      title="Goal progress"
      description={`How this month is going. Day ${SAMPLE_DAY.current} of ${SAMPLE_DAY.total}; the line on each bar shows how much of the month has passed.`}
    >
      <div className="goals-progress-summary">
        <div className="goals-progress-summary__head">
          <span className="goals-label">Whole budget</span>
          <StatusBadge status={overallStatus} />
        </div>
        <ProgressBar
          label="Whole monthly budget used"
          value={usedKg}
          max={budgetKg}
          valueText={`${formatKg(usedKg)} of ${formatKg(budgetKg)} used`}
          tone={overallStatus === 'on-track' ? 'default' : 'warning'}
          marker={MONTH_ELAPSED}
        />
        <p className="goals-hint">
          {formatKg(usedKg)} of {formatKg(budgetKg)} used
          {usedKg <= budgetKg
            ? `, ${formatKg(budgetKg - usedKg)} left`
            : `, ${formatKg(usedKg - budgetKg)} over`}
        </p>
      </div>

      <ul className="goals-progress-list">
        {CATEGORIES.map((category) => {
          const allocatedKg = shareToKg(budgetKg, plan.allocation[category.id])
          const categoryUsed = SAMPLE_CURRENT_USAGE[category.id]
          const status = getPaceStatus(categoryUsed, allocatedKg, MONTH_ELAPSED)
          return (
            <li key={category.id} className="goals-progress-list__item">
              <div className="goals-progress-summary__head">
                <span>{category.label}</span>
                <StatusBadge status={status} />
              </div>
              <ProgressBar
                label={`${category.label} budget used`}
                value={categoryUsed}
                max={allocatedKg}
                valueText={`${formatKg(categoryUsed)} of ${formatKg(allocatedKg)} used`}
                tone={status === 'on-track' ? 'default' : 'warning'}
                marker={MONTH_ELAPSED}
              />
              <span className="goals-hint">
                {formatKg(categoryUsed)} of {formatKg(allocatedKg)}
              </span>
            </li>
          )
        })}
      </ul>

      <SampleDataNotice>
        Emissions used so far are placeholders. Real figures will come from Personal Carbon
        Tracking.
      </SampleDataNotice>
    </Panel>
  )
}
