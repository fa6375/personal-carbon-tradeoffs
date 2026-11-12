import { useId, useState } from 'react'
import { SUPPORTED_LOCALES, useI18n, type Locale } from '../i18n'
import { translate } from '../i18n/translate'
import './LanguageSelect.css'

interface LanguageSelectProps {
  /** Visual style: compact in the navigation, roomy on the Settings page. */
  variant?: 'nav' | 'page'
}

/**
 * Language picker. Each option is written in its own language (and marked
 * with that lang), so people can find their language whatever is selected.
 * The change is announced in the new language.
 */
export function LanguageSelect({ variant = 'nav' }: LanguageSelectProps) {
  const { locale, t, setLocale } = useI18n()
  const id = useId()
  const [announcement, setAnnouncement] = useState('')

  return (
    <div className={`language-select language-select--${variant}`}>
      <label htmlFor={id} className="language-select__label">
        {t('language.label')}
      </label>
      <select
        id={id}
        className="language-select__control"
        value={locale}
        onChange={(event) => {
          const next = event.target.value as Locale
          setLocale(next)
          setAnnouncement(translate(next, 'language.changed'))
        }}
      >
        {SUPPORTED_LOCALES.map((code) => (
          <option key={code} value={code} lang={code}>
            {translate(code, `language.names.${code}`)}
          </option>
        ))}
      </select>
      <span className="visually-hidden" role="status">
        {announcement}
      </span>
    </div>
  )
}
