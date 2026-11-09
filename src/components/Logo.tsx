import { Icon } from './Icon'
import './Logo.css'

interface LogoProps {
  /** Where the logo links to. Defaults to the home page. */
  href?: string
}

export function Logo({ href = '#/' }: LogoProps) {
  return (
    <a className="logo" href={href} aria-label="Carbon Choices, go to home">
      <span className="logo__mark">
        <Icon name="leaf" size={18} />
      </span>
      <span className="logo__text">Carbon Choices</span>
    </a>
  )
}
