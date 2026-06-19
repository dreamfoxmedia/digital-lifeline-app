import { useTranslation } from 'react-i18next'

interface Props {
  current: number
  total: number
}

export default function RegistrationProgressBar({ current, total }: Props) {
  const { t } = useTranslation()
  const pct = Math.round((current / total) * 100)

  return (
    <div className="px-6 pt-[calc(env(safe-area-inset-top)+12px)] pb-4 bg-white dark:bg-[#0f0f13] border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {t('reg.step_of', { current, total })}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-teal rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
