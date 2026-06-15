import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type { CategoryStatus, Severity } from '../types'

const ICONS: Record<string, string> = {
  beweging: '🚶',
  slaap: '😴',
  noodknop: '🆘',
  valdetectie: '⚠️',
  rookmelder: '🔥',
  medicatie: '💊',
  activiteit: '❤️',
}

const SEVERITY_STYLES: Record<Severity, string> = {
  info: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  warning: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  emergency: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse',
}

const BORDER_STYLES: Record<Severity, string> = {
  info: 'border-gray-100 dark:border-gray-800',
  warning: 'border-orange-200 dark:border-orange-800',
  emergency: 'border-red-300 dark:border-red-700',
}

function relativeTime(iso: string, t: TFunction): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return t('status.just_now')
  if (diff < 3600) return t('status.minutes_ago_one', { count: Math.floor(diff / 60) })
  if (diff < 86400) return t('status.hours_ago_one', { count: Math.floor(diff / 3600) })
  return t('status.days_ago_one', { count: Math.floor(diff / 86400) })
}

interface Props {
  item: CategoryStatus
}

export default function CategoryCard({ item }: Props) {
  const { t } = useTranslation()
  const icon = ICONS[item.category] ?? '📊'
  const label = t(`categories.${item.category}`, { defaultValue: item.category })

  return (
    <div className={`mx-4 p-4 rounded-2xl bg-white dark:bg-[#1a1a24] border ${BORDER_STYLES[item.severity]} shadow-sm`}>
      <div className="flex items-center gap-3">
        {/* Icoon */}
        <div className="text-2xl w-10 text-center flex-shrink-0">{icon}</div>

        {/* Naam + status */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-base">{label}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{typeof item.status_info === 'string' ? item.status_info : item.status}</p>
        </div>

        {/* Severity badge */}
        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${SEVERITY_STYLES[item.severity]}`}>
          {item.severity === 'emergency' ? '🔴' : item.severity === 'warning' ? '🟠' : '🟢'}
        </div>
      </div>

      {/* Tijdstempel */}
      {item.observed_at && (
        <p className="text-xs text-gray-400 mt-2 ml-13">
          {t('status.last_seen')}: {relativeTime(item.observed_at, t)}
        </p>
      )}
    </div>
  )
}
