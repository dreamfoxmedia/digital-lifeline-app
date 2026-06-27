import { Preferences } from '@capacitor/preferences'

export type Theme = 'system' | 'light' | 'dark'

export function applyTheme(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (theme === 'light') {
    document.documentElement.classList.remove('dark')
  } else {
    document.documentElement.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches)
  }
}

export async function saveTheme(theme: Theme) {
  await Preferences.set({ key: 'theme', value: theme })
  applyTheme(theme)
}

export async function loadSavedTheme(): Promise<Theme> {
  const { value } = await Preferences.get({ key: 'theme' })
  return (value as Theme) ?? 'system'
}
