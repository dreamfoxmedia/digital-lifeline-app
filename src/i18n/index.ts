import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import nl from './nl.json'
import en from './en.json'

i18n.use(initReactI18next).init({
  resources: {
    nl: { translation: nl },
    en: { translation: en },
  },
  lng: 'nl',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export async function loadLanguage(lang: string): Promise<void> {
  if (i18n.hasResourceBundle(lang, 'translation')) return
  const module = await import(`./${lang}.json`)
  i18n.addResourceBundle(lang, 'translation', module.default)
}

export default i18n
