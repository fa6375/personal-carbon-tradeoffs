import { useId, useRef, useState, type FormEvent } from 'react'
import { Button } from '../../../components/Button'
import { ButtonLink } from '../../../components/ButtonLink'
import { CRITERIA, priorityLabel } from '../criteria'
import { comparisonRepository } from '../comparisonRepository'
import { formatDateTime, formatDuration, formatEuro, formatKg, formatPeople } from '../format'
import { getTransportOption } from '../transportOptions'
import type { ComparisonResult, SavedComparison } from '../types'
import { Field, ModeName, Panel } from './CompareUi'

const NAME_MAX = 80

interface SaveComparisonProps {
  result: ComparisonResult
  /** The comparison this result was saved as, if it already has been. */
  saved: SavedComparison | null
  onSaved: (saved: SavedComparison) => void
  onBack: () => void
}

/** Screen 9 — Save comparison. */
export function SaveComparison({ result, saved, onSaved, onBack }: SaveComparisonProps) {
  const { journey, priorities } = result.input
  const [name, setName] = useState(`${journey.from} to ${journey.to}`.slice(0, NAME_MAX))
  const [error, setError] = useState<string>()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLDivElement>(null)
  const id = useId()
  const now = new Date().toISOString()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Give the comparison a name.')
      inputRef.current?.querySelector('input')?.focus()
      return
    }
    setSaving(true)
    setSubmitError(null)
    try {
      const created = await comparisonRepository.create({
        name: trimmed,
        input: result.input,
        options: result.options.map(({ mode, emissionsKg, costEur, timeMinutes, overallScore }) => ({
          mode,
          emissionsKg,
          costEur,
          timeMinutes,
          overallScore,
        })),
        recommended: result.recommended,
      })
      onSaved(created)
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : 'The comparison could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <div className="compare-success" role="status">
        <p className="compare-success__title">Comparison saved</p>
        <p>
          “{saved.name}” was saved on {formatDateTime(saved.savedAt)}. You can open it again from{' '}
          <strong>Saved comparisons</strong>.
        </p>
        <p className="compare-muted">
          It is stored in this browser only, so it is not available on other devices and is deleted if
          you clear this site's data.
        </p>
        <div className="compare-actions compare-actions--start">
          <ButtonLink href="#/saved" icon="arrow-right">
            View saved comparisons
          </ButtonLink>
          <Button variant="secondary" onClick={onBack}>
            Back to results
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="compare-save">
      <form className="compare-form" onSubmit={handleSubmit} noValidate>
        {submitError && (
          <div className="compare-form__summary" role="alert">
            {submitError} Please try again.
          </div>
        )}
        <div ref={inputRef}>
          <Field
            id={`${id}-name`}
            label="Name"
            hint="So you can recognise it later."
            value={name}
            error={error}
            maxLength={NAME_MAX}
            onChange={(value) => {
              setName(value)
              if (value.trim()) setError(undefined)
            }}
          />
        </div>
        <div className="compare-actions">
          <Button variant="secondary" onClick={onBack} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" icon="bookmark" disabled={saving}>
            {saving ? 'Saving…' : 'Save comparison'}
          </Button>
        </div>
      </form>

      <Panel id="compare-save-summary" title="What will be saved">
        <dl className="compare-details">
          <div>
            <dt>Date</dt>
            <dd>{formatDateTime(now)}</dd>
          </div>
          <div>
            <dt>Journey</dt>
            <dd>
              {journey.from} → {journey.to}, {journey.distanceKm} km, {formatPeople(journey.passengers)}
            </dd>
          </div>
          <div>
            <dt>Priorities</dt>
            <dd>
              {CRITERIA.map((criterion) => `${criterion.label}: ${priorityLabel(priorities[criterion.id]).toLowerCase()}`).join(' · ')}
            </dd>
          </div>
          <div>
            <dt>Recommended</dt>
            <dd>{getTransportOption(result.recommended).label}</dd>
          </div>
          <div>
            <dt>Results (per person)</dt>
            <dd>
              <ul className="compare-save__options">
                {result.options.map((option) => (
                  <li key={option.mode}>
                    <ModeName mode={option.mode} size={16} />
                    <span>
                      {formatKg(option.emissionsKg)} · {formatEuro(option.costEur)} · {formatDuration(option.timeMinutes)}
                    </span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </Panel>
    </div>
  )
}
