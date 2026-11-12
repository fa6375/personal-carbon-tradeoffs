import { ButtonLink } from '../../../components/ButtonLink'
import { useI18n } from '../../../i18n'
import { dataErrorText } from '../../../lib/errorMessages'
import { getPaceStatus, getPlanMonth, roundKg, splitKg, sumAmounts, usedPercent } from '../budget'
import { formatKg, formatMonth, formatPercentValue, getMonthProgress } from '../format'
import { CATEGORIES, SAMPLE_CURRENT_USAGE, SAMPLE_DAY } from '../sampleData'
import type { TrackedData } from '../trackedEmissions'
import type { CategoryAmounts, GoalPlan } from '../types'
import { ErrorLine, LoadingLine, Notice, Panel, ProgressBar, SampleDataNotice, StatusBadge } from './GoalsUi'

interface GoalProgressProps {
  plan: GoalPlan
  tracked: TrackedData
  /** The current calendar month, "YYYY-MM". */
  currentMonth: string
}

/** Screen 8 – Goal progress. */
export function GoalProgress({ plan, tracked, currentMonth }: GoalProgressProps) {
  const { t } = useI18n()
  const planMonth = getPlanMonth(plan, currentMonth)
  const usesTracked = tracked.status === 'ready' && tracked.thisMonth.count > 0
  const day = usesTracked ? getMonthProgress() : SAMPLE_DAY

  return (
    <Panel
      id="goals-progress-title"
      title={t('goals.progress.title')}
      description={t('goals.progress.description', {
        month: formatMonth(currentMonth),
        target: formatKg(planMonth.targetKg),
      })}
    >
      {tracked.status === 'loading' && <LoadingLine>{t('goals.progress.loading')}</LoadingLine>}

      {tracked.status === 'error' && (
        <ErrorLine
          message={t('goals.progress.loadError', { error: dataErrorText(tracked.error ?? 'unknown') })}
          onRetry={tracked.reload}
        />
      )}

      {tracked.status === 'ready' && (
        <>
          {usesTracked ? (
            <Notice title={t('goals.ui.fromTrackingTitle')}>
              {t('goals.progress.fromTracking', {
                activities: t('tracking.activityCount', { count: tracked.thisMonth.count }),
              })}
            </Notice>
          ) : (
            <div className="goals-callout goals-callout--action">
              <p>{t('goals.progress.noneThisMonth')}</p>
              <ButtonLink href="#/tracking" variant="secondary" icon="arrow-right">
                {t('goals.progress.record')}
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
              <p>{t('goals.progress.refreshText')}</p>
              <ButtonLink href="#/tracking" variant="secondary" icon="arrow-right">
                {t('goals.progress.openTracking')}
              </ButtonLink>
            </div>
          ) : (
            <SampleDataNotice>
              {t('goals.progress.sampleNotice', { day: SAMPLE_DAY.current, days: SAMPLE_DAY.total })}
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
  const { t } = useI18n()
  const elapsed = day.current / day.total
  const usedKg = sumAmounts(used)
  const status = getPaceStatus(usedKg, targetKg, elapsed)
  const categoryBudgets = splitKg(targetKg, plan.allocation)

  return (
    <>
      <div className="goals-progress-summary">
        <div className="goals-progress-summary__head">
          <span className="goals-label">{t('goals.progress.wholeBudget')}</span>
          <StatusBadge status={status} />
        </div>
        <ProgressBar
          label={t('goals.progress.wholeBudgetUsed')}
          value={usedKg}
          max={targetKg}
          valueText={t('goals.progress.usedValue', {
            percent: formatPercentValue(usedPercent(usedKg, targetKg)),
            used: formatKg(usedKg),
            budget: formatKg(targetKg),
          })}
          status={status}
          marker={elapsed}
        />
        <p className="goals-hint">
          {t('goals.progress.summary', {
            percent: formatPercentValue(usedPercent(usedKg, targetKg)),
            used: formatKg(usedKg),
            budget: formatKg(targetKg),
            elapsed: formatPercentValue(Math.round(elapsed * 100)),
            day: day.current,
            days: day.total,
          })}{' '}
          {usedKg <= targetKg
            ? t('goals.progress.left', { kg: formatKg(roundKg(targetKg - usedKg)) })
            : t('goals.progress.over', { kg: formatKg(roundKg(usedKg - targetKg)) })}
        </p>
      </div>

      <ul className="goals-progress-list">
        {CATEGORIES.map((category) => {
          const budget = categoryBudgets[category.id]
          const categoryUsed = used[category.id]
          const categoryStatus = getPaceStatus(categoryUsed, budget, elapsed)
          const values = {
            percent: formatPercentValue(usedPercent(categoryUsed, budget)),
            used: formatKg(categoryUsed),
            budget: formatKg(budget),
          }
          return (
            <li key={category.id} className="goals-progress-list__item">
              <div className="goals-progress-summary__head">
                <span>{category.label}</span>
                <StatusBadge status={categoryStatus} />
              </div>
              <ProgressBar
                label={t('goals.progress.categoryUsed', { category: category.label })}
                value={categoryUsed}
                max={budget}
                valueText={t('goals.progress.usedValue', values)}
                status={categoryStatus}
                marker={elapsed}
              />
              <span className="goals-hint">{t('goals.progress.categoryValue', values)}</span>
            </li>
          )
        })}
      </ul>
    </>
  )
}
