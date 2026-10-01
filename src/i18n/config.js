import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/translation.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'zh', label: '中文' },
]

const localeLoaders = {
  es: () => import('./locales/es/translation.json'),
  fr: () => import('./locales/fr/translation.json'),
  de: () => import('./locales/de/translation.json'),
  pt: () => import('./locales/pt/translation.json'),
  hi: () => import('./locales/hi/translation.json'),
  zh: () => import('./locales/zh/translation.json'),
}

i18n
  .use(initReactI18next)
  .init({
    // English is stable for SSR and the first hydrated render. Browser locale
    // preferences are applied in an effect after hydration.
    lng: 'en',
    resources: { en: { translation: en } },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES.map((language) => language.code),
    interpolation: { escapeValue: false },
  })

/** Load translations on demand so a first-time visitor downloads only English. */
export async function changeLanguage(language) {
  const code = SUPPORTED_LANGUAGES.some((item) => item.code === language) ? language : 'en'
  if (!i18n.hasResourceBundle(code, 'translation')) {
    const loader = localeLoaders[code]
    if (loader) {
      const module = await loader()
      i18n.addResourceBundle(code, 'translation', module.default, true, true)
    }
  }
  return i18n.changeLanguage(code)
}

export default i18n
