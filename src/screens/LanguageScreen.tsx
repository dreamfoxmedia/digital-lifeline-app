import { useState } from 'react'
import { Preferences } from '@capacitor/preferences'
import brandIcon from '../assets/brand-icon.png'
import i18n, { loadLanguage } from '../i18n'
import { clearAuthCache } from '../lib/apiClient'

const LANGUAGES = [
  { code: 'nl', label: 'Nederlands',        flag: '🇳🇱', serverUrl: 'https://mijn.digitallifeline.nl' },
  { code: 'en', label: 'English',           flag: '🇬🇧', serverUrl: 'https://my.digilifeline.com' },
  { code: 'zh', label: '中文 (简体)',        flag: '🇨🇳', serverUrl: 'https://my.digilifeline.com' },
  { code: 'hi', label: 'हिन्दी',            flag: '🇮🇳', serverUrl: 'https://my.digilifeline.com' },
  { code: 'es', label: 'Español',           flag: '🇪🇸', serverUrl: 'https://my.digilifeline.com' },
  { code: 'ar', label: 'العربية',           flag: '🇸🇦', serverUrl: 'https://my.digilifeline.com' },
  { code: 'fr', label: 'Français',          flag: '🇫🇷', serverUrl: 'https://my.digilifeline.com' },
  { code: 'bn', label: 'বাংলা',             flag: '🇧🇩', serverUrl: 'https://my.digilifeline.com' },
  { code: 'pt', label: 'Português',         flag: '🇧🇷', serverUrl: 'https://my.digilifeline.com' },
  { code: 'id', label: 'Bahasa Indonesia',  flag: '🇮🇩', serverUrl: 'https://my.digilifeline.com' },
  { code: 'ur', label: 'اردو',              flag: '🇵🇰', serverUrl: 'https://my.digilifeline.com' },
  { code: 'ru', label: 'Русский',           flag: '🇷🇺', serverUrl: 'https://my.digilifeline.com' },
  { code: 'ja', label: '日本語',             flag: '🇯🇵', serverUrl: 'https://my.digilifeline.com' },
  { code: 'de', label: 'Deutsch',           flag: '🇩🇪', serverUrl: 'https://my.digilifeline.com' },
  { code: 'ko', label: '한국어',             flag: '🇰🇷', serverUrl: 'https://my.digilifeline.com' },
  { code: 'it', label: 'Italiano',          flag: '🇮🇹', serverUrl: 'https://my.digilifeline.com' },
  { code: 'tr', label: 'Türkçe',            flag: '🇹🇷', serverUrl: 'https://my.digilifeline.com' },
]

interface Props {
  onDone: () => void
}

export default function LanguageScreen({ onDone }: Props) {
  const [loading, setLoading] = useState(false)

  async function choose(lang: typeof LANGUAGES[0]) {
    setLoading(true)
    await loadLanguage(lang.code)
    await Preferences.set({ key: 'language', value: lang.code })
    await Preferences.set({ key: 'languageConfirmed', value: '1' })
    await Preferences.set({ key: 'serverUrl', value: lang.serverUrl })
    clearAuthCache()
    await i18n.changeLanguage(lang.code)
    onDone()
  }

  return (
    <div className="min-h-screen bg-[#f5f3ef] dark:bg-[#0f0f13] flex flex-col items-center justify-center px-6 pb-[env(safe-area-inset-bottom)]">
      <div className="mb-10 flex flex-col items-center">
        <img src={brandIcon} alt="Digital Lifeline" className="w-16 h-16 rounded-2xl shadow-md mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Digital Lifeline</h1>
      </div>

      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 text-center">
        Kies uw taal&nbsp;·&nbsp;Choose your language&nbsp;·&nbsp;选择语言
      </p>

      <div className="w-full max-w-sm flex flex-col gap-3">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => choose(lang)}
            disabled={loading}
            className="w-full bg-white dark:bg-[#1a1a24] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm active:scale-95 transition-transform disabled:opacity-60 text-left"
          >
            <span className="text-3xl leading-none">{lang.flag}</span>
            <p className="font-semibold text-gray-900 dark:text-white text-base leading-tight">{lang.label}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
