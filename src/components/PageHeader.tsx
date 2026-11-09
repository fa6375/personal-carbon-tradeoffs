import type { ReactNode } from 'react'
import './PageHeader.css'

interface PageHeaderProps {
  title: string
  /** Small label above the title. */
  eyebrow?: string
  description?: ReactNode
}

/** Standard page title block. Renders the page's single <h1>. */
export function PageHeader({ title, eyebrow, description }: PageHeaderProps) {
  return (
    <header className="page-header">
      {eyebrow && <p className="page-header__eyebrow">{eyebrow}</p>}
      <h1 className="page-header__title" tabIndex={-1}>
        {title}
      </h1>
      {description && <p className="page-header__description">{description}</p>}
    </header>
  )
}
