import { useI18n } from '../../../i18n'
import { getBaselineKg, getMonthlyTargets, getPlanMonth, splitKg } from '../budget'
import { formatKg, formatMonth, formatPercentValue } from '../format'
import { CATEGORIES } from '../sampleData'
import type { GoalPlan } from '../types'
import { Panel, ProgressBar } from './GoalsUi'

interface MonthlyPlanProps {
  plan: GoalPlan
  /** The current calendar month, "YYYY-MM". */
  currentMonth: string
}

/** Screen 5 – Monthly carbon plan. */
export function MonthlyPlan({ plan, currentMonth }: MonthlyPlanProps) {
  const { t } = useI18n()
  const targets = getMonthlyTargets(plan)
  const baselineKg = getBaselineKg(plan)
  const planMonth = getPlanMonth(plan, currentMonth)
  const lastMonth = formatMonth(plan.startMonth, plan.durationMonths - 1)

  return (
    <Panel
      id="goals-monthly-title"
      title={t('goals.monthly.title')}
      description={t('goals.monthly.description', {
        baseline: formatKg(baselineKg),
        budget: formatKg(targets[targets.length - 1].targetKg),
        month: lastMonth,
      })}
    >
      {planMonth.timing === 'not-started' && (
        <p className="goals-callout">{t('goals.monthly.notStarted', { month: formatMonth(plan.startMonth) })}</p>
      )}
      {planMonth.timing === 'finished' && (
        <p className="goals-callout">{t('goals.monthly.finished', { month: lastMonth })}</p>
      )}

      <div className="goals-table-wrap">
        <table className="goals-table">
          <caption className="visually-hidden">
            {t('goals.monthly.caption', { start: formatMonth(plan.startMonth), end: lastMonth })}
          </caption>
          <thead>
            <tr>
              <th scope="col">{t('goals.monthly.month')}</th>
              <th scope="col">{t('goals.monthly.budget')}</th>
              {CATEGORIES.map((category) => (
                <th key={category.id} scope="col" className="goals-table__wide">
                  {category.label}
                </th>
              ))}
              <th scope="col">{t('goals.monthly.lessThanNow')}</th>
            </tr>
          </thead>
          <tbody>
            {targets.map((target) => {
              const isCurrent = planMonth.timing === 'active' && planMonth.index === target.index
              const split = splitKg(target.targetKg, plan.allocation)
              const label = formatMonth(plan.startMonth, target.index)
              return (
                <tr
                  key={target.index}
                  className={isCurrent ? 'goals-table__row--current' : undefined}
                  aria-current={isCurrent ? 'date' : undefined}
                >
                  <th scope="row">
                    {label}
                    {isCurrent && <span className="goals-tag goals-tag--inline">{t('goals.monthly.thisMonth')}</span>}
                  </th>
                  <td>
                    <span className="goals-table__value">{formatKg(target.targetKg)}</span>
                    <ProgressBar
                      label={t('goals.monthly.budgetFor', { month: label })}
                      value={target.targetKg}
                      max={baselineKg}
                      valueText={t('goals.monthly.ofNow', {
                        kg: formatKg(target.targetKg),
                        baseline: formatKg(baselineKg),
                      })}
                    />
                  </td>
                  {CATEGORIES.map((category) => (
                    <td key={category.id} className="goals-table__wide">
                      {formatKg(split[category.id])}
                    </td>
                  ))}
                  <td>{formatKg(target.reductionKg)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <h4 className="goals-subheading">
        {t('goals.monthly.categoryBudgets', { month: formatMonth(plan.startMonth, planMonth.index) })}
      </h4>
      <ul className="goals-category-list">
        {CATEGORIES.map((category) => (
          <li key={category.id}>
            <span>
              {category.label} ({formatPercentValue(plan.allocation[category.id])})
            </span>
            <span>{formatKg(splitKg(planMonth.targetKg, plan.allocation)[category.id])}</span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
