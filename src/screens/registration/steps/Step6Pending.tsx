import { useTranslation } from 'react-i18next'

interface Props {
  phoneVerified: boolean
  saving: boolean
  onDone: () => Promise<void>
}

export default function Step6Pending({ phoneVerified, saving, onDone }: Props) {
  const { t } = useTranslation()

  return (
    <div className="px-6 py-6 flex flex-col min-h-0 space-y-5">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 py-8">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
          <span className="text-4xl">✓</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {t('reg.step6_title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-xs mx-auto whitespace-pre-line">
            {phoneVerified ? t('reg.step6_with_phone') : t('reg.step6_without_phone')}
          </p>
        </div>
      </div>

      <div className="pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <button
          type="button"
          disabled={saving}
          onClick={onDone}
          className="w-full py-4 rounded-xl bg-brand-teal text-white font-semibold text-base disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {saving ? '...' : t('reg.step6_next')}
        </button>
      </div>
    </div>
  )
}
