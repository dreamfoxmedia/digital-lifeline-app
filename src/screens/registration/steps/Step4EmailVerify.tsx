import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient } from '../../../lib/apiClient'

const MAX_ATTEMPTS = 5
const RESEND_WAIT = 60

interface Props {
  prefillEmail: string
  onVerified: () => Promise<void>
}

type Stage = 'form' | 'code'

export default function Step4EmailVerify({ prefillEmail, onVerified }: Props) {
  const { t } = useTranslation()

  const [stage, setStage] = useState<Stage>('form')
  const [email, setEmail] = useState(prefillEmail)
  const [emailRepeat, setEmailRepeat] = useState(prefillEmail)
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [confirming, setConfirming] = useState(false)
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

  async function handleSend() {
    if (!email.trim()) { setError(t('reg.err_required')); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError(t('reg.err_email_invalid')); return }
    if (email.trim() !== emailRepeat.trim()) { setError(t('reg.err_email_mismatch')); return }
    setError(null)
    setSending(true)
    try {
      await apiClient.post('/api/mobile/registration/email-verify/send', { email: email.trim() })
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
    if (!code.trim()) return
    if (attempts >= MAX_ATTEMPTS) { setError(t('reg.err_too_many_attempts')); return }
    setError(null)
    setConfirming(true)
    try {
      await apiClient.post('/api/mobile/registration/email-verify/confirm', { email: email.trim(), code: code.trim() })
      await onVerified()
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      if (msg.includes('expired') || msg.includes('verlopen')) {
        setError(t('reg.err_code_expired'))
      } else if (newAttempts >= MAX_ATTEMPTS) {
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
      await apiClient.post('/api/mobile/registration/email-verify/send', { email: email.trim() })
      startCountdown()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('reg.err_generic'))
    } finally {
      setSending(false)
    }
  }

  const inputCls = (err?: boolean) =>
    `w-full px-4 py-3.5 rounded-xl border ${err ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-brand-teal`

  if (stage === 'code') {
    return (
      <div className="px-6 py-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
            {t('reg.step4_code_title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {t('reg.step4_code_hint', { email: email.trim() })}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('reg.step4_code_label')}
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            disabled={confirming || attempts >= MAX_ATTEMPTS}
            placeholder="123456"
            className={`${inputCls()} text-center tracking-[0.5em] font-mono text-xl`}
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
            {confirming ? '...' : t('reg.step4_confirm')}
          </button>
          <button
            type="button"
            disabled={countdown > 0 || sending}
            onClick={handleResend}
            className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium disabled:opacity-40"
          >
            {countdown > 0
              ? t('reg.step4_resend_wait', { seconds: countdown })
              : sending ? '...' : t('reg.step4_resend')}
          </button>
          <button
            type="button"
            onClick={() => { setStage('form'); setCode(''); setError(null) }}
            className="w-full py-3 text-sm text-gray-400 dark:text-gray-500 underline"
          >
            {t('reg.step4_change_email')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
          {t('reg.step4_title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {t('reg.step4_intro')}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t('reg.step4_email')} <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={inputCls()}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t('reg.step4_email_repeat')} <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          autoComplete="email"
          value={emailRepeat}
          onChange={e => setEmailRepeat(e.target.value)}
          className={inputCls()}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="pt-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <button
          type="button"
          disabled={!email.trim() || !emailRepeat.trim() || sending}
          onClick={handleSend}
          className="w-full py-4 rounded-xl bg-brand-teal text-white font-semibold text-base disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {sending ? '...' : t('reg.step4_send')}
        </button>
      </div>
    </div>
  )
}
