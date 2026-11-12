import { useState, type Dispatch } from 'react'
import { useI18n } from '../../../i18n'
import { getCategoryGaps, rankOpportunities } from '../budget'
import type { GoalPlanAction } from '../goalPlanReducer'
import { getPriority, OPPORTUNITIES } from '../sampleData'
import type { GoalPlan, PriorityId } from '../types'
import { Panel } from './GoalsUi'

interface TradeoffPrioritiesProps {
  plan: GoalPlan
  dispatch: Dispatch<GoalPlanAction>
}

/** Screen 4 – Trade-off priorities. */
export function TradeoffPriorities({ plan, dispatch }: TradeoffPrioritiesProps) {
  const { t } = useI18n()
  const [announcement, setAnnouncement] = useState('')
  const topIdea = rankOpportunities(OPPORTUNITIES, plan.priorities, getCategoryGaps(plan))[0]

  function move(id: PriorityId, direction: 'up' | 'down') {
    const index = plan.priorities.indexOf(id)
    const newPosition = direction === 'up' ? index : index + 2
    dispatch({ type: 'movePriority', id, direction })
    setAnnouncement(
      t('goals.priorityScreen.moved', {
        priority: getPriority(id).label,
        position: newPosition,
        total: plan.priorities.length,
      }),
    )
  }

  return (
    <Panel
      id="goals-priorities-title"
      title={t('goals.priorityScreen.title')}
      description={t('goals.priorityScreen.description')}
    >
      <ol className="goals-priorities">
        {plan.priorities.map((id, index) => {
          const priority = getPriority(id)
          const isFirst = index === 0
          const isLast = index === plan.priorities.length - 1
          return (
            <li key={id} className="goals-priorities__item">
              <span className="goals-priorities__rank" aria-hidden="true">
                {index + 1}
              </span>
              <div className="goals-priorities__text">
                <span className="goals-priorities__label">
                  {priority.label}
                  {isFirst && <span className="goals-priorities__top">{t('goals.priorityScreen.mostImportant')}</span>}
                </span>
                <span className="goals-hint">{priority.description}</span>
              </div>
              <div className="goals-priorities__controls">
                <button
                  type="button"
                  className="goals-icon-button"
                  aria-label={t('goals.priorityScreen.moveUp', { priority: priority.label })}
                  disabled={isFirst}
                  onClick={() => move(id, 'up')}
                >
                  <span aria-hidden="true">↑</span>
                </button>
                <button
                  type="button"
                  className="goals-icon-button"
                  aria-label={t('goals.priorityScreen.moveDown', { priority: priority.label })}
                  disabled={isLast}
                  onClick={() => move(id, 'down')}
                >
                  <span aria-hidden="true">↓</span>
                </button>
              </div>
            </li>
          )
        })}
      </ol>

      <p className="goals-callout" aria-live="polite">
        {t('goals.priorityScreen.topIdea', { idea: topIdea.title })}
      </p>
      <p className="visually-hidden" role="status">
        {announcement}
      </p>
    </Panel>
  )
}
