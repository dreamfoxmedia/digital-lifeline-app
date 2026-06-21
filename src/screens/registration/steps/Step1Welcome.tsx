import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  role: 'family' | 'caregiver' | null
  saving: boolean
  onAccept: () => void
  onDecline: () => void
}

export default function Step1Welcome({ role, saving, onAccept, onDecline }: Props) {
  const { t } = useTranslation()
  const [checked, setChecked] = useState(false)
  const [declined, setDeclined] = useState(false)

  const roleLabel =
    role === 'family'
      ? t('reg.step1_role_family')
      : role === 'caregiver'
        ? t('reg.step1_role_caregiver')
        : ''

  function handleDecline() {
    setDeclined(true)
    setTimeout(() => onDecline(), 1800)
  }

  return (
    <div className="flex flex-col min-h-0 px-6 py-6 gap-5">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
        {t('reg.step1_title')}
      </h1>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5">
        <p className="text-gray-800 dark:text-gray-100 text-base leading-relaxed">
          {t('reg.step1_intro').split('<strong>')[0]}
          {roleLabel && <strong>{roleLabel}</strong>}
          {t('reg.step1_intro').split('</strong>')[1] ?? ''}
        </p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
        <p className="text-amber-900 dark:text-amber-200 text-sm leading-relaxed">
          <span className="font-semibold block mb-1">Let op</span>
          {t('reg.step1_warning')}
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => setChecked(e.target.checked)}
          className="mt-0.5 w-5 h-5 rounded border-gray-300 text-brand-teal accent-brand-teal flex-shrink-0"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {t('reg.step1_checkbox')}
        </span>
      </label>

      {declined && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-700 dark:text-red-300 text-sm">{t('reg.step1_declined_notice')}</p>
        </div>
      )}

      <div className="space-y-3 mt-auto pt-4">
        <button
          type="button"
          disabled={!checked || saving || declined}
          onClick={onAccept}
          className="w-full py-4 rounded-xl bg-brand-teal text-white font-semibold text-base disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {saving ? '...' : t('reg.step1_accept')}
        </button>
        <button
          type="button"
          disabled={saving || declined}
          onClick={handleDecline}
          className="w-full py-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium text-base active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
        >
          {t('reg.step1_decline')}
        </button>
      </div>
    </div>
  )
}
