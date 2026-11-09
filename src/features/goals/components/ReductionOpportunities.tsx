import { useState, type Dispatch } from 'react'
import { Button } from '../../../components/Button'
import { getBudgetKg, rankOpportunities, SAMPLE_BASELINE_TOTAL } from '../budget'
import { formatKg } from '../format'
import type { GoalPlanAction } from '../goalPlanReducer'
import { CATEGORIES, getCategoryLabel, getPriority, SAMPLE_OPPORTUNITIES } from '../sampleData'
import type { CategoryId, GoalPlan, Opportunity, TradeoffEffect } from '../types'
import { Panel, SampleDataNotice } from './GoalsUi'

interface ReductionOpportunitiesProps {
  plan: GoalPlan
  dispatch: Dispatch<GoalPlanAction>
}

type Filter = CategoryId | 'all'

const EFFECT_TEXT: Record<'cost' | 'time' | 'comfort', Record<TradeoffEffect, string>> = {
  cost: { better: 'Saves money', same: 'Same cost', worse: 'Costs more' },
  time: { better: 'Saves time', same: 'Same time', worse: 'Takes longer' },
  comfort: { better: 'More comfortable', same: 'Same comfort', worse: 'Less comfortable' },
}

/** Screen 7 – Reduction opportunities (recommendations). */
export function ReductionOpportunities({ plan, dispatch }: ReductionOpportunitiesProps) {
  const [filter, setFilter] = useState<Filter>('all')

  const ranked = rankOpportunities(SAMPLE_OPPORTUNITIES, plan.priorities)
  const visible = filter === 'all' ? ranked : ranked.filter((o) => o.categoryId === filter)
  const selected = SAMPLE_OPPORTUNITIES.filter((o) => plan.selectedOpportunityIds.includes(o.id))
  const selectedSavingKg = selected.reduce((total, o) => total + o.sampleSavingKg, 0)
  const gapKg = SAMPLE_BASELINE_TOTAL - getBudgetKg(plan)

  return (
    <Panel
      id="goals-opportunities-title"
      title="Reduction opportunities"
      description={`Ideas ordered by your top priority: ${getPriority(plan.priorities[0]).label.toLowerCase()}. Add the ones you want to try to your plan.`}
    >
      <div className="goals-callout" role="status">
        {selected.length === 0 ? (
          <>No changes added yet. You need to cut about {formatKg(gapKg)} a month.</>
        ) : (
          <>
            {selected.length} {selected.length === 1 ? 'change' : 'changes'} added, worth
            about <strong>{formatKg(selectedSavingKg)}</strong> a month of the{' '}
            {formatKg(gapKg)} you need to cut.
          </>
        )}
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
          <option value="all">All categories</option>
          {CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <ul className="goals-opportunities">
        {visible.map((opportunity) => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            isSelected={plan.selectedOpportunityIds.includes(opportunity.id)}
            onToggle={() => dispatch({ type: 'toggleOpportunity', id: opportunity.id })}
          />
        ))}
      </ul>

      <SampleDataNotice>
        Savings are illustrative examples, not calculated for you.
      </SampleDataNotice>
    </Panel>
  )
}

interface OpportunityCardProps {
  opportunity: Opportunity
  isSelected: boolean
  onToggle: () => void
}

function OpportunityCard({ opportunity, isSelected, onToggle }: OpportunityCardProps) {
  const titleId = `opportunity-${opportunity.id}`
  return (
    <li className={`goals-opportunity${isSelected ? ' goals-opportunity--selected' : ''}`}>
      <article aria-labelledby={titleId}>
        <p className="goals-tag">{getCategoryLabel(opportunity.categoryId)}</p>
        <h4 id={titleId} className="goals-opportunity__title">
          {opportunity.title}
        </h4>
        <p className="goals-hint">{opportunity.description}</p>
        <p className="goals-opportunity__saving">
          About {formatKg(opportunity.sampleSavingKg)} less a month
        </p>
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
          aria-pressed={isSelected}
          icon={isSelected ? 'check' : undefined}
          onClick={onToggle}
        >
          {isSelected ? 'Added to plan' : 'Add to plan'}
        </Button>
      </article>
    </li>
  )
}
