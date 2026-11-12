/** Text for AuthErrorCode values, translated through src/i18n (auth.errors.*). */
import { t } from '../../i18n'
import { PASSWORD_MIN_LENGTH, type AuthErrorCode } from './authService'

export function authErrorText(code: AuthErrorCode): string {
  return t(`auth.errors.${code}`, { min: PASSWORD_MIN_LENGTH })
}
