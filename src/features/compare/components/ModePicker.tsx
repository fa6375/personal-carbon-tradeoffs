import { useId } from 'react'
import { Icon } from '../../../components/Icon'
import { useI18n } from '../../../i18n'
import { TRANSPORT_OPTIONS } from '../transportOptions'
import type { TransportOptionId } from '../types'

interface ModePickerProps {
  legend: string
  selected: TransportOptionId[]
  error?: string
  onChange: (modes: TransportOptionId[]) => void
  compact?: boolean
}

/** Checkbox cards for choosing the transport options to compare (screen 2 and the scenario screen). */
export function ModePicker({ legend, selected, error, onChange, compact = false }: ModePickerProps) {
  const { t } = useI18n()
  // Unique, because the picker appears on two screens.
  const errorId = `${useId()}-modes-error`

  function toggle(id: TransportOptionId, checked: boolean) {
    // Keep the options in the order they are listed, whatever order they were ticked in.
    const next = TRANSPORT_OPTIONS.map((option) => option.id).filter((optionId) =>
      optionId === id ? checked : selected.includes(optionId),
    )
    onChange(next)
  }

  return (
    <fieldset
      className={`compare-modes${compact ? ' compare-modes--compact' : ''}`}
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="compare-modes__legend">{legend}</legend>
      <p className="compare-modes__count" aria-live="polite">
        {t('compare.transport.selected', { count: selected.length })}
      </p>
      {error && (
        <p id={errorId} className="compare-field__error" role="alert">
          {error}
        </p>
      )}
      <ul className="compare-modes__list">
        {TRANSPORT_OPTIONS.map((option) => {
          const checked = selected.includes(option.id)
          return (
            <li key={option.id}>
              <label className={`compare-mode-card${checked ? ' compare-mode-card--checked' : ''}`}>
                <input
                  type="checkbox"
                  className="compare-mode-card__input"
                  checked={checked}
                  onChange={(event) => toggle(option.id, event.target.checked)}
                />
                <span className={`compare-mode__icon compare-mode__icon--${option.id} compare-mode-card__icon`}>
                  <Icon name={option.icon} size={compact ? 18 : 22} />
                </span>
                <span className="compare-mode-card__text">
                  <span className="compare-mode-card__title">{option.label}</span>
                  {!compact && <span className="compare-mode-card__description">{option.description}</span>}
                </span>
                <span className="compare-mode-card__check" aria-hidden="true">
                  {checked && <Icon name="check" size={16} />}
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </fieldset>
  )
}
