import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { logScreenView } from './lib/analytics'
import { Preferences } from '@capacitor/preferences'
import { App as CapApp } from '@capacitor/app'
import brandIcon from './assets/brand-icon.png'
import { AuthProvider, useAuth } from './context/AuthContext'
import { setUnauthorizedHandler } from './lib/apiClient'
import { loadSavedTheme, applyTheme } from './lib/theme'
import i18n from './i18n'

function useTheme() {
  useEffect(() => {
    let mq: MediaQueryList | null = null
    let handler: ((e: MediaQueryListEvent) => void) | null = null

    loadSavedTheme().then(theme => {
      applyTheme(theme)
      if (theme === 'system') {
        mq = window.matchMedia('(prefers-color-scheme: dark)')
        handler = () => applyTheme('system')
        mq.addEventListener('change', handler)
      }
    })

    return () => { if (mq && handler) mq.removeEventListener('change', handler) }
  }, [])
}

const LanguageScreen               = lazy(() => import('./screens/LanguageScreen'))
const LoginScreen                  = lazy(() => import('./screens/LoginScreen'))
const StatusScreen                 = lazy(() => import('./screens/StatusScreen'))
const SettingsScreen               = lazy(() => import('./screens/SettingsScreen'))
const MonitoredPersonScreen        = lazy(() => import('./screens/MonitoredPersonScreen'))
const RegistrationFlow             = lazy(() => import('./screens/registration/RegistrationFlow'))
const RegistrationPendingScreen    = lazy(() => import('./screens/RegistrationPendingScreen'))
const NotificationsSettingsScreen  = lazy(() => import('./screens/NotificationsSettingsScreen'))
const WelcomeScreen                = lazy(() => import('./screens/WelcomeScreen'))
const OnboardingScreen             = lazy(() => import('./screens/OnboardingScreen'))

const LoadingScreen = () => (
  <div className="min-h-screen bg-[#f5f3ef] dark:bg-[#0f0f13] flex items-center justify-center">
    <img src={brandIcon} alt="Digital Lifeline" className="w-12 h-12 rounded-xl shadow-md" />
  </div>
)

type AppState = 'loading' | 'language' | 'ready'

function ScreenTracker() {
  const location = useLocation()
  useEffect(() => { logScreenView(location.pathname) }, [location.pathname])
  return null
}

function BackButtonHandler() {
  const navigate = useNavigate()
  const location = useLocation()
  useEffect(() => {
    let listener: { remove: () => void } | null = null
    CapApp.addListener('backButton', () => {
      if (location.pathname === '/') return
      navigate(-1)
    }).then(h => { listener = h })
    return () => { listener?.remove() }
  }, [location.pathname, navigate])
  return null
}

function LanguageScreenRoute() {
  const navigate = useNavigate()
  return <LanguageScreen onDone={() => navigate(-1)} />
}

function AppRoutes() {
  const { mode, initializing, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setUnauthorizedHandler(signOut)
  }, [signOut])

  useEffect(() => {
    if (!initializing && mode === null) {
      navigate('/', { replace: true })
    }
  }, [mode, initializing, navigate])

  if (initializing) return <LoadingScreen />

  if (mode === null) return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginScreen />
    </Suspense>
  )

  return (
    <>
      <ScreenTracker />
      <BackButtonHandler />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/"              element={<StatusScreen />} />
          <Route path="/language"      element={<LanguageScreenRoute />} />
          <Route path="/registration"  element={<RegistrationFlow />} />
          <Route path="/pending"       element={<RegistrationPendingScreen />} />
          <Route path="/notifications" element={<NotificationsSettingsScreen />} />
          <Route path="/welcome"       element={<WelcomeScreen />} />
          <Route path="/onboarding"    element={<OnboardingScreen />} />
          <Route path="/monitored"     element={<MonitoredPersonScreen />} />
          <Route path="/settings"      element={<SettingsScreen />} />
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default function App() {
  useTheme()
  const [appState, setAppState] = useState<AppState>('loading')

  useEffect(() => {
    async function init() {
      const [{ value: lang }, { value: langConfirmed }] = await Promise.all([
        Preferences.get({ key: 'language' }),
        Preferences.get({ key: 'languageConfirmed' }),
      ])
      // Toon taalscherm als er nooit expliciet een taal is gekozen via de nieuwe UI,
      // ook als een oudere versie van de app al een 'language' waarde had opgeslagen.
      const hasChosen = !!(lang && langConfirmed)
      if (hasChosen) i18n.changeLanguage(lang!)
      setAppState(hasChosen ? 'ready' : 'language')
    }
    init()
  }, [])

  if (appState === 'loading') return <LoadingScreen />

  if (appState === 'language') return (
    <Suspense fallback={<LoadingScreen />}>
      <LanguageScreen onDone={() => setAppState('ready')} />
    </Suspense>
  )

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
