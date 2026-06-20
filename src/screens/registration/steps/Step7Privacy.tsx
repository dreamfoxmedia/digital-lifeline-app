import { useTranslation } from 'react-i18next'
import type { WizardData } from '../RegistrationFlow'

interface Props {
  dataShielded: boolean
  saving: boolean
  onChange: (updates: Partial<WizardData>) => void
  onNext: () => void
}

export default function Step7Privacy({ dataShielded, saving, onChange, onNext }: Props) {
  const { t } = useTranslation()

  return (
    <div className="px-6 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
          {t('reg.privacy_title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {t('reg.privacy_intro')}
        </p>
      </div>

      {/* Uitleg kaart */}
      <div className="bg-white dark:bg-[#1a1a24] rounded-2xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-base">🔒</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {t('reg.privacy_body')}
          </p>
        </div>

        <div className="h-px bg-gray-100 dark:bg-gray-800" />

        <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
          {t('reg.privacy_name_note')}
        </p>
      </div>

      {/* Toggle */}
      <div className="bg-white dark:bg-[#1a1a24] rounded-2xl overflow-hidden">
        <button
          type="button"
          role="switch"
          aria-checked={dataShielded}
          onClick={() => onChange({ dataShielded: !dataShielded })}
          className="w-full flex items-center justify-between px-4 py-4 active:bg-gray-50 dark:active:bg-white/5"
        >
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
              {t('reg.privacy_toggle_label')}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">
              {t('reg.privacy_toggle_sub')}
            </p>
          </div>
          <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${dataShielded ? 'bg-brand-teal' : 'bg-gray-200 dark:bg-gray-700'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${dataShielded ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </button>
      </div>

      {dataShielded && (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl px-4 py-3">
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            {t('reg.privacy_shield_active')}
          </p>
        </div>
      )}

      <div className="pt-2 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <button
          type="button"
          disabled={saving}
          onClick={onNext}
          className="w-full py-4 rounded-xl bg-brand-teal text-white font-semibold text-base disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {saving ? '...' : t('reg.privacy_next')}
        </button>
      </div>
    </div>
  )
}
