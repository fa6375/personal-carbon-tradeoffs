import { useState } from 'react'
import { Button } from '../../components/Button'
import { isOffline } from '../../hooks/useOnlineStatus'
import { useI18n } from '../../i18n'
import type { DataErrorCode } from '../../lib/dataErrors'
import { dataErrorCode, dataErrorText } from '../../lib/errorMessages'
import { getFirebase } from '../../lib/firebase'
import { useAuth } from '../auth/authContext'
import { getImportMarker, importLocalData, readLocalData, type ImportResult } from './localImport'
import './account.css'

/**
 * Offers to copy activities and comparisons saved in this browser into the
 * signed-in user's account. Renders nothing when there is nothing to import,
 * unless `alwaysShow` is set (Account page).
 */
export function LocalImportPanel({ alwaysShow = false }: { alwaysShow?: boolean }) {
  const { t } = useI18n()
  const { user } = useAuth()
  const [local] = useState(readLocalData)
  const [marker, setMarker] = useState<ImportResult | null>(() => (user ? getImportMarker(user.uid) : null))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<DataErrorCode | null>(null)
  const [dismissed, setDismissed] = useState(false)
  /** True after an import in this view, so its result stays visible. */
  const [justImported, setJustImported] = useState(false)

  if (!user) return null
  const uid = user.uid
  const total = local.activities.length + local.comparisons.length
  const hasLocal = total > 0

  if (!alwaysShow && (dismissed || (marker && !justImported) || (!hasLocal && !local.problem))) return null

  async function runImport() {
    if (busy) return
    const firebase = getFirebase()
    if (!firebase) {
      setError('not-configured')
      return
    }
    if (isOffline()) {
      setError('unavailable')
      return
    }
    setBusy(true)
    setError(null)
    try {
      setMarker(await importLocalData(firebase.db, uid, local))
      setJustImported(true)
    } catch (reason) {
      setError(dataErrorCode(reason))
    } finally {
      setBusy(false)
    }
  }

  const skipped = marker ? marker.activitiesSkipped + marker.comparisonsSkipped : 0

  return (
    <section className="import-panel" aria-labelledby="import-panel-title" aria-busy={busy || undefined}>
      {/* Shown above a page's <h1> on Tracking and Saved, so it is not a heading there. */}
      {alwaysShow ? (
        <h2 id="import-panel-title" className="import-panel__title">
          {t('import.title')}
        </h2>
      ) : (
        <p id="import-panel-title" className="import-panel__title">
          <strong>{t('import.title')}</strong>
        </p>
      )}

      {local.problem && <p className="import-panel__error">{dataErrorText(local.problem)}</p>}

      {!hasLocal && !local.problem && <p>{t('import.nothing')}</p>}

      {hasLocal && (
        <p>
          {t('import.intro', {
            activities: t('import.activities', { count: local.activities.length }),
            comparisons: t('import.savedComparisons', { count: local.comparisons.length }),
          })}
        </p>
      )}

      {marker && (
        <p className="import-panel__success" role="status">
          {t('import.imported', {
            activities: t('import.activities', { count: marker.activitiesImported }),
            comparisons: t('import.comparisons', { count: marker.comparisonsImported }),
          })}
          {skipped > 0 && ` ${t('import.skipped', { count: skipped })}`}
        </p>
      )}

      {error && (
        <p className="import-panel__error" role="alert">
          {t('import.failed', { error: dataErrorText(error) })}
        </p>
      )}

      {hasLocal && (
        <div className="import-panel__actions">
          <Button onClick={runImport} disabled={busy}>
            {busy ? t('import.importing') : marker ? t('import.importAgain') : t('import.import')}
          </Button>
          {!alwaysShow && !marker && (
            <Button variant="secondary" onClick={() => setDismissed(true)} disabled={busy}>
              {t('import.notNow')}
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
