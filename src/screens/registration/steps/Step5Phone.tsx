import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient } from '../../../lib/apiClient'

const COUNTRY_CODES = [
  { code: '+31', country: 'Nederland', flag: '🇳🇱' },
  { code: '+32', country: 'België', flag: '🇧🇪' },
  { code: '+49', country: 'Duitsland', flag: '🇩🇪' },
  { code: '+33', country: 'Frankrijk', flag: '🇫🇷' },
  { code: '+44', country: 'Verenigd Koninkrijk', flag: '🇬🇧' },
  { code: '+1', country: 'VS / Canada', flag: '🇺🇸' },
  { code: '+34', country: 'Spanje', flag: '🇪🇸' },
  { code: '+39', country: 'Italië', flag: '🇮🇹' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+48', country: 'Polen', flag: '🇵🇱' },
  { code: '+45', country: 'Denemarken', flag: '🇩🇰' },
  { code: '+46', country: 'Zweden', flag: '🇸🇪' },
  { code: '+47', country: 'Noorwegen', flag: '🇳🇴' },
  { code: '+41', country: 'Zwitserland', flag: '🇨🇭' },
  { code: '+43', country: 'Oostenrijk', flag: '🇦🇹' },
  { code: '+352', country: 'Luxemburg', flag: '🇱🇺' },
  { code: '+61', country: 'Australië', flag: '🇦🇺' },
  { code: '+27', country: 'Zuid-Afrika', flag: '🇿🇦' },
]

const MAX_ATTEMPTS = 5
const RESEND_WAIT = 60

function toE164(phone: string, countryCode: string): string {
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '')
  if (cleaned.startsWith('+')) return cleaned
  if (cleaned.startsWith('00')) return '+' + cleaned.slice(2)
  if (cleaned.startsWith('0')) return countryCode + cleaned.slice(1)
  return countryCode + cleaned
}

type Stage = 'choice' | 'input' | 'code'

interface Props {
  onVerified: (phoneE164: string) => Promise<void>
  onSkip: () => void
}

export default function Step5Phone({ onVerified, onSkip }: Props) {
  const { t } = useTranslation()
  const [stage, setStage] = useState<Stage>('choice')
  const [countryCode, setCountryCode] = useState('+31')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [code, setCode] = useState('')
  const [phoneE164, setPhoneE164] = useState('')
  const [sending, setSending] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [skipping, setSkipping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  function startCountdown() {
    setCountdown(RESEND_WAIT)
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0 }
        return c - 1
      })
    }, 1000)
  }

  async function handleSkip() {
    setSkipping(true)
    try { await onSkip() } finally { setSkipping(false) }
  }

  async function handleSendSms() {
    if (phoneNumber.trim().length < 4) { setError(t('reg.err_phone_invalid')); return }
    const e164 = toE164(phoneNumber.trim(), countryCode)
    setPhoneE164(e164)
    setError(null)
    setSending(true)
    try {
      await apiClient.post('/api/mobile/phone/verify/send', { phone: e164 })
      setStage('code')
      setAttempts(0)
      startCountdown()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('reg.err_generic'))
    } finally {
      setSending(false)
    }
  }

  async function handleConfirm() {
    if (!code.trim() || attempts >= MAX_ATTEMPTS) return
    setError(null)
    setConfirming(true)
    try {
      await apiClient.post('/api/mobile/phone/verify/confirm', { phone: phoneE164, code: code.trim() })
      await onVerified(phoneE164)
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      const next = attempts + 1
      setAttempts(next)
      if (msg.includes('expired') || msg.includes('verlopen')) {
        setError(t('reg.err_code_expired'))
      } else if (next >= MAX_ATTEMPTS) {
        setError(t('reg.err_too_many_attempts'))
      } else {
        setError(t('reg.err_code_invalid'))
      }
    } finally {
      setConfirming(false)
    }
  }

  async function handleResend() {
    if (countdown > 0) return
    setCode('')
    setAttempts(0)
    setError(null)
    setSending(true)
    try {
      await apiClient.post('/api/mobile/phone/verify/send', { phone: phoneE164 })
      startCountdown()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('reg.err_generic'))
    } finally {
      setSending(false)
    }
  }

  const inputCls =
    'w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-brand-teal appearance-none'

  // Keuzescherm
  if (stage === 'choice') {
    return (
      <div className="px-6 py-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
            {t('reg.step5_title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {t('reg.step5_intro')}
          </p>
        </div>

        <div className="space-y-3 pt-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <button
            type="button"
            onClick={() => setStage('input')}
            className="w-full py-4 rounded-xl bg-brand-teal text-white font-semibold text-base active:scale-[0.98] transition-transform"
          >
            {t('reg.step5_use_phone')}
          </button>
          <button
            type="button"
            disabled={skipping}
            onClick={handleSkip}
            className="w-full py-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium text-base active:bg-gray-50 dark:active:bg-gray-800 transition-colors disabled:opacity-40"
          >
            {skipping ? '...' : t('reg.step5_skip')}
          </button>
        </div>
      </div>
    )
  }

  // Telefoonnummer invoeren
  if (stage === 'input') {
    return (
      <div className="px-6 py-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
            {t('reg.step5_title')}
          </h1>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('reg.step5_country')}
          </label>
          <select
            value={countryCode}
            onChange={e => setCountryCode(e.target.value)}
            className={inputCls}
          >
            {COUNTRY_CODES.map(c => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.country} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('reg.step5_phone')} <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 flex-shrink-0">
              {countryCode}
            </span>
            <input
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="612345678"
              className={inputCls}
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="space-y-3 pt-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <button
            type="button"
            disabled={phoneNumber.trim().length < 4 || sending}
            onClick={handleSendSms}
            className="w-full py-4 rounded-xl bg-brand-teal text-white font-semibold text-base disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            {sending ? '...' : t('reg.step5_send')}
          </button>
          <button
            type="button"
            onClick={() => { setStage('choice'); setError(null) }}
            className="w-full py-3 text-sm text-gray-400 underline"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    )
  }

  // Code invoeren
  return (
    <div className="px-6 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
          {t('reg.step5_code_title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {t('reg.step5_code_hint', { phone: phoneE164 })}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t('reg.step5_code_label')}
        </label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          disabled={confirming || attempts >= MAX_ATTEMPTS}
          placeholder="123456"
          className={`${inputCls} text-center tracking-[0.5em] font-mono text-xl`}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="space-y-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <button
          type="button"
          disabled={code.length < 4 || confirming || attempts >= MAX_ATTEMPTS}
          onClick={handleConfirm}
          className="w-full py-4 rounded-xl bg-brand-teal text-white font-semibold text-base disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {confirming ? '...' : t('reg.step5_confirm')}
        </button>
        <button
          type="button"
          disabled={countdown > 0 || sending}
          onClick={handleResend}
          className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium disabled:opacity-40"
        >
          {countdown > 0
            ? t('reg.step5_resend_wait', { seconds: countdown })
            : sending ? '...' : t('reg.step5_resend')}
        </button>
        <button
          type="button"
          onClick={() => { setStage('input'); setCode(''); setError(null) }}
          className="w-full py-3 text-sm text-gray-400 underline"
        >
          {t('reg.step5_change_phone')}
        </button>
      </div>
    </div>
  )
}
