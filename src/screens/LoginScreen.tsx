import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

type Tab = 'email' | 'apiKey'

export default function LoginScreen() {
  const { t } = useTranslation()
  const { signInWithPassword, signInWithApiKey } = useAuth()
  const [tab, setTab] = useState<Tab>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signInWithPassword(email, password)
    } catch {
      setError(t('login.error_invalid'))
    } finally {
      setLoading(false)
    }
  }

  async function handleApiKeyLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!apiKey.trim()) return
    setError(null)
    setLoading(true)
    try {
      await signInWithApiKey(apiKey.trim())
    } catch {
      setError(t('login.error_generic'))
    } finally {
      setLoading(false)
    }
  }

  function switchTab(t: Tab) {
    setTab(t)
    setError(null)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white dark:bg-[#0f0f13]">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FFB454] mb-4">
            <svg viewBox="0 0 256 256" className="w-8 h-8" fill="none" stroke="white" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20,128 L72,128 L88,76 L108,180 L128,96 L148,128 L236,128" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Digital Lifeline</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{t('login.title')}</p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-gray-100 dark:bg-[#1a1a24] p-1 mb-6">
          {(['email', 'apiKey'] as Tab[]).map((key) => (
            <button
              key={key}
              onClick={() => switchTab(key)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                tab === key
                  ? 'bg-white dark:bg-[#0f0f13] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {t(`login.tab_${key === 'email' ? 'email' : 'apikey'}`)}
            </button>
          ))}
        </div>

        {/* Email/wachtwoord */}
        {tab === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('login.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-[#FFB454]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('login.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-[#FFB454]"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#FFB454] text-white font-semibold text-base disabled:opacity-60 active:scale-95 transition-transform mt-2"
            >
              {loading ? '...' : t('login.login_btn')}
            </button>
          </form>
        )}

        {/* API-sleutel */}
        {tab === 'apiKey' && (
          <form onSubmit={handleApiKeyLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('login.apikey_label')}
              </label>
              <textarea
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={t('login.apikey_placeholder')}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FFB454] resize-none"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || !apiKey.trim()}
              className="w-full py-3.5 rounded-xl bg-[#FFB454] text-white font-semibold text-base disabled:opacity-60 active:scale-95 transition-transform"
            >
              {loading ? '...' : t('login.apikey_save')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
