import { LanguageSelect } from '../components/LanguageSelect'
import { PageHeader } from '../components/PageHeader'
import { useI18n } from '../i18n'
import './PlaceholderPage.css'

export function SettingsPage() {
  const { t } = useI18n()
  return (
    <div className="placeholder-page">
      <PageHeader title={t('pages.settings.title')} description={t('pages.settings.description')} />
      <section className="settings-card" aria-labelledby="settings-language">
        <h2 id="settings-language" className="settings-card__title">
          {t('pages.settings.languageTitle')}
        </h2>
        <p className="settings-card__text">{t('pages.settings.languageDescription')}</p>
        <LanguageSelect variant="page" />
      </section>
      <section className="settings-card" aria-labelledby="settings-more">
        <h2 id="settings-more" className="settings-card__title">
          {t('pages.settings.moreTitle')}
        </h2>
        <p className="settings-card__text">{t('pages.settings.moreBody')}</p>
      </section>
    </div>
  )
}
