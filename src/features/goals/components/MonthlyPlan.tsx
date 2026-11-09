import { getMonthlyTargets, SAMPLE_BASELINE_TOTAL } from '../budget'
import { formatKg, formatMonth } from '../format'
import type { GoalPlan } from '../types'
import { Panel, ProgressBar } from './GoalsUi'

/** Screen 5 – Monthly carbon plan. */
export function MonthlyPlan({ plan }: { plan: GoalPlan }) {
  const targets = getMonthlyTargets(plan)

  return (
    <Panel
      id="goals-monthly-title"
      title="Monthly carbon plan"
      description="Your budget steps down a little each month, so the change stays manageable."
    >
      <div className="goals-table-wrap">
        <table className="goals-table">
          <caption className="visually-hidden">
            Monthly budget targets from {formatMonth(plan.startMonth)} to{' '}
            {formatMonth(plan.startMonth, plan.durationMonths - 1)}
          </caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Budget</th>
              <th scope="col" className="goals-table__bar-col">
                <span className="visually-hidden">Budget compared with now</span>
              </th>
              <th scope="col">Less than now</th>
            </tr>
          </thead>
          <tbody>
            {targets.map((target) => (
              <tr key={target.index}>
                <th scope="row">{formatMonth(plan.startMonth, target.index)}</th>
                <td>{formatKg(target.targetKg)}</td>
                <td className="goals-table__bar-col">
                  <ProgressBar
                    label={`Budget for ${formatMonth(plan.startMonth, target.index)}`}
                    value={target.targetKg}
                    max={SAMPLE_BASELINE_TOTAL}
                    valueText={`${formatKg(target.targetKg)} of ${formatKg(SAMPLE_BASELINE_TOTAL)} now`}
                  />
                </td>
                <td>{formatKg(target.reductionKg)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
