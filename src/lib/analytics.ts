import { Capacitor } from '@capacitor/core'

const SCREEN_NAMES: Record<string, string> = {
  '/': 'Status',
  '/onboarding': 'Onboarding',
  '/monitored': 'MonitoredPerson',
  '/settings': 'Settings',
}

export async function logScreenView(path: string) {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { FirebaseAnalytics } = await import('@capacitor-firebase/analytics')
    const screenName = SCREEN_NAMES[path] ?? path
    await FirebaseAnalytics.setCurrentScreen({ screenName })
  } catch {
    // analytics is optioneel — nooit de app blokkeren
  }
}

export async function logEvent(name: string, params?: Record<string, string>) {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { FirebaseAnalytics } = await import('@capacitor-firebase/analytics')
    await FirebaseAnalytics.logEvent({ name, params })
  } catch {
    // analytics is optioneel — nooit de app blokkeren
  }
}
