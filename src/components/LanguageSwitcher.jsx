import { useTranslation } from 'react-i18next'
import { changeLanguage as loadLanguage, SUPPORTED_LANGUAGES } from '../i18n/config'

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const current = SUPPORTED_LANGUAGES.some((l) => l.code === i18n.resolvedLanguage) ? i18n.resolvedLanguage : 'en'
  const changeLanguage = (event) => {
    const language = event.target.value
    try { window.localStorage.setItem('ib_lang', language) } catch { /* preference lasts for this page only */ }
    loadLanguage(language).catch(() => {})
  }

  return (
    <select
      className="lang-select"
      aria-label={t('nav.language')}
      title={t('nav.language')}
      value={current}
      onChange={changeLanguage}
    >
      {SUPPORTED_LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  )
}
