import { useState } from 'react'
import { Button } from '../../../components/Button'
import { totalWeight } from '../calculate'
import type { Priorities } from '../types'
import { NO_PRIORITY_ERROR } from '../criteria'
import { PriorityFields } from './PriorityFields'

interface SetPrioritiesProps {
  initial: Priorities
  onCompare: (priorities: Priorities) => void
  onBack: (priorities: Priorities) => void
}



/** Screen 4 — Set priorities. */
export function SetPriorities({ initial, onCompare, onBack }: SetPrioritiesProps) {
  const [priorities, setPriorities] = useState(initial)
  const [error, setError] = useState<string>()

  function handleCompare() {
    if (totalWeight(priorities) === 0) {
      setError(NO_PRIORITY_ERROR)
      return
    }
    onCompare(priorities)
  }

  return (
    <div className="compare-step">
      <p className="compare-lead">
        How much does each of these matter to you for this trip? The recommendation gives more
        weight to what matters more. All three are always shown in the results.
      </p>
      <PriorityFields
        priorities={priorities}
        error={error}
        onChange={(next) => {
          setPriorities(next)
          if (totalWeight(next) > 0) setError(undefined)
        }}
      />
      <div className="compare-actions">
        <Button variant="secondary" onClick={() => onBack(priorities)}>
          Back
        </Button>
        <Button icon="arrow-right" onClick={handleCompare}>
          Compare options
        </Button>
      </div>
    </div>
  )
}
