import { useI18n } from '../../../i18n'
import { getBaselineKg, getBudgetKg, getMonthlyTargets, roundKg } from '../budget'
import { formatDateTime, formatKg, formatMonth, formatMonthGenitive, formatPercentValue } from '../format'
import { CATEGORIES } from '../sampleData'
import type { GoalPlan } from '../types'
import { Panel, ProgressBar, StatTile } from './GoalsUi'

/** Screen 2 – Personal carbon budget. */
export function PersonalBudget({ plan }: { plan: GoalPlan }) {
  const { t } = useI18n()
  const baselineKg = getBaselineKg(plan)
  const budgetKg = getBudgetKg(plan)
  const firstMonthKg = getMonthlyTargets(plan)[0].targetKg

  return (
    <Panel id="goals-budget-title" title={t('goals.budget.title')} description={t('goals.budget.description')}>
      <dl className="goals-stats">
        <StatTile
          label={t('goals.budget.monthly')}
          value={formatKg(budgetKg)}
          hint={t('goals.budget.from', { month: formatMonthGenitive(plan.startMonth, plan.durationMonths - 1) })}
          highlight
        />
        <StatTile
          label={t('goals.budget.current')}
          value={formatKg(baselineKg)}
          hint={
            plan.baseline.source === 'tracked' && plan.baseline.takenAt
              ? t('goals.budget.trackedAt', { time: formatDateTime(plan.baseline.takenAt) })
              : t(`goals.budget.sources.${plan.baseline.source}`)
          }
        />
        <StatTile
          label={t('goals.budget.reduction')}
          value={formatKg(roundKg(baselineKg - budgetKg))}
          hint={t('goals.budget.lessThanNow', { percent: formatPercentValue(plan.reductionPercent) })}
        />
        <StatTile
          label={t('goals.budget.firstMonth')}
          value={formatKg(firstMonthKg)}
          hint={t('goals.budget.stepOf', { month: formatMonth(plan.startMonth), total: plan.durationMonths })}
        />
      </dl>

      <div className="goals-compare">
        <div className="goals-compare__row">
          <span>{t('goals.budget.now')}</span>
          <ProgressBar
            label={t('goals.budget.current')}
            value={baselineKg}
            max={baselineKg}
            valueText={formatKg(baselineKg)}
            tone="muted"
          />
          <span>{formatKg(baselineKg)}</span>
        </div>
        <div className="goals-compare__row">
          <span>{t('goals.budget.goal')}</span>
          <ProgressBar
            label={t('goals.budget.monthly')}
            value={budgetKg}
            max={baselineKg}
            valueText={t('goals.budget.goalValue', {
              kg: formatKg(budgetKg),
              percent: formatPercentValue(100 - plan.reductionPercent),
            })}
          />
          <span>{formatKg(budgetKg)}</span>
        </div>
      </div>

      <h4 className="goals-subheading">{t('goals.budget.whereNow')}</h4>
      <ul className="goals-category-list">
        {CATEGORIES.map((category) => (
          <li key={category.id}>
            <span>{category.label}</span>
            <span>{formatKg(plan.baseline.amounts[category.id])}</span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
