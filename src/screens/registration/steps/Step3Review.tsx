import { useTranslation } from 'react-i18next'
import type { WizardData } from '../RegistrationFlow'

interface Props {
  data: WizardData
  saving: boolean
  onBack: () => void
  onConfirm: () => Promise<void>
}

function Row({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation()
  return (
    <div className="flex justify-between gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white text-right">
        {value || t('reg.step3_not_filled')}
      </span>
    </div>
  )
}

function formatDob(dob: string, language: string): string {
  if (!dob) return ''
  try {
    return new Intl.DateTimeFormat(language === 'nl' ? 'nl-NL' : 'en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    }).format(new Date(dob + 'T00:00:00'))
  } catch {
    return dob
  }
}

export default function Step3Review({ data, saving, onBack, onConfirm }: Props) {
  const { t, i18n } = useTranslation()

  const relationshipLabel = data.relationship
    ? data.relationship === 'other'
      ? `${t('reg.rel_other')}${data.relationshipDescription ? ` – ${data.relationshipDescription}` : ''}`
      : t(`reg.rel_${data.relationship}`)
    : ''

  return (
    <div className="px-6 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
          {t('reg.step3_title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {t('reg.step3_intro')}
        </p>
      </div>

      <div className="bg-white dark:bg-[#1a1a24] rounded-2xl px-4">
        <Row label={t('reg.step3_name')} value={`${data.firstName} ${data.lastName}`.trim()} />
        <Row label={t('reg.step3_display_name')} value={data.displayName} />
        <Row label={t('reg.step3_gender')} value={data.gender ? t(`reg.gender_${data.gender}`) : ''} />
        <Row label={t('reg.step3_relationship')} value={relationshipLabel} />
        <Row label={t('reg.step3_dob')} value={formatDob(data.dateOfBirth, i18n.language)} />
      </div>

      <div className="space-y-3 pt-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <button
          type="button"
          disabled={saving}
          onClick={onConfirm}
          className="w-full py-4 rounded-xl bg-brand-teal text-white font-semibold text-base disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {saving ? '...' : t('reg.step3_confirm')}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onBack}
          className="w-full py-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium text-base active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
        >
          {t('reg.step3_edit')}
        </button>
      </div>
    </div>
  )
}
