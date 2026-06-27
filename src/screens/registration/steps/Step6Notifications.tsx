import { useTranslation } from 'react-i18next'
import type { WizardData } from '../RegistrationFlow'

const LEVELS = [
  { key: 'minor', labelKey: 'reg.notif_level_minor', descKey: 'reg.notif_level_minor_desc' },
  { key: 'warning', labelKey: 'reg.notif_level_warning', descKey: 'reg.notif_level_warning_desc' },
  { key: 'emergency', labelKey: 'reg.notif_level_emergency', descKey: 'reg.notif_level_emergency_desc' },
] as const

interface Props {
  phoneVerified: boolean
  emailLevels: string[]
  pushLevels: string[]
  notifySms: boolean
  notifyWhatsapp: boolean
  notifyTelegram: boolean
  allowedChannels: string[]
  saving: boolean
  onChange: (updates: Partial<WizardData>) => void
  onNext: () => void
}

function toggle(levels: string[], key: string): string[] {
  return levels.includes(key) ? levels.filter(l => l !== key) : [...levels, key]
}

function allowed(channels: string[], key: string): boolean {
  return channels.length === 0 || channels.includes(key)
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
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
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
  levels,
  selected,
  disabled,
  onToggle,
}: {
  levels: typeof LEVELS
  selected: string[]
  disabled: boolean
  onToggle: (key: string) => void
}) {
  const { t } = useTranslation()
  return (
    <div className={`bg-white dark:bg-[#1a1a24] rounded-2xl overflow-hidden mb-4 ${disabled ? 'opacity-40' : ''}`}>
      {levels.map((level, i) => {
        const checked = !disabled && selected.includes(level.key)
        return (
          <div
            key={level.key}
            className={`flex items-start gap-4 px-4 py-4 ${i < levels.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
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

interface ChannelRowProps {
  label: string
  description: string
  checked: boolean
  disabled: boolean
  onChange: () => void
  last?: boolean
}

function ChannelRow({ label, description, checked, disabled, onChange, last }: ChannelRowProps) {
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

export default function Step6Notifications({
  phoneVerified,
  emailLevels,
  pushLevels,
  notifySms,
  notifyWhatsapp,
  notifyTelegram,
  allowedChannels,
  saving,
  onChange,
  onNext,
}: Props) {
  const { t } = useTranslation()

  const showEmail = allowed(allowedChannels, 'email')
  const showPush = allowed(allowedChannels, 'push')
  const showSms = allowed(allowedChannels, 'sms')
  const showWhatsapp = allowed(allowedChannels, 'whatsapp')
  const showTelegram = allowed(allowedChannels, 'telegram')

  const hasFree = showEmail || showPush
  const paidChannels = [
    showSms && { key: 'sms', label: 'SMS', desc: t('reg.notif_sms_desc'), checked: notifySms, onChange: () => onChange({ notifySms: !notifySms }) },
    showWhatsapp && { key: 'whatsapp', label: 'WhatsApp', desc: t('reg.notif_whatsapp_desc'), checked: notifyWhatsapp, onChange: () => onChange({ notifyWhatsapp: !notifyWhatsapp }) },
    showTelegram && { key: 'telegram', label: 'Telegram', desc: t('reg.notif_telegram_desc'), checked: notifyTelegram, onChange: () => onChange({ notifyTelegram: !notifyTelegram }) },
  ].filter(Boolean) as { key: string; label: string; desc: string; checked: boolean; onChange: () => void }[]

  return (
    <div className="px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
          {t('reg.notif_title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {t('reg.notif_intro')}
        </p>
      </div>

      {/* Gratis meldingen */}
      {hasFree && (
        <div>
          <SectionHeader label={t('reg.notif_free_section')} />

          {showEmail && (
            <>
              <SubHeader label={t('reg.notif_email_channel')} />
              <LevelRows
                levels={LEVELS}
                selected={emailLevels}
                disabled={false}
                onToggle={key => onChange({ notifyEmailLevels: toggle(emailLevels, key) })}
              />
            </>
          )}

          {showPush && (
            <>
              <SubHeader label={t('reg.notif_push_channel')} />
              <LevelRows
                levels={LEVELS}
                selected={pushLevels}
                disabled={false}
                onToggle={key => onChange({ notifyPushLevels: toggle(pushLevels, key) })}
              />
            </>
          )}
        </div>
      )}

      {/* Met eventuele kosten */}
      {paidChannels.length > 0 && (
        <div>
          <SectionHeader label={t('reg.notif_paid_section')} />
          <div className="bg-white dark:bg-[#1a1a24] rounded-2xl overflow-hidden">
            {paidChannels.map((ch, i) => (
              <ChannelRow
                key={ch.key}
                label={ch.label}
                description={ch.desc}
                checked={ch.checked}
                disabled={ch.key !== 'telegram' && !phoneVerified}
                onChange={ch.onChange}
                last={i === paidChannels.length - 1}
              />
            ))}
          </div>
          {!phoneVerified && (showSms || showWhatsapp) && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 px-1 leading-relaxed">
              {t('reg.notif_paid_phone_hint')}
            </p>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed px-1">
        {t('reg.notif_footer')}
      </p>

      <div className="pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <button
          type="button"
          disabled={saving}
          onClick={onNext}
          className="w-full py-4 rounded-xl bg-brand-teal text-white font-semibold text-base disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {saving ? '...' : t('reg.notif_next')}
        </button>
      </div>
    </div>
  )
}
