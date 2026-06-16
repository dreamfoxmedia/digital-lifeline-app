import { useState } from 'react'
import { Preferences } from '@capacitor/preferences'
import i18n from '../i18n'

const LANGUAGES = [
  {
    code: 'nl',
    label: 'Nederlands',
    sublabel: 'mijn.digitallifeline.nl',
    serverUrl: 'https://mijn.digitallifeline.nl',
    flag: '🇳🇱',
  },
  {
    code: 'en',
    label: 'English',
    sublabel: 'my.digilifeline.com',
    serverUrl: 'https://my.digilifeline.com',
    flag: '🇬🇧',
  },
]

interface Props {
  onDone: () => void
}

export default function LanguageScreen({ onDone }: Props) {
  const [loading, setLoading] = useState(false)

  async function choose(lang: typeof LANGUAGES[0]) {
    setLoading(true)
    await Preferences.set({ key: 'language', value: lang.code })
    await Preferences.set({ key: 'serverUrl', value: lang.serverUrl })
    await i18n.changeLanguage(lang.code)
    onDone()
  }

  return (
    <div className="min-h-screen bg-[#ede9e3] flex flex-col items-center justify-center px-6 pb-[env(safe-area-inset-bottom)]">
      <div className="mb-10 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-[#FFB454] flex items-center justify-center mb-4 shadow-md">
          <svg viewBox="0 0 256 256" className="w-8 h-8" fill="none" stroke="white" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20,128 L72,128 L88,76 L108,180 L128,96 L148,128 L236,128" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Digital Lifeline</h1>
      </div>

      <p className="text-gray-500 text-sm mb-8 text-center">
        Kies uw taal&nbsp;&nbsp;·&nbsp;&nbsp;Choose your language
      </p>

      <div className="w-full max-w-sm flex flex-col gap-4">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => choose(lang)}
            disabled={loading}
            className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm active:scale-95 transition-transform disabled:opacity-60 text-left"
          >
            <span className="text-4xl leading-none">{lang.flag}</span>
            <div>
              <p className="font-bold text-gray-900 text-lg leading-tight">{lang.label}</p>
              <p className="text-gray-400 text-sm mt-0.5">{lang.sublabel}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
