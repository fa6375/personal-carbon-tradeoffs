import { useI18n } from '../i18n'
import './Footer.css'

export function Footer() {
  const { t } = useI18n()
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <p>{t('app.footer', { year: String(year) })}</p>
      <p className="footer__note">{t('app.footerNote')}</p>
    </footer>
  )
}
