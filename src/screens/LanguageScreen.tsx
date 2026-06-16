import { useState } from 'react'
import { Preferences } from '@capacitor/preferences'
import brandIcon from '../assets/brand-icon.png'
import i18n from '../i18n'

function FlagNL() {
  return (
    <svg viewBox="0 0 30 20" className="w-9 h-6 rounded-sm shadow-sm" aria-hidden="true">
      <rect width="30" height="20" fill="#21468B" />
      <rect width="30" height="13.33" y="0" fill="#FFFFFF" />
      <rect width="30" height="6.67" y="0" fill="#AE1C28" />
    </svg>
  )
}

function FlagGB() {
  return (
    <svg viewBox="0 0 60 40" className="w-9 h-6 rounded-sm shadow-sm" aria-hidden="true">
      <rect width="60" height="40" fill="#012169" />
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="8" />
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 V40 M0,20 H60" stroke="#FFFFFF" strokeWidth="12" />
      <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  )
}

const LANGUAGES = [
  {
    code: 'nl',
    label: 'Nederlands',
    sublabel: 'mijn.digitallifeline.nl',
    serverUrl: 'https://mijn.digitallifeline.nl',
    Flag: FlagNL,
  },
  {
    code: 'en',
    label: 'English',
    sublabel: 'my.digilifeline.com',
    serverUrl: 'https://my.digilifeline.com',
    Flag: FlagGB,
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
        <img src={brandIcon} alt="Digital Lifeline" className="w-16 h-16 rounded-2xl shadow-md mb-4" />
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
            <lang.Flag />
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
