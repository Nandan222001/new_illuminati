import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { changeLanguage, SUPPORTED_LANGUAGES } from '../i18n/config.js'

/** Apply the saved/browser language only after the English SSR snapshot hydrates. */
export default function LanguagePreference() {
  const { i18n } = useTranslation()

  useEffect(() => {
    let preferred = ''
    try {
      preferred = window.localStorage.getItem('ib_lang') || ''
    } catch {
      // Storage can be unavailable in private browsing; use the browser locale.
    }
    if (!preferred) preferred = window.navigator?.language || ''
    preferred = preferred.toLowerCase().split(/[-_]/)[0]

    if (SUPPORTED_LANGUAGES.some((language) => language.code === preferred) && preferred !== i18n.resolvedLanguage) {
      changeLanguage(preferred).catch(() => {})
    }
  }, [i18n])

  return null
}
