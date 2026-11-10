import { useState, type Dispatch } from 'react'
import { Button } from '../../../components/Button'
import { ButtonLink } from '../../../components/ButtonLink'
import {
  getCategoryGaps,
  getSavingKg,
  getSavingsByCategory,
  rankOpportunities,
  roundKg,
  sumAmounts,
} from '../budget'
import { formatCount, formatKg } from '../format'
import type { GoalPlanAction } from '../goalPlanReducer'
import { CATEGORIES, getCategoryLabel, getPriority, OPPORTUNITIES } from '../sampleData'
import type { CategoryId, GoalPlan, Opportunity, TradeoffEffect } from '../types'
import { EstimateNotice, Panel, ProgressBar } from './GoalsUi'

interface ReductionOpportunitiesProps {
  plan: GoalPlan
  dispatch: Dispatch<GoalPlanAction>
}

type Filter = CategoryId | 'all' | 'needed'

const EFFECT_TEXT: Record<'cost' | 'time' | 'comfort', Record<TradeoffEffect, string>> = {
  cost: { better: 'Saves money', same: 'Same cost', worse: 'Costs more' },
  time: { better: 'Saves time', same: 'Same time', worse: 'Takes longer' },
  comfort: { better: 'More comfortable', same: 'Same comfort', worse: 'Less comfortable' },
}

/** Screen 7 – Reduction opportunities (recommendations). */
export function ReductionOpportunities({ plan, dispatch }: ReductionOpportunitiesProps) {
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

  return (
    <Panel
      id="goals-opportunities-title"
      title="Reduction opportunities"
      description={`Ideas ordered by your priorities (most important: ${getPriority(plan.priorities[0]).label.toLowerCase()}), with categories that still need cutting first. Add the ones you want to try to your plan.`}
    >
      <div className="goals-coverage">
        <p className="goals-coverage__summary" role="status">
          {selected.length === 0
            ? `No changes added yet. To reach your budget you need to cut about ${formatKg(totalGap)} a month.`
            : `${formatCount(selected.length, 'change', 'changes')} added, worth about ${formatKg(totalSaving)} a month of the ${formatKg(totalGap)} you need to cut.`}
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
                      label={`${category.label}: planned savings compared with the cut needed`}
                      value={saving}
                      max={gap}
                      valueText={`${formatKg(saving)} of ${formatKg(gap)} needed`}
                    />
                    <span className="goals-hint">
                      {formatKg(saving)} of {formatKg(gap)}
                      {saving >= gap ? ' · covered' : ` · ${formatKg(roundKg(gap - saving))} to go`}
                    </span>
                  </>
                ) : (
                  <span className="goals-hint">No cut needed with your allocation</span>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <div className="goals-field goals-field--inline">
        <label className="goals-label" htmlFor="opportunity-filter">
          Show
        </label>
        <select
          id="opportunity-filter"
          className="goals-input"
          value={filter}
          onChange={(event) => setFilter(event.target.value as Filter)}
        >
          <option value="all">All ideas</option>
          <option value="needed">Categories that need cutting</option>
          {CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <p className="goals-empty">
          No ideas match this filter. With your allocation, no category needs cutting.
        </p>
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
        <p>Want to see the trade-offs for a specific trip before changing how you travel?</p>
        <ButtonLink href="#/compare" variant="secondary" icon="arrow-right">
          Compare a journey
        </ButtonLink>
      </div>

      <EstimateNotice>
        Savings are calculated from the example amounts on each card with the same illustrative
        emission factors that Carbon tracking and Compare use. Your own saving depends on what you
        do now. These ideas are examples written for this prototype, not personalised advice.
      </EstimateNotice>
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
  const titleId = `opportunity-${opportunity.id}`
  return (
    <li className={`goals-opportunity${isSelected ? ' goals-opportunity--selected' : ''}`}>
      <article aria-labelledby={titleId}>
        <p className="goals-tag">
          {getCategoryLabel(opportunity.categoryId)}
          {needed && <span className="goals-tag__extra"> · needs cutting</span>}
        </p>
        <h4 id={titleId} className="goals-opportunity__title">
          {opportunity.title}
        </h4>
        <p className="goals-hint">{opportunity.description}</p>
        <p className="goals-opportunity__saving">
          About {formatKg(getSavingKg(opportunity))} less a month
        </p>
        <p className="goals-opportunity__assumption">Example: {opportunity.assumption}</p>
        <ul className="goals-chips" aria-label="Trade-offs">
          {(['cost', 'time', 'comfort'] as const).map((key) => (
            <li key={key} className={`goals-chip goals-chip--${opportunity[key]}`}>
              {EFFECT_TEXT[key][opportunity[key]]}
            </li>
          ))}
          <li className="goals-chip">Effort: {opportunity.effort}</li>
        </ul>
        <Button
          variant={isSelected ? 'primary' : 'secondary'}
          icon={isSelected ? 'check' : undefined}
          onClick={onToggle}
        >
          {isSelected ? 'Added to plan' : 'Add to plan'}
        </Button>
      </article>
    </li>
  )
}
