import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { apiClient } from '../lib/apiClient'
import ProfileForm from '../components/ProfileForm'
import type { ProfileFormData } from '../types'

const schema = z.object({
  full_name: z
    .string()
    .min(2, 'Naam moet minimaal 2 tekens bevatten')
    .max(100, 'Naam mag maximaal 100 tekens bevatten'),
  display_name: z
    .string()
    .min(1, 'Weergavenaam is verplicht')
    .max(100, 'Weergavenaam mag maximaal 100 tekens bevatten'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{6,14}$/, 'Ongeldig telefoonnummer (gebruik bijv. +31612345678)')
    .or(z.literal(''))
    .optional(),
  relation: z.string().optional(),
  notify_emergency: z.boolean(),
  notify_categories: z.array(z.string()).max(20),
})

const defaultData: ProfileFormData = {
  full_name: '',
  display_name: '',
  phone: '',
  relation: '',
  notify_emergency: true,
  notify_categories: [],
}

export default function OnboardingScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [data, setData] = useState<ProfileFormData>(defaultData)
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({})
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setApiError(null)

    const result = schema.safeParse(data)
    if (!result.success) {
      const fieldErrors: typeof errors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ProfileFormData
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setSaving(true)
    try {
      await apiClient.patch('/api/mobile/me', result.data)
      navigate('/', { replace: true })
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Onbekende fout')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f13] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-[calc(env(safe-area-inset-top)+24px)] pb-6 bg-white dark:bg-[#0f0f13] border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#FFB454] flex items-center justify-center">
            <svg viewBox="0 0 256 256" className="w-4 h-4" fill="none" stroke="white" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20,128 L72,128 L88,76 L108,180 L128,96 L148,128 L236,128" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('onboarding.title')}</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">{t('onboarding.subtitle')}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6">
        <ProfileForm data={data} onChange={setData} errors={errors} />

        {apiError && (
          <p className="mt-4 text-red-500 text-sm text-center">{apiError}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full mt-8 py-4 rounded-xl bg-[#FFB454] text-white font-semibold text-base disabled:opacity-60 active:scale-95 transition-transform"
        >
          {saving ? t('onboarding.saving') : t('onboarding.save')}
        </button>
      </form>
    </div>
  )
}
