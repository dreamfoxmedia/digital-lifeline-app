import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import brandIcon from '../assets/brand-icon.png'

export default function WelcomeScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f5f3ef] dark:bg-[#0f0f13] flex flex-col px-6 pt-[calc(env(safe-area-inset-top)+32px)] pb-[calc(env(safe-area-inset-bottom)+32px)]">

      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <img
          src={brandIcon}
          alt="Digital Lifeline"
          className="w-20 h-20 rounded-2xl shadow-lg mb-4"
        />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
          {t('welcome.title')}
        </h1>
      </div>

      {/* Content card */}
      <div className="bg-white dark:bg-[#1a1a24] rounded-2xl p-6 space-y-5 flex-1">

        <p className="text-base font-semibold text-gray-900 dark:text-white leading-snug">
          {t('welcome.setup_done')}
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {t('welcome.more_settings')}
        </p>

        <div className="h-px bg-gray-100 dark:bg-gray-800" />

        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {t('welcome.our_effort')}
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {t('welcome.share')}
        </p>

        <p className="text-base font-semibold text-brand-teal">
          {t('welcome.enjoy')}
        </p>

        <div className="h-px bg-gray-100 dark:bg-gray-800" />

        <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
          {t('welcome.help_text')}{' '}
          <a
            href={t('welcome.help_link')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-teal underline underline-offset-2"
          >
            {t('welcome.help_url')}
          </a>
        </p>

      </div>

      {/* Doorgaan knop */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => navigate('/', { replace: true })}
          className="w-full py-4 rounded-xl bg-brand-teal text-white font-semibold text-base active:scale-[0.98] transition-transform"
        >
          {t('welcome.continue')}
        </button>
      </div>

    </div>
  )
}
