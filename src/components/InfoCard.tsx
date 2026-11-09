import type { ReactNode } from 'react'
import type { IconName } from '../types/icons'
import { Icon } from './Icon'
import './InfoCard.css'

interface InfoCardProps {
  icon: IconName
  title: string
  children: ReactNode
  /** Heading level, so the card fits the surrounding outline. Defaults to h3. */
  headingLevel?: 'h2' | 'h3' | 'h4'
}

export function InfoCard({ icon, title, children, headingLevel = 'h3' }: InfoCardProps) {
  const Heading = headingLevel
  return (
    <article className="info-card">
      <span className="info-card__icon">
        <Icon name={icon} size={22} />
      </span>
      <Heading className="info-card__title">{title}</Heading>
      <div className="info-card__body">{children}</div>
    </article>
  )
}
