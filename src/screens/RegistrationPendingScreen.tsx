import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import type { MeResponse } from '../types'

interface StepItem {
  key: string
  label: string
  done: boolean
}

export default function RegistrationPendingScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const meQuery = useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: () => apiClient.get('/api/mobile/me'),
  })

  const reg = meQuery.data?.viewer

  const steps: StepItem[] = [
    {
      key: 'disclaimer',
      label: t('reg.pending_step_disclaimer'),
      done: reg?.monitoring_disclaimer_accepted ?? false,
    },
    {
      key: 'profile',
      label: t('reg.pending_step_profile'),
      done: ['profile_completed', 'email_verified', 'phone_verified', 'partially_completed', 'fully_completed'].includes(reg?.registration_status ?? ''),
    },
    {
      key: 'email',
      label: t('reg.pending_step_email'),
      done: reg?.email_verified ?? false,
    },
    {
      key: 'phone',
      label: t('reg.pending_step_phone'),
      done: reg?.phone_verified ?? false,
    },
  ]

  const completedCount = steps.filter(s => s.done).length
  const pct = Math.round((completedCount / steps.length) * 100)

  const firstIncomplete = steps.findIndex(s => !s.done)
  const resumeStep = firstIncomplete >= 0 ? firstIncomplete + 1 : 6

  return (
    <div className="min-h-screen bg-[#f5f3ef] dark:bg-[#0f0f13] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-6 bg-white dark:bg-[#0f0f13] border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center">
            <span className="text-xl">📋</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              {t('reg.pending_title')}
            </h1>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
          {t('reg.pending_text')}
        </p>

        {/* Voortgangsbalk */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {completedCount} / {steps.length} stappen
          </span>
          <span className="text-xs text-gray-400">{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-teal rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stappenlijst */}
      <div className="flex-1 px-6 py-6">
        <div className="bg-white dark:bg-[#1a1a24] rounded-2xl overflow-hidden">
          {steps.map((item, i) => (
            <div
              key={item.key}
              className={`flex items-center gap-4 px-4 py-4 ${i < steps.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                {item.done
                  ? <span className="text-green-600 dark:text-green-400 text-sm font-bold">✓</span>
                  : <span className="text-gray-400 text-sm font-bold">{i + 1}</span>
                }
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${item.done ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                  {item.label}
                </p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${item.done ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'}`}>
                {item.done ? t('reg.pending_done') : t('reg.pending_todo')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Knop */}
      <div className="px-6 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <button
          type="button"
          onClick={() => navigate(`/registration?step=${resumeStep}`, { replace: true })}
          className="w-full py-4 rounded-xl bg-brand-teal text-white font-semibold text-base active:scale-[0.98] transition-transform"
        >
          {t('reg.pending_resume')}
        </button>
      </div>
    </div>
  )
}
