import { useI18n } from '../i18n'
import { Icon } from './Icon'
import './Logo.css'

interface LogoProps {
  /** Where the logo links to. Defaults to the home page. */
  href?: string
}

export function Logo({ href = '#/' }: LogoProps) {
  const { t } = useI18n()
  return (
    <a className="logo" href={href} aria-label={t('app.logoLabel')}>
      <span className="logo__mark">
        <Icon name="leaf" size={18} />
      </span>
      <span className="logo__text">{t('app.name')}</span>
    </a>
  )
}
