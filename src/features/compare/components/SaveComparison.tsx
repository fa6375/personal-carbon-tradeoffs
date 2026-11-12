import { useId, useRef, useState, type FormEvent } from 'react'
import { Button } from '../../../components/Button'
import { ButtonLink } from '../../../components/ButtonLink'
import { CRITERIA, priorityLabel } from '../criteria'
import { DataError, type DataErrorCode } from '../../../lib/dataErrors'
import { dataErrorCode, dataErrorText } from '../../../lib/errorMessages'
import { isOffline } from '../../../hooks/useOnlineStatus'
import { useI18n } from '../../../i18n'
import { RichText } from '../../../i18n/RichText'
import { useComparisonRepository } from '../useComparisonRepository'
import { formatDateTime, formatDuration, formatEuro, formatKg, formatPeople } from '../format'
import { getTransportOption } from '../transportOptions'
import type { ComparisonResult, SavedComparison } from '../types'
import { Field, ModeName, Panel } from './CompareUi'
import { AuthForm } from '../../auth/AuthForm'
import { useAuth } from '../../auth/authContext'
import '../../auth/auth.css'

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
  const { t } = useI18n()
  const { journey, priorities } = result.input
  const [name, setName] = useState(() => t('compare.save.defaultName', { from: journey.from, to: journey.to }).slice(0, NAME_MAX))
  const [error, setError] = useState(false)
  // 'offline' or a DataError code; the text is translated when shown.
  const [submitError, setSubmitError] = useState<DataErrorCode | 'offline' | null>(null)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLDivElement>(null)
  const id = useId()
  const now = new Date().toISOString()
  const repository = useComparisonRepository()
  const { status: authStatus } = useAuth()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (saving) return
    const trimmed = name.trim()
    if (!trimmed) {
      setError(true)
      inputRef.current?.querySelector('input')?.focus()
      return
    }
    if (isOffline()) {
      setSubmitError('offline')
      return
    }
    setSaving(true)
    setSubmitError(null)
    try {
      if (!repository) throw new DataError('not-signed-in')
      const created = await repository.create({
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
      setSubmitError(dataErrorCode(reason))
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <div className="compare-success" role="status">
        <p className="compare-success__title">{t('compare.save.savedTitle')}</p>
        <p>
          <RichText
            text={t('compare.save.savedText', { name: saved.name, date: formatDateTime(saved.savedAt) })}
            values={{ saved: <strong>{t('compare.save.savedLink')}</strong> }}
          />
        </p>
        <p className="compare-muted">{t('compare.save.storedNote')}</p>
        <div className="compare-actions compare-actions--start">
          <ButtonLink href="#/saved" icon="arrow-right">
            {t('compare.save.viewSaved')}
          </ButtonLink>
          <Button variant="secondary" onClick={onBack}>
            {t('compare.save.backToResults')}
          </Button>
        </div>
      </div>
    )
  }

  if (!repository) {
    return (
      <div className="auth-gate">
        <p className="auth-gate__reason">
          {authStatus === 'not-configured'
            ? dataErrorText('not-configured')
            : authStatus === 'loading'
              ? t('auth.checking')
              : t('compare.save.signInReason')}
        </p>
        {authStatus === 'signed-out' && <AuthForm />}
      </div>
    )
  }

  return (
    <div className="compare-save">
      <form className="compare-form" onSubmit={handleSubmit} noValidate>
        {submitError && (
          <div className="compare-form__summary" role="alert">
            {submitError === 'offline'
              ? t('offline.saveBlocked')
              : t('compare.save.failed', { error: dataErrorText(submitError) })}
          </div>
        )}
        <div ref={inputRef}>
          <Field
            id={`${id}-name`}
            label={t('compare.save.name')}
            hint={t('compare.save.nameHint')}
            value={name}
            error={error ? t('compare.validation.nameRequired') : undefined}
            maxLength={NAME_MAX}
            onChange={(value) => {
              setName(value)
              if (value.trim()) setError(false)
            }}
          />
        </div>
        <div className="compare-actions">
          <Button variant="secondary" onClick={onBack} disabled={saving}>
            {t('compare.save.cancel')}
          </Button>
          <Button type="submit" icon="bookmark" disabled={saving}>
            {saving ? t('actions.saving') : t('compare.save.submit')}
          </Button>
        </div>
      </form>

      <Panel id="compare-save-summary" title={t('compare.save.whatSaved')}>
        <dl className="compare-details">
          <div>
            <dt>{t('compare.save.date')}</dt>
            <dd>{formatDateTime(now)}</dd>
          </div>
          <div>
            <dt>{t('compare.save.journey')}</dt>
            <dd>
              {t('compare.save.journeyValue', {
                from: journey.from,
                to: journey.to,
                distance: journey.distanceKm,
                people: formatPeople(journey.passengers),
              })}
            </dd>
          </div>
          <div>
            <dt>{t('compare.save.priorities')}</dt>
            <dd>
              {CRITERIA.map((criterion) =>
                t('compare.save.priorityItem', { criterion: criterion.label, level: priorityLabel(priorities[criterion.id]) }),
              ).join(' · ')}
            </dd>
          </div>
          <div>
            <dt>{t('compare.save.recommended')}</dt>
            <dd>{getTransportOption(result.recommended).label}</dd>
          </div>
          <div>
            <dt>{t('compare.save.resultsPerPerson')}</dt>
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
