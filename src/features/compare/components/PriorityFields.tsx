import { useId } from 'react'
import { Icon } from '../../../components/Icon'
import { CRITERIA, PRIORITY_LEVELS } from '../criteria'
import type { Criterion, Priorities, PriorityLevel } from '../types'

interface PriorityFieldsProps {
  priorities: Priorities
  error?: string
  onChange: (priorities: Priorities) => void
}

/** One radio group per criterion (screen 4 and the scenario screen). */
export function PriorityFields({ priorities, error, onChange }: PriorityFieldsProps) {
  const prefix = useId()

  function set(criterion: Criterion, level: PriorityLevel) {
    onChange({ ...priorities, [criterion]: level })
  }

  return (
    <div className="compare-priorities">
      {error && (
        <p className="compare-field__error" role="alert">
          {error}
        </p>
      )}
      {CRITERIA.map((criterion) => (
        <fieldset key={criterion.id} className="compare-priority">
          <legend className="compare-priority__legend">
            <Icon name={criterion.icon} size={18} />
            {criterion.label}
          </legend>
          <div className="compare-priority__options">
            {PRIORITY_LEVELS.map((level) => (
              <label key={level.value} className="compare-priority__option">
                <input
                  type="radio"
                  name={`${prefix}-${criterion.id}`}
                  value={level.value}
                  checked={priorities[criterion.id] === level.value}
                  onChange={() => set(criterion.id, level.value)}
                />
                <span>{level.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
