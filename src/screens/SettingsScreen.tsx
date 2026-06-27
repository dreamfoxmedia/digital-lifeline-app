import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Preferences } from '@capacitor/preferences'
import { apiClient } from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'
import { saveTheme, loadSavedTheme, type Theme } from '../lib/theme'
import ProfileForm from '../components/ProfileForm'
import PhoneVerifySection from '../components/PhoneVerifySection'
import type { MeResponse, ProfileFormData } from '../types'

export default function SettingsScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { signOut, signOutAll, mode } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [showLogoutSheet, setShowLogoutSheet] = useState(false)
  const [errors] = useState<Partial<Record<keyof ProfileFormData, string>>>({})
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    loadSavedTheme().then(setTheme)
  }, [])

  const meQuery = useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: () => apiClient.get('/api/mobile/me'),
  })

  const profile = meQuery.data?.profile
  const viewer = meQuery.data?.viewer

  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    display_name: '',
    phone: '',
    relation: '',
    notify_emergency: true,
    notify_whatsapp: false,
    notify_categories: [],
  })

  useEffect(() => {
    if (profile && viewer) {
      setFormData({
        full_name: profile.full_name ?? '',
        display_name: viewer.display_name ?? '',
        phone: viewer.phone ?? '',
        relation: viewer.relation ?? '',
        notify_emergency: viewer.notify_emergency ?? true,
        notify_whatsapp: viewer.notify_whatsapp ?? false,
        notify_categories: viewer.notify_categories ?? [],
      })
    }
  }, [profile, viewer])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setApiError(null)
    setSaving(true)
    try {
      await apiClient.patch('/api/mobile/me', formData)
      queryClient.invalidateQueries({ queryKey: ['me'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : t('common.error_unknown'))
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveApiKey() {
    await Preferences.remove({ key: 'apiKey' })
    await signOut()
  }

  async function handleTheme(t2: Theme) {
    setTheme(t2)
    await saveTheme(t2)
  }

  return (
    <div className="min-h-screen bg-[#f5f3ef] dark:bg-[#0f0f13] flex flex-col">
      {/* Header */}
      <div className="px-4 pt-[calc(env(safe-area-inset-top)+16px)] pb-4 bg-white dark:bg-[#0f0f13] border-b border-gray-100 dark:border-transparent flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center active:bg-gray-200 dark:active:bg-white/20"
          aria-label={t('common.back')}
        >
          <span className="text-gray-700 dark:text-white text-base">←</span>
        </button>
        <h1 className="text-gray-900 dark:text-white font-bold text-lg">{t('settings.title')}</h1>
      </div>

      <form onSubmit={handleSave} className="flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+24px)]">
        {/* Profiel sectie */}
        <div className="px-4 pt-6">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            {t('settings.section_profile')}
          </p>
          <div className="bg-white dark:bg-[#1a1a24] rounded-2xl p-4 space-y-5">
            <ProfileForm data={formData} onChange={setFormData} errors={errors} showPhone={false} />
            <PhoneVerifySection currentPhone={viewer?.phone ?? ''} />
          </div>
        </div>

        {/* Meldingen sectie */}
        <div className="px-4 pt-6">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            {t('settings.section_notifications')}
          </p>
          <div className="bg-white dark:bg-[#1a1a24] rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="w-full flex items-center justify-between px-4 py-4 active:bg-gray-50 dark:active:bg-gray-800"
            >
              <div>
                <p className="text-gray-900 dark:text-white font-medium text-left">{t('settings.notif_row_label')}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 text-left mt-0.5">{t('settings.notif_row_sub')}</p>
              </div>
              <span className="text-gray-400 text-lg ml-3">→</span>
            </button>
          </div>
        </div>

        {/* Weergave */}
        <div className="px-4 pt-6">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            {t('settings.section_appearance')}
          </p>
          <div className="bg-white dark:bg-[#1a1a24] rounded-2xl p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{t('settings.theme_label')}</p>
            <div className="flex gap-2">
              {(['system', 'light', 'dark'] as Theme[]).map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleTheme(opt)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    theme === opt
                      ? 'bg-brand-teal text-white border-brand-teal'
                      : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {t(`settings.theme_${opt}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Taal */}
        <div className="px-4 pt-6">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            {t('settings.section_language')}
          </p>
          <div className="bg-white dark:bg-[#1a1a24] rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => navigate('/language')}
              className="w-full flex items-center justify-between px-4 py-4 active:bg-gray-50 dark:active:bg-gray-800"
            >
              <p className="text-gray-900 dark:text-white font-medium text-left">{t('settings.change_language')}</p>
              <span className="text-gray-400 text-lg ml-3">→</span>
            </button>
          </div>
        </div>

        {/* Opslaan */}
        {apiError && (
          <p className="mx-4 mt-4 text-red-500 text-sm text-center">{apiError}</p>
        )}
        {saved && (
          <p className="mx-4 mt-4 text-green-500 text-sm text-center font-medium">{t('settings.saved')}</p>
        )}
        <div className="px-4 mt-6">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 rounded-xl bg-brand text-white font-semibold text-base disabled:opacity-60 active:scale-95 transition-transform"
          >
            {saving ? '...' : t('settings.save')}
          </button>
        </div>

        {/* Uitloggen / API-sleutel wissen */}
        <div className="px-4 mt-4 space-y-3">
          {mode === 'apiKey' && (
            <button
              type="button"
              onClick={handleRemoveApiKey}
              className="w-full py-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium text-base active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
            >
              {t('settings.remove_apikey')}
            </button>
          )}
          <button
            type="button"
            onClick={mode === 'session' ? () => setShowLogoutSheet(true) : signOut}
            className="w-full py-4 rounded-xl border border-red-200 dark:border-red-900 text-red-500 font-medium text-base active:bg-red-50 dark:active:bg-red-900/20 transition-colors"
          >
            {t('settings.logout')}
          </button>
        </div>

        {/* Uitlog-keuzesheet */}
        {showLogoutSheet && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 px-4 pb-8" onClick={() => setShowLogoutSheet(false)}>
            <div className="bg-white dark:bg-[#1a1a24] rounded-2xl w-full max-w-sm p-2" onClick={e => e.stopPropagation()}>
              <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider pt-4 pb-2 px-4">
                {t('settings.logout')}
              </p>
              <button
                type="button"
                onClick={signOut}
                className="w-full py-4 px-4 text-left text-red-500 font-medium text-base active:bg-gray-50 dark:active:bg-gray-800 rounded-xl"
              >
                {t('settings.logout_this_device')}
              </button>
              <div className="h-px bg-gray-100 dark:bg-gray-800 mx-4" />
              <button
                type="button"
                onClick={signOutAll}
                className="w-full py-4 px-4 text-left text-red-500 font-medium text-base active:bg-gray-50 dark:active:bg-gray-800 rounded-xl"
              >
                {t('settings.logout_all_devices')}
              </button>
              <div className="h-px bg-gray-100 dark:bg-gray-800 mx-4" />
              <button
                type="button"
                onClick={() => setShowLogoutSheet(false)}
                className="w-full py-4 px-4 text-center text-gray-500 dark:text-gray-400 font-medium text-base active:bg-gray-50 dark:active:bg-gray-800 rounded-xl"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
