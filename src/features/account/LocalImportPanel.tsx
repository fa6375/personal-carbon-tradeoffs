import { useState } from 'react'
import { Button } from '../../components/Button'
import { DEFAULT_ERROR_MESSAGES } from '../../lib/errorMessages'
import { getFirebase } from '../../lib/firebase'
import { useAuth } from '../auth/authContext'
import { getImportMarker, importLocalData, readLocalData, type ImportResult } from './localImport'
import './account.css'

const plural = new Intl.PluralRules('en')
function count(n: number, one: string, many: string) {
  return `${n} ${plural.select(n) === 'one' ? one : many}`
}

/**
 * Offers to copy activities and comparisons saved in this browser into the
 * signed-in user's account. Renders nothing when there is nothing to import,
 * unless `alwaysShow` is set (Account page).
 */
export function LocalImportPanel({ alwaysShow = false }: { alwaysShow?: boolean }) {
  const { user } = useAuth()
  const [local] = useState(readLocalData)
  const [marker, setMarker] = useState<ImportResult | null>(() => (user ? getImportMarker(user.uid) : null))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)
  /** True after an import in this view, so its result stays visible. */
  const [justImported, setJustImported] = useState(false)

  if (!user) return null
  const uid = user.uid
  const total = local.activities.length + local.comparisons.length
  const hasLocal = total > 0

  if (!alwaysShow && (dismissed || (marker && !justImported) || (!hasLocal && !local.problem))) return null

  async function runImport() {
    const firebase = getFirebase()
    if (!firebase) {
      setError(DEFAULT_ERROR_MESSAGES['not-configured'])
      return
    }
    setBusy(true)
    setError(null)
    try {
      setMarker(await importLocalData(firebase.db, uid, local))
      setJustImported(true)
    } catch (reason) {
      setError(`${reason instanceof Error ? reason.message : DEFAULT_ERROR_MESSAGES.unknown} Nothing was removed from this browser, so you can try again.`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="import-panel" aria-labelledby="import-panel-title">
      {/* Shown above a page's <h1> on Tracking and Saved, so it is not a heading there. */}
      {alwaysShow ? (
        <h2 id="import-panel-title" className="import-panel__title">
          Data saved in this browser
        </h2>
      ) : (
        <p id="import-panel-title" className="import-panel__title">
          <strong>Data saved in this browser</strong>
        </p>
      )}

      {local.problem && <p className="import-panel__error">{DEFAULT_ERROR_MESSAGES[local.problem]}</p>}

      {!hasLocal && !local.problem && <p>There are no activities or comparisons saved only in this browser.</p>}

      {hasLocal && (
        <p>
          Before accounts existed, Carbon Choices saved data only in this browser. This browser has{' '}
          {count(local.activities.length, 'activity', 'activities')} and{' '}
          {count(local.comparisons.length, 'saved comparison', 'saved comparisons')}. Import them to keep them in your
          account. Items already in your account are skipped, and nothing is deleted from this browser.
        </p>
      )}

      {marker && (
        <p className="import-panel__success" role="status">
          Imported {count(marker.activitiesImported, 'activity', 'activities')} and{' '}
          {count(marker.comparisonsImported, 'comparison', 'comparisons')}
          {marker.activitiesSkipped + marker.comparisonsSkipped > 0 &&
            ` (${marker.activitiesSkipped + marker.comparisonsSkipped} already in your account were skipped)`}
          .
        </p>
      )}

      {error && (
        <p className="import-panel__error" role="alert">
          {error}
        </p>
      )}

      {hasLocal && (
        <div className="import-panel__actions">
          <Button onClick={runImport} disabled={busy}>
            {busy ? 'Importing…' : marker ? 'Import again' : 'Import into my account'}
          </Button>
          {!alwaysShow && !marker && (
            <Button variant="secondary" onClick={() => setDismissed(true)} disabled={busy}>
              Not now
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
