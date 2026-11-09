import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { IconName } from '../types/icons'
import { Icon } from './Icon'
import './Button.css'

type Variant = 'primary' | 'secondary'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  /** Optional trailing icon. */
  icon?: IconName
  children: ReactNode
}

/** A <button> with the shared button styles. Use ButtonLink for navigation. */
export function Button({
  variant = 'primary',
  icon,
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  const classes = ['button', `button--${variant}`, className].filter(Boolean).join(' ')
  return (
    <button type={type} className={classes} {...rest}>
      <span>{children}</span>
      {icon && <Icon name={icon} size={18} />}
    </button>
  )
}
