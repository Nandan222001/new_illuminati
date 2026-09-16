import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../i18n/config'

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const current = SUPPORTED_LANGUAGES.some((l) => l.code === i18n.resolvedLanguage) ? i18n.resolvedLanguage : 'en'

  return (
    <select
      className="lang-select"
      aria-label={t('nav.language')}
      title={t('nav.language')}
      value={current}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
    >
      {SUPPORTED_LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  )
}
