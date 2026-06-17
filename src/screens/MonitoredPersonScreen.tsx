import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import type { MeResponse } from '../types'

export default function MonitoredPersonScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [pressed, setPressed] = useState(false)
  const [sending, setSending] = useState(false)

  const meQuery = useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: () => apiClient.get('/api/mobile/me'),
  })

  const name = meQuery.data?.profile?.full_name?.split(' ')[0] ?? ''

  async function handleEmergency() {
    if (pressed || sending) return
    setSending(true)
    try {
      await apiClient.post('/api/mobile/emergency', {})
    } catch {
      // toon altijd de bevestiging, ook als het verzoek mislukt
    } finally {
      setSending(false)
      setPressed(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#ede9e3] flex flex-col items-center justify-between px-6 pt-[calc(env(safe-area-inset-top)+48px)] pb-[calc(env(safe-area-inset-bottom)+32px)]">

      {/* Begroeting */}
      <div className="text-center">
        <p className="text-gray-500 text-base">{t('monitored.greeting')}</p>
        {name ? <p className="text-3xl font-bold text-gray-900 mt-1">{name}</p> : null}
      </div>

      {/* Noodknop */}
      <div className="flex flex-col items-center gap-6">
        {!pressed ? (
          <>
            <button
              onClick={handleEmergency}
              disabled={sending}
              className="w-52 h-52 rounded-full bg-red-500 active:bg-red-700 shadow-xl flex items-center justify-center transition-transform active:scale-95 disabled:opacity-70"
            >
              <span className="text-white font-bold text-2xl text-center leading-tight px-4">
                {sending ? t('monitored.sending') : t('monitored.button')}
              </span>
            </button>
            <p className="text-gray-500 text-sm text-center max-w-xs">
              {t('monitored.instruction')}
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-52 h-52 rounded-full bg-green-500 shadow-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl text-center leading-tight px-4">
                {t('monitored.sent')}
              </span>
            </div>
            <p className="text-gray-600 text-sm text-center max-w-xs font-medium">
              {t('monitored.sent_detail')}
            </p>
            <button
              onClick={() => setPressed(false)}
              className="mt-2 px-6 py-2 rounded-xl border border-gray-300 text-gray-500 text-sm"
            >
              {t('monitored.reset')}
            </button>
          </div>
        )}
      </div>

      {/* Instellingen onderaan */}
      <button
        onClick={() => navigate('/settings')}
        className="flex items-center gap-2 text-gray-400 text-sm py-2 active:text-gray-600"
      >
        <span>⚙️</span> {t('status.settings_btn')}
      </button>

    </div>
  )
}
