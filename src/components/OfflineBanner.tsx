import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { Icon } from './Icon'
import './OfflineBanner.css'

/**
 * App-wide connection notice. Shown while the browser is offline, then a short
 * "back online" message. The live region is always rendered so screen readers
 * announce both changes.
 */
export function OfflineBanner() {
  const { t } = useI18n()
  const online = useOnlineStatus()
  const [showBackOnline, setShowBackOnline] = useState(false)
  const wasOffline = useRef(!online)

  useEffect(() => {
    if (!online) {
      wasOffline.current = true
      return
    }
    if (!wasOffline.current) return
    wasOffline.current = false
    setShowBackOnline(true)
    const timer = setTimeout(() => setShowBackOnline(false), 5000)
    return () => clearTimeout(timer)
  }, [online])

  return (
    <div className="offline-banner__region" role="status" aria-live="polite">
      {!online && (
        <p className="offline-banner offline-banner--offline">
          <Icon name="info" size={18} />
          <span>{t('offline.banner')}</span>
        </p>
      )}
      {online && showBackOnline && (
        <p className="offline-banner offline-banner--online">
          <Icon name="check" size={18} />
          <span>{t('offline.backOnline')}</span>
        </p>
      )}
    </div>
  )
}
