import { useState, type Dispatch } from 'react'
import { Button } from '../../../components/Button'
import { ButtonLink } from '../../../components/ButtonLink'
import { useI18n } from '../../../i18n'
import {
  getAllocationTotal,
  getBaselineKg,
  getBudgetKg,
  getCategoryGaps,
  getPlanMonth,
  getSavingKg,
  getSavingsByCategory,
  splitKg,
  sumAmounts,
} from '../budget'
import { formatKg, formatMonth, formatMonthGenitive, formatPercentValue } from '../format'
import type { GoalPlanAction } from '../goalPlanReducer'
import { CATEGORIES, getPriority, OPPORTUNITIES } from '../sampleData'
import type { GoalPlan, GoalsStageId } from '../types'
import { Notice, Panel, StatTile } from './GoalsUi'

interface BudgetSummaryProps {
  plan: GoalPlan
  dispatch: Dispatch<GoalPlanAction>
  onEdit: (stage: GoalsStageId) => void
  /** The current calendar month, "YYYY-MM". */
  currentMonth: string
}

/** Screen 10 – Carbon budget summary. */
export function BudgetSummary({ plan, dispatch, onEdit, currentMonth }: BudgetSummaryProps) {
  const { t } = useI18n()
  const [confirmingReset, setConfirmingReset] = useState(false)
  const budgetKg = getBudgetKg(plan)
  const finalSplit = splitKg(budgetKg, plan.allocation)
  const planMonth = getPlanMonth(plan, currentMonth)
  const selected = OPPORTUNITIES.filter((o) => plan.selectedOpportunityIds.includes(o.id))
  const selectedSaving = sumAmounts(getSavingsByCategory(selected))
  const gapKg = sumAmounts(getCategoryGaps(plan))
  const allocationTotal = getAllocationTotal(plan.allocation)

  const sectionHead = (id: string, title: string, action: string, hidden: string, stage: GoalsStageId) => (
    <div className="goals-summary-grid__head">
      <h4 id={id} className="goals-subheading">
        {title}
      </h4>
      <button type="button" className="goals-link-button" onClick={() => onEdit(stage)}>
        {action}
        <span className="visually-hidden"> {hidden}</span>
      </button>
    </div>
  )

  return (
    <Panel id="goals-summary-title" title={t('goals.summary.title')} description={t('goals.summary.description')}>
      <dl className="goals-stats">
        <StatTile
          label={t('goals.budget.monthly')}
          value={formatKg(budgetKg)}
          hint={t('goals.summary.byMonth', { month: formatMonthGenitive(plan.startMonth, plan.durationMonths - 1) })}
          highlight
        />
        <StatTile
          label={t('goals.summary.goal')}
          value={t('goals.summary.goalValue', { percent: formatPercentValue(plan.reductionPercent) })}
          hint={t('goals.summary.goalFrom', {
            kg: formatKg(getBaselineKg(plan)),
            source: t(`goals.budget.sourcesInline.${plan.baseline.source}`),
          })}
        />
        <StatTile
          label={t('goals.summary.timeframe')}
          value={t('goals.setup.months', { count: plan.durationMonths })}
          hint={`${formatMonth(plan.startMonth)} – ${formatMonth(plan.startMonth, plan.durationMonths - 1)}`}
        />
        <StatTile
          label={planMonth.timing === 'not-started' ? t('goals.summary.firstTarget') : t('goals.summary.thisTarget')}
          value={formatKg(planMonth.targetKg)}
          hint={formatMonth(plan.startMonth, planMonth.index)}
        />
      </dl>

      <div className="goals-summary-grid">
        <section aria-labelledby="summary-allocation">
          {sectionHead(
            'summary-allocation',
            t('goals.summary.allocation'),
            t('goals.summary.edit'),
            t('goals.summary.editAllocation'),
            'allocate',
          )}
          <ul className="goals-category-list">
            {CATEGORIES.map((category) => (
              <li key={category.id}>
                <span>{category.label}</span>
                <span>
                  {formatPercentValue(plan.allocation[category.id])} · {formatKg(finalSplit[category.id])}
                </span>
              </li>
            ))}
          </ul>
          {allocationTotal !== 100 && (
            <p className="goals-error">
              {t('goals.summary.allocationSum', { total: formatPercentValue(allocationTotal) })}
            </p>
          )}
        </section>

        <section aria-labelledby="summary-priorities">
          {sectionHead(
            'summary-priorities',
            t('goals.summary.priorities'),
            t('goals.summary.edit'),
            t('goals.summary.editPriorities'),
            'allocate',
          )}
          <ol className="goals-summary-list">
            {plan.priorities.map((id) => (
              <li key={id}>{getPriority(id).label}</li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="summary-changes">
          {sectionHead(
            'summary-changes',
            t('goals.summary.changes'),
            t('goals.summary.edit'),
            t('goals.summary.editChanges'),
            'plan',
          )}
          {selected.length === 0 ? (
            <p className="goals-hint">{t('goals.summary.noChanges')}</p>
          ) : (
            <>
              <ul className="goals-summary-list">
                {selected.map((o) => (
                  <li key={o.id}>
                    {o.title}{' '}
                    <span className="goals-hint">{t('goals.summary.changeSaving', { kg: formatKg(getSavingKg(o)) })}</span>
                  </li>
                ))}
              </ul>
              <p className="goals-hint">
                {t('goals.summary.changesTotal', { saving: formatKg(selectedSaving), gap: formatKg(gapKg) })}
              </p>
            </>
          )}
        </section>

        <section aria-labelledby="summary-adjustments">
          {sectionHead(
            'summary-adjustments',
            t('goals.summary.adjustments'),
            t('goals.summary.view'),
            t('goals.summary.viewAdjustments'),
            'track',
          )}
          <p className="goals-hint">
            {plan.adjustments.length === 0
              ? t('goals.summary.noAdjustments')
              : t('goals.summary.adjustmentsMade', { count: plan.adjustments.length })}
          </p>
        </section>
      </div>

      <div className="goals-next-steps">
        <h4 className="goals-subheading">{t('goals.summary.keepGoing')}</h4>
        <div className="goals-actions">
          <ButtonLink href="#/tracking" icon="arrow-right">
            {t('goals.summary.recordActivities')}
          </ButtonLink>
          <ButtonLink href="#/compare" variant="secondary" icon="arrow-right">
            {t('goals.summary.compare')}
          </ButtonLink>
          <Button variant="secondary" onClick={() => onEdit('track')}>
            {t('goals.summary.checkProgress')}
          </Button>
        </div>
      </div>

      <Notice title={t('goals.summary.savedTitle')}>{t('goals.summary.savedNotice')}</Notice>

      <div className="goals-actions">
        {confirmingReset ? (
          <div className="goals-callout goals-callout--warning goals-callout--action" role="alert">
            <p>{t('goals.summary.confirmStartOver')}</p>
            <div className="goals-actions">
              <Button
                onClick={() => {
                  dispatch({ type: 'resetPlan' })
                  setConfirmingReset(false)
                  onEdit('setup')
                }}
              >
                {t('goals.summary.yesStartOver')}
              </Button>
              <Button variant="secondary" onClick={() => setConfirmingReset(false)}>
                {t('goals.summary.keepPlan')}
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setConfirmingReset(true)}>
            {t('goals.summary.startOver')}
          </Button>
        )}
      </div>
    </Panel>
  )
}
