import { useI18n } from '../i18n'
import { PlaceholderPage } from './PlaceholderPage'

export function NotFoundPage() {
  const { t } = useI18n()
  return (
    <PlaceholderPage
      title={t('pages.notFound.title')}
      description={t('pages.notFound.description')}
      icon="info"
      emptyTitle={t('pages.notFound.emptyTitle')}
    >
      <p>{t('pages.notFound.body')}</p>
    </PlaceholderPage>
  )
}
