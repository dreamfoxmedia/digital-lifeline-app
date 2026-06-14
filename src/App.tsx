import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { setUnauthorizedHandler } from './lib/apiClient'
import LoginScreen from './screens/LoginScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import StatusScreen from './screens/StatusScreen'
import SettingsScreen from './screens/SettingsScreen'

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
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
