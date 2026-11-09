import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { Icon } from './Icon'
import type { IconName } from '../types/icons'
import './Button.css'

type Variant = 'primary' | 'secondary'

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  variant?: Variant
  /** Optional trailing icon. */
  icon?: IconName
  children: ReactNode
}

/** A link styled as a button. Use for navigation; use a <button> for actions. */
export function ButtonLink({
  variant = 'primary',
  icon,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const classes = ['button', `button--${variant}`, className].filter(Boolean).join(' ')
  return (
    <a className={classes} {...rest}>
      <span>{children}</span>
      {icon && <Icon name={icon} size={18} />}
    </a>
  )
}
