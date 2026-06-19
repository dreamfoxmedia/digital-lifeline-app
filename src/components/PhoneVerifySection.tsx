import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'

type Step = 'idle' | 'sending' | 'sent' | 'confirming' | 'verified'

interface Props {
  currentPhone: string
}

export default function PhoneVerifySection({ currentPhone }: Props) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [phone, setPhone] = useState(currentPhone)
  const [code, setCode] = useState('')
  const [step, setStep] = useState<Step>('idle')
  const [error, setError] = useState<string | null>(null)

  const phoneChanged = phone.trim() !== currentPhone.trim()
  const canSend = phone.trim().length >= 6

  async function handleSend() {
    setError(null)
    setStep('sending')
    try {
      await apiClient.post('/api/mobile/phone/verify/send', { phone: phone.trim() })
      setStep('sent')
      setCode('')
    } catch (e) {
      setError(e instanceof Error ? e.message : t('phone_verify.error_generic'))
      setStep('idle')
    }
  }

  async function handleConfirm() {
    setError(null)
    setStep('confirming')
    try {
      await apiClient.post('/api/mobile/phone/verify/confirm', { phone: phone.trim(), code: code.trim() })
      setStep('verified')
      qc.invalidateQueries({ queryKey: ['me'] })
    } catch (e) {
      setError(e instanceof Error ? e.message : t('phone_verify.error_invalid'))
      setStep('sent')
    }
  }

  function handleReset() {
    setStep('idle')
    setCode('')
    setError(null)
    setPhone(currentPhone)
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('onboarding.phone')}
      </label>

      {step === 'verified' ? (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
          <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
          <div>
            <p className="text-green-700 dark:text-green-300 font-medium text-sm">{phone}</p>
            <p className="text-green-600 dark:text-green-400 text-xs">{t('phone_verify.verified')}</p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="ml-auto text-xs text-gray-400 underline"
          >
            {t('phone_verify.change')}
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); if (step === 'sent') setStep('idle') }}
              placeholder="+31612345678"
              disabled={step === 'sending' || step === 'confirming'}
              className="flex-1 px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend || step !== 'idle'}
              className="px-4 py-3.5 rounded-xl bg-brand text-white text-sm font-medium disabled:opacity-40 active:scale-95 transition-transform whitespace-nowrap"
            >
              {step === 'sending' ? '...' : t('phone_verify.send')}
            </button>
          </div>

          {step === 'sent' || step === 'confirming' ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('phone_verify.sent_hint', { phone: phone.trim() })}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  disabled={step === 'confirming'}
                  className="flex-1 px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white text-base text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={code.length < 4 || step === 'confirming'}
                  className="px-4 py-3.5 rounded-xl bg-brand-teal text-white text-sm font-medium disabled:opacity-40 active:scale-95 transition-transform"
                >
                  {step === 'confirming' ? '...' : t('phone_verify.confirm')}
                </button>
              </div>
              <button
                type="button"
                onClick={handleSend}
                disabled={step === 'confirming'}
                className="text-xs text-brand-teal underline disabled:opacity-40"
              >
                {t('phone_verify.resend')}
              </button>
            </div>
          ) : null}

          {currentPhone && !phoneChanged && step === 'idle' && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {t('phone_verify.current', { phone: currentPhone })}
            </p>
          )}
        </>
      )}

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  )
}
