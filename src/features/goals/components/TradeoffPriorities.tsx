import { useState, type Dispatch } from 'react'
import type { GoalPlanAction } from '../goalPlanReducer'
import { getPriority } from '../sampleData'
import type { GoalPlan, PriorityId } from '../types'
import { Panel } from './GoalsUi'

interface TradeoffPrioritiesProps {
  plan: GoalPlan
  dispatch: Dispatch<GoalPlanAction>
}

/** Screen 4 – Trade-off priorities. */
export function TradeoffPriorities({ plan, dispatch }: TradeoffPrioritiesProps) {
  const [announcement, setAnnouncement] = useState('')

  function move(id: PriorityId, direction: 'up' | 'down') {
    const index = plan.priorities.indexOf(id)
    const newPosition = direction === 'up' ? index : index + 2
    dispatch({ type: 'movePriority', id, direction })
    setAnnouncement(`${getPriority(id).label} moved to position ${newPosition} of ${plan.priorities.length}.`)
  }

  return (
    <Panel
      id="goals-priorities-title"
      title="Trade-off priorities"
      description="Put what matters most to you at the top. Recommendations are ordered to match."
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
                <span className="goals-priorities__label">{priority.label}</span>
                <span className="goals-hint">{priority.description}</span>
              </div>
              <div className="goals-priorities__controls">
                <button
                  type="button"
                  className="goals-icon-button"
                  aria-label={`Move ${priority.label} up`}
                  disabled={isFirst}
                  onClick={() => move(id, 'up')}
                >
                  <span aria-hidden="true">↑</span>
                </button>
                <button
                  type="button"
                  className="goals-icon-button"
                  aria-label={`Move ${priority.label} down`}
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
      <p className="visually-hidden" role="status">
        {announcement}
      </p>
    </Panel>
  )
}
