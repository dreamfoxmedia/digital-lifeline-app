import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from 'react'
import { Preferences } from '@capacitor/preferences'
import { supabase } from '../lib/supabase'
import type { AuthState } from '../types'

interface AuthContextValue extends AuthState {
  initializing: boolean
  signInWithPassword: (email: string, password: string) => Promise<void>
  signInWithApiKey: (key: string) => Promise<void>
  signOut: () => Promise<void>
  signOutAll: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

type Action =
  | { type: 'SET_SESSION'; accessToken: string; userId: string }
  | { type: 'SET_API_KEY'; apiKey: string }
  | { type: 'CLEAR' }

const initial: AuthState = { mode: null, apiKey: null, accessToken: null, userId: null }

function reducer(_state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'SET_SESSION':
      return { mode: 'session', accessToken: action.accessToken, userId: action.userId, apiKey: null }
    case 'SET_API_KEY':
      return { mode: 'apiKey', apiKey: action.apiKey, accessToken: null, userId: null }
    case 'CLEAR':
      return initial
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    async function restore() {
      const { value: mode } = await Preferences.get({ key: 'authMode' })
      if (mode === 'apiKey') {
        const { value: key } = await Preferences.get({ key: 'apiKey' })
        if (key) dispatch({ type: 'SET_API_KEY', apiKey: key })
        setInitializing(false)
        return
      }
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        dispatch({
          type: 'SET_SESSION',
          accessToken: data.session.access_token,
          userId: data.session.user.id,
        })
      }
      setInitializing(false)
    }
    restore()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        dispatch({
          type: 'SET_SESSION',
          accessToken: session.access_token,
          userId: session.user.id,
        })
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function signInWithPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const isServerError =
        error.message.toLowerCase().includes('failed to fetch') ||
        error.message.toLowerCase().includes('networkerror') ||
        error.message.toLowerCase().includes('fetch') ||
        (typeof (error as { status?: number }).status === 'number' &&
          ((error as { status?: number }).status === 0 ||
           ((error as { status?: number }).status ?? 0) >= 500))
      throw new Error(isServerError ? 'server_unavailable' : 'invalid_credentials')
    }
    await Preferences.set({ key: 'authMode', value: 'session' })
    dispatch({
      type: 'SET_SESSION',
      accessToken: data.session.access_token,
      userId: data.user.id,
    })
  }

  async function signInWithApiKey(key: string) {
    await Preferences.set({ key: 'authMode', value: 'apiKey' })
    await Preferences.set({ key: 'apiKey', value: key })
    dispatch({ type: 'SET_API_KEY', apiKey: key })
  }

  async function signOut() {
    await supabase.auth.signOut()
    await Preferences.remove({ key: 'authMode' })
    await Preferences.remove({ key: 'apiKey' })
    dispatch({ type: 'CLEAR' })
  }

  async function signOutAll() {
    await supabase.auth.signOut({ scope: 'global' })
    await Preferences.remove({ key: 'authMode' })
    await Preferences.remove({ key: 'apiKey' })
    dispatch({ type: 'CLEAR' })
  }

  return (
    <AuthContext.Provider value={{ ...state, initializing, signInWithPassword, signInWithApiKey, signOut, signOutAll }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
