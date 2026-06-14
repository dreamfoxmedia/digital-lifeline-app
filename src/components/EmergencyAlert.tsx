import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  category: string
  onDismiss: () => void
}

export default function EmergencyAlert({ category, onDismiss }: Props) {
  const { t } = useTranslation()

  useEffect(() => {
    // Haptic feedback via Capacitor (optioneel — plugin moet worden toegevoegd)
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-pulse_red">
      <div className="text-center px-8">
        <div className="text-6xl mb-6">🚨</div>
        <h1 className="text-4xl font-black text-white mb-3 tracking-wide">
          {t('status.emergency_title')}
        </h1>
        <p className="text-white/90 text-xl font-medium mb-10">
          {t(`categories.${category}`, { defaultValue: category })}
        </p>
        <button
          onClick={onDismiss}
          className="px-10 py-4 bg-white text-red-600 rounded-2xl font-bold text-lg active:scale-95 transition-transform shadow-xl"
        >
          {t('status.emergency_dismiss')}
        </button>
      </div>
    </div>
  )
}
