import type { ReactNode } from 'react'
import { ButtonLink } from '../components/ButtonLink'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { useI18n } from '../i18n'
import type { IconName } from '../types/icons'
import './PlaceholderPage.css'

interface PlaceholderPageProps {
  title: string
  description: string
  icon: IconName
  emptyTitle?: string
  children?: ReactNode
}

/**
 * Honest placeholder for a section that has not been built yet.
 * Replace the page that uses it with the real feature when it exists.
 */
export function PlaceholderPage({
  title,
  description,
  icon,
  emptyTitle,
  children,
}: PlaceholderPageProps) {
  const { t } = useI18n()
  return (
    <div className="placeholder-page">
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={icon}
        title={emptyTitle ?? title}
        action={
          <ButtonLink href="#/" variant="secondary">
            {t('actions.backToHome')}
          </ButtonLink>
        }
      >
        {children}
      </EmptyState>
    </div>
  )
}
