import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import brandIcon from '../assets/brand-icon.png'
import { useAuth } from '../context/AuthContext'

export default function LoginScreen() {
  const { t } = useTranslation()
  const { signInWithPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white dark:bg-[#0f0f13]">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <img src={brandIcon} alt="Digital Lifeline" className="w-16 h-16 rounded-2xl shadow-md mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Digital Lifeline</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{t('login.title')}</p>
        </div>

        {/* Formulier */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-brand-teal"
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
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-brand-teal"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand text-white font-semibold text-base disabled:opacity-60 active:scale-95 transition-transform mt-2"
          >
            {loading ? '...' : t('login.login_btn')}
          </button>
        </form>
      </div>
    </div>
  )
}
