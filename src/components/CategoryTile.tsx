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
  info: 'text-gray-900',
  warning: 'text-orange-600',
  emergency: 'text-red-600',
}

interface Props {
  item: CategoryStatus
}

export default function CategoryTile({ item }: Props) {
  const icon = ICONS[item.category.toLowerCase()] ?? '📊'
  const valueColor = SEVERITY_VALUE_COLOR[item.severity] ?? 'text-gray-900'

  return (
    <div className="bg-stone-50 rounded-2xl p-4 flex flex-col gap-2 min-h-[100px]">
      <span className="text-xl">{icon}</span>
      <p className="text-gray-400 text-sm leading-tight">{item.category.charAt(0).toUpperCase() + item.category.slice(1)}</p>
      <p className={`font-bold text-base leading-snug ${valueColor}`}>
        {displayValue(item.status_info, item.status)}
      </p>
    </div>
  )
}
