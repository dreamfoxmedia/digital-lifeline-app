import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import type { MeResponse } from '../types'

const LEVELS = [
  { key: 'minor', labelKey: 'reg.notif_level_minor', descKey: 'reg.notif_level_minor_desc' },
  { key: 'warning', labelKey: 'reg.notif_level_warning', descKey: 'reg.notif_level_warning_desc' },
  { key: 'emergency', labelKey: 'reg.notif_level_emergency', descKey: 'reg.notif_level_emergency_desc' },
] as const

interface NotifState {
  emailLevels: string[]
  pushLevels: string[]
  notifySms: boolean
  notifyWhatsapp: boolean
  notifyTelegram: boolean
}

function toggle(arr: string[], key: string): string[] {
  return arr.includes(key) ? arr.filter(l => l !== key) : [...arr, key]
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        checked ? 'bg-brand-teal border-brand-teal' : 'border-gray-300 dark:border-gray-600'
      }`}
    >
      {checked && <span className="text-white text-xs font-bold leading-none">✓</span>}
    </button>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
      {label}
    </p>
  )
}

function SubHeader({ label }: { label: string }) {
  return (
    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-1">
      {label}
    </p>
  )
}

function LevelRows({
  selected,
  disabled,
  onToggle,
}: {
  selected: string[]
  disabled: boolean
  onToggle: (key: string) => void
}) {
  const { t } = useTranslation()
  return (
    <div className={`bg-white dark:bg-[#1a1a24] rounded-2xl overflow-hidden mb-4 ${disabled ? 'opacity-40' : ''}`}>
      {LEVELS.map((level, i) => {
        const checked = !disabled && selected.includes(level.key)
        return (
          <div
            key={level.key}
            className={`flex items-start gap-4 px-4 py-4 ${i < LEVELS.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
          >
            <div className="pt-0.5">
              {disabled
                ? <div className="w-5 h-5 rounded-md border-2 border-gray-200 dark:border-gray-700 flex-shrink-0" />
                : <Checkbox checked={checked} onChange={() => onToggle(level.key)} />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight mb-0.5">
                {t(level.labelKey)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {t(level.descKey)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ChannelRow({
  label,
  description,
  checked,
  disabled,
  onChange,
  last,
}: {
  label: string
  description: string
  checked: boolean
  disabled: boolean
  onChange: () => void
  last?: boolean
}) {
  return (
    <div className={`flex items-center gap-4 px-4 py-4 ${!last ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-tight mb-0.5 ${disabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}`}>
          {label}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
          disabled
            ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
            : checked
              ? 'bg-brand-teal'
              : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked && !disabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export default function NotificationsSettingsScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const meQuery = useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: () => apiClient.get('/api/mobile/me'),
  })

  const reg = meQuery.data?.viewer
  const phoneVerified = reg?.phone_verified ?? false

  const [state, setState] = useState<NotifState>({
    emailLevels: ['warning', 'emergency'],
    pushLevels: ['emergency'],
    notifySms: false,
    notifyWhatsapp: false,
    notifyTelegram: false,
  })
  const [initialized, setInitialized] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialized || !reg) return
    setState({
      emailLevels: reg.notify_email_levels ?? ['warning', 'emergency'],
      pushLevels: reg.notify_push_levels ?? ['emergency'],
      notifySms: reg.preferred_notification_channels?.includes('sms') ?? false,
      notifyWhatsapp: reg.preferred_notification_channels?.includes('whatsapp') ?? false,
      notifyTelegram: reg.preferred_notification_channels?.includes('telegram') ?? false,
    })
    setInitialized(true)
  }, [reg, initialized])

  function set(updates: Partial<NotifState>) {
    setState(prev => ({ ...prev, ...updates }))
  }

  async function handleSave() {
    setError(null)
    setSaving(true)
    const channels: string[] = []
    if (phoneVerified && state.notifySms) channels.push('sms')
    if (phoneVerified && state.notifyWhatsapp) channels.push('whatsapp')
    if (state.notifyTelegram) channels.push('telegram')
    try {
      await apiClient.patch('/api/mobile/registration', {
        notify_email_levels: state.emailLevels,
        notify_push_levels: state.pushLevels,
        preferred_notification_channels: channels,
      })
      queryClient.invalidateQueries({ queryKey: ['me'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Er is iets misgegaan.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f13] flex flex-col">
      {/* Header */}
      <div className="px-4 pt-[calc(env(safe-area-inset-top)+16px)] pb-4 bg-[#0f0f13] flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20"
          aria-label={t('common.back')}
        >
          <span className="text-white text-base">←</span>
        </button>
        <h1 className="text-white font-bold text-lg">{t('settings.notif_screen_title')}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        {meQuery.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 py-6">
            {/* Gratis meldingen */}
            <div>
              <SectionHeader label={t('reg.notif_free_section')} />

              <SubHeader label={t('reg.notif_email_channel')} />
              <LevelRows
                selected={state.emailLevels}
                disabled={false}
                onToggle={key => set({ emailLevels: toggle(state.emailLevels, key) })}
              />

              <SubHeader label={t('reg.notif_push_channel')} />
              <LevelRows
                selected={state.pushLevels}
                disabled={false}
                onToggle={key => set({ pushLevels: toggle(state.pushLevels, key) })}
              />
            </div>

            {/* Met eventuele kosten */}
            <div>
              <SectionHeader label={t('reg.notif_paid_section')} />
              <div className="bg-white dark:bg-[#1a1a24] rounded-2xl overflow-hidden">
                <ChannelRow
                  label="SMS"
                  description={t('reg.notif_sms_desc')}
                  checked={state.notifySms}
                  disabled={!phoneVerified}
                  onChange={() => set({ notifySms: !state.notifySms })}
                />
                <ChannelRow
                  label="WhatsApp"
                  description={t('reg.notif_whatsapp_desc')}
                  checked={state.notifyWhatsapp}
                  disabled={!phoneVerified}
                  onChange={() => set({ notifyWhatsapp: !state.notifyWhatsapp })}
                />
                <ChannelRow
                  label="Telegram"
                  description={t('reg.notif_telegram_desc')}
                  checked={state.notifyTelegram}
                  disabled={false}
                  onChange={() => set({ notifyTelegram: !state.notifyTelegram })}
                  last
                />
              </div>
              {!phoneVerified && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 px-1 leading-relaxed">
                  {t('reg.notif_paid_phone_hint')}
                </p>
              )}
            </div>

            {/* Opslaan */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            {saved && (
              <p className="text-green-500 text-sm text-center font-medium">{t('settings.saved')}</p>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="w-full py-4 rounded-xl bg-brand-teal text-white font-semibold text-base disabled:opacity-40 active:scale-[0.98] transition-transform"
            >
              {saving ? '...' : t('settings.save')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
