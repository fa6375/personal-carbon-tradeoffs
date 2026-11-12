import { useState, type Dispatch } from 'react'
import { Button } from '../../../components/Button'
import { ButtonLink } from '../../../components/ButtonLink'
import { useI18n } from '../../../i18n'
import {
  getCategoryGaps,
  getSavingKg,
  getSavingsByCategory,
  rankOpportunities,
  roundKg,
  sumAmounts,
} from '../budget'
import { formatKg } from '../format'
import type { GoalPlanAction } from '../goalPlanReducer'
import { CATEGORIES, getCategoryLabel, getPriority, OPPORTUNITIES } from '../sampleData'
import type { CategoryId, GoalPlan, Opportunity } from '../types'
import { EstimateNotice, Panel, ProgressBar } from './GoalsUi'

interface ReductionOpportunitiesProps {
  plan: GoalPlan
  dispatch: Dispatch<GoalPlanAction>
}

type Filter = CategoryId | 'all' | 'needed'

/** Screen 7 – Reduction opportunities (recommendations). */
export function ReductionOpportunities({ plan, dispatch }: ReductionOpportunitiesProps) {
  const { t, locale } = useI18n()
  const [filter, setFilter] = useState<Filter>('all')

  const gaps = getCategoryGaps(plan)
  const ranked = rankOpportunities(OPPORTUNITIES, plan.priorities, gaps)
  const visible = ranked.filter((o) =>
    filter === 'all' ? true : filter === 'needed' ? gaps[o.categoryId] > 0 : o.categoryId === filter,
  )
  const selected = OPPORTUNITIES.filter((o) => plan.selectedOpportunityIds.includes(o.id))
  const savings = getSavingsByCategory(selected)
  const totalSaving = sumAmounts(savings)
  const totalGap = sumAmounts(gaps)
  // German capitalises nouns, so the priority keeps its capital letter there.
  const topPriority = getPriority(plan.priorities[0]).label
  const priorityInSentence = locale === 'de' ? topPriority : topPriority.toLocaleLowerCase(locale)

  return (
    <Panel
      id="goals-opportunities-title"
      title={t('goals.opportunityScreen.title')}
      description={t('goals.opportunityScreen.description', { priority: priorityInSentence })}
    >
      <div className="goals-coverage">
        <p className="goals-coverage__summary" role="status">
          {selected.length === 0
            ? t('goals.opportunityScreen.noneAdded', { kg: formatKg(totalGap) })
            : t('goals.opportunityScreen.added', {
                changes: t('goals.opportunityScreen.changes', { count: selected.length }),
                saving: formatKg(totalSaving),
                gap: formatKg(totalGap),
              })}
        </p>
        <ul className="goals-coverage__list">
          {CATEGORIES.map((category) => {
            const gap = gaps[category.id]
            const saving = savings[category.id]
            return (
              <li key={category.id}>
                <span className="goals-coverage__label">{category.label}</span>
                {gap > 0 ? (
                  <>
                    <ProgressBar
                      label={t('goals.opportunityScreen.coverageLabel', { category: category.label })}
                      value={saving}
                      max={gap}
                      valueText={t('goals.opportunityScreen.coverageValue', {
                        saving: formatKg(saving),
                        gap: formatKg(gap),
                      })}
                    />
                    <span className="goals-hint">
                      {saving >= gap
                        ? t('goals.opportunityScreen.covered', { saving: formatKg(saving), gap: formatKg(gap) })
                        : t('goals.opportunityScreen.toGo', {
                            saving: formatKg(saving),
                            gap: formatKg(gap),
                            rest: formatKg(roundKg(gap - saving)),
                          })}
                    </span>
                  </>
                ) : (
                  <span className="goals-hint">{t('goals.opportunityScreen.noCut')}</span>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <div className="goals-field goals-field--inline">
        <label className="goals-label" htmlFor="opportunity-filter">
          {t('goals.opportunityScreen.show')}
        </label>
        <select
          id="opportunity-filter"
          className="goals-input"
          value={filter}
          onChange={(event) => setFilter(event.target.value as Filter)}
        >
          <option value="all">{t('goals.opportunityScreen.all')}</option>
          <option value="needed">{t('goals.opportunityScreen.needed')}</option>
          {CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <p className="goals-empty">{t('goals.opportunityScreen.noMatch')}</p>
      ) : (
        <ul className="goals-opportunities">
          {visible.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              needed={gaps[opportunity.categoryId] > 0}
              isSelected={plan.selectedOpportunityIds.includes(opportunity.id)}
              onToggle={() => dispatch({ type: 'toggleOpportunity', id: opportunity.id })}
            />
          ))}
        </ul>
      )}

      <div className="goals-crosslink">
        <p>{t('goals.opportunityScreen.compareText')}</p>
        <ButtonLink href="#/compare" variant="secondary" icon="arrow-right">
          {t('goals.opportunityScreen.compareLink')}
        </ButtonLink>
      </div>

      <EstimateNotice>{t('goals.opportunityScreen.notice')}</EstimateNotice>
    </Panel>
  )
}

interface OpportunityCardProps {
  opportunity: Opportunity
  /** Whether the category still needs cutting with the current allocation. */
  needed: boolean
  isSelected: boolean
  onToggle: () => void
}

function OpportunityCard({ opportunity, needed, isSelected, onToggle }: OpportunityCardProps) {
  const { t } = useI18n()
  const titleId = `opportunity-${opportunity.id}`
  return (
    <li className={`goals-opportunity${isSelected ? ' goals-opportunity--selected' : ''}`}>
      <article aria-labelledby={titleId}>
        <p className="goals-tag">
          {getCategoryLabel(opportunity.categoryId)}
          {needed && <span className="goals-tag__extra"> · {t('goals.opportunityScreen.needsCutting')}</span>}
        </p>
        <h4 id={titleId} className="goals-opportunity__title">
          {opportunity.title}
        </h4>
        <p className="goals-hint">{opportunity.description}</p>
        <p className="goals-opportunity__saving">
          {t('goals.opportunityScreen.saving', { kg: formatKg(getSavingKg(opportunity)) })}
        </p>
        <p className="goals-opportunity__assumption">
          {t('goals.opportunityScreen.example', { text: opportunity.assumption })}
        </p>
        <ul className="goals-chips" aria-label={t('goals.opportunityScreen.tradeoffs')}>
          {(['cost', 'time', 'comfort'] as const).map((key) => (
            <li key={key} className={`goals-chip goals-chip--${opportunity[key]}`}>
              {t(`goals.opportunityScreen.effects.${key}.${opportunity[key]}`)}
            </li>
          ))}
          <li className="goals-chip">
            {t('goals.opportunityScreen.effort', { level: t(`goals.opportunityScreen.efforts.${opportunity.effort}`) })}
          </li>
        </ul>
        <Button variant={isSelected ? 'primary' : 'secondary'} icon={isSelected ? 'check' : undefined} onClick={onToggle}>
          {isSelected ? t('goals.opportunityScreen.addedButton') : t('goals.opportunityScreen.add')}
        </Button>
      </article>
    </li>
  )
}
