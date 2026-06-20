import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { logScreenView } from './lib/analytics'
import { Preferences } from '@capacitor/preferences'
import brandIcon from './assets/brand-icon.png'
import { AuthProvider, useAuth } from './context/AuthContext'
import { setUnauthorizedHandler } from './lib/apiClient'
import { supabase } from './lib/supabase'
import i18n from './i18n'
import LanguageScreen from './screens/LanguageScreen'
import LoginScreen from './screens/LoginScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import StatusScreen from './screens/StatusScreen'
import SettingsScreen from './screens/SettingsScreen'
import MonitoredPersonScreen from './screens/MonitoredPersonScreen'
import RegistrationFlow from './screens/registration/RegistrationFlow'
import RegistrationPendingScreen from './screens/RegistrationPendingScreen'
import NotificationsSettingsScreen from './screens/NotificationsSettingsScreen'
import WelcomeScreen from './screens/WelcomeScreen'

type AppState = 'loading' | 'language' | 'ready'

function ScreenTracker() {
  const location = useLocation()
  useEffect(() => { logScreenView(location.pathname) }, [location.pathname])
  return null
}

function AppRoutes() {
  const { mode, initializing, signOut } = useAuth()
  setUnauthorizedHandler(signOut)

  if (initializing) return (
    <div className="min-h-screen bg-[#ede9e3] flex items-center justify-center">
      <img src={brandIcon} alt="Digital Lifeline" className="w-12 h-12 rounded-xl shadow-md" />
    </div>
  )

  if (mode === null) return <LoginScreen />

  return (
    <>
      <ScreenTracker />
      <Routes>
      <Route path="/" element={<StatusScreen />} />
      <Route path="/registration" element={<RegistrationFlow />} />
      <Route path="/pending" element={<RegistrationPendingScreen />} />
      <Route path="/notifications" element={<NotificationsSettingsScreen />} />
      <Route path="/welcome" element={<WelcomeScreen />} />
      <Route path="/onboarding" element={<OnboardingScreen />} />
      <Route path="/monitored" element={<MonitoredPersonScreen />} />
      <Route path="/settings" element={<SettingsScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading')

  useEffect(() => {
    async function init() {
      const [{ value: lang }, { data: { session } }] = await Promise.all([
        Preferences.get({ key: 'language' }),
        supabase.auth.getSession(),
      ])
      if (lang) i18n.changeLanguage(lang)
      if (lang && session) {
        setAppState('ready')
      } else {
        setAppState('language')
      }
    }
    init()
  }, [])

  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-[#ede9e3] flex items-center justify-center">
        <img src={brandIcon} alt="Digital Lifeline" className="w-12 h-12 rounded-xl shadow-md" />
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
