import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Preferences } from '@capacitor/preferences'
import { AuthProvider, useAuth } from './context/AuthContext'
import { setUnauthorizedHandler } from './lib/apiClient'
import i18n from './i18n'
import LanguageScreen from './screens/LanguageScreen'
import LoginScreen from './screens/LoginScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import StatusScreen from './screens/StatusScreen'
import SettingsScreen from './screens/SettingsScreen'

type AppState = 'loading' | 'language' | 'ready'

function AppRoutes() {
  const { mode, signOut } = useAuth()
  setUnauthorizedHandler(signOut)

  if (mode === null) return <LoginScreen />

  return (
    <Routes>
      <Route path="/" element={<StatusScreen />} />
      <Route path="/onboarding" element={<OnboardingScreen />} />
      <Route path="/settings" element={<SettingsScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading')

  useEffect(() => {
    Preferences.get({ key: 'language' }).then(({ value }) => {
      if (value) {
        i18n.changeLanguage(value)
        setAppState('ready')
      } else {
        setAppState('language')
      }
    })
  }, [])

  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-[#ede9e3] flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-[#FFB454] flex items-center justify-center">
          <svg viewBox="0 0 256 256" className="w-6 h-6" fill="none" stroke="white" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20,128 L72,128 L88,76 L108,180 L128,96 L148,128 L236,128" />
          </svg>
        </div>
      </div>
    )
  }

  if (appState === 'language') {
    return <LanguageScreen onDone={() => setAppState('ready')} />
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
