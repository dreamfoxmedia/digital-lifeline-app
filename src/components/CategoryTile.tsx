import { useTranslation } from 'react-i18next'
import type { CategoryStatus } from '../types'

function displayValue(info: unknown, fallback: string): string {
  if (info === null || info === undefined || info === '') return fallback
  if (typeof info === 'string') return info
  if (typeof info === 'object') {
    const obj = info as Record<string, unknown>
    const v = obj.text ?? obj.label ?? obj.value ?? obj.state ?? obj.description
    if (typeof v === 'string' && v) return v
  }
  return fallback
}

const ICONS: Record<string, string> = {
  aanwezigheid: '🚶',
  beweging: '⚡',
  slaap: '😴',
  noodknop: '🆘',
  valdetectie: '⚠️',
  rookmelder: '🔥',
  medicatie: '💊',
  activiteit: '❤️',
  voordeur: '🚪',
  temperatuur: '🌡️',
  woonkamer: '🌡️',
}

const SEVERITY_VALUE_COLOR: Record<string, string> = {
  info: 'text-gray-900 dark:text-gray-100',
  warning: 'text-orange-600 dark:text-orange-400',
  emergency: 'text-red-600 dark:text-red-400',
}

interface Props {
  item: CategoryStatus
}

export default function CategoryTile({ item }: Props) {
  const { t } = useTranslation()
  const icon = ICONS[item.category.toLowerCase()] ?? '📊'
  const valueColor = SEVERITY_VALUE_COLOR[item.severity] ?? 'text-gray-900'
  const fallbackLabel = item.category.charAt(0).toUpperCase() + item.category.slice(1)
  const label = t(`categories.${item.category.toLowerCase()}`, { defaultValue: fallbackLabel })

  return (
    <div className="bg-stone-50 dark:bg-[#1e1e2e] rounded-2xl p-4 flex flex-col gap-2 min-h-[100px]">
      <span className="text-xl">{icon}</span>
      <p className="text-gray-400 text-sm leading-tight">{label}</p>
      <p className={`font-bold text-base leading-snug ${valueColor}`}>
        {displayValue(item.status_info, item.status)}
      </p>
    </div>
  )
}
