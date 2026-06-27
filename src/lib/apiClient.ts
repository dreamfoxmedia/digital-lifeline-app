import { Preferences } from '@capacitor/preferences'
import { supabase } from './supabase'

// Module-level cache — geldig totdat setAuthCache/clearAuthCache wordt aangeroepen
let _authMode: string | null | undefined = undefined  // undefined = nog niet geladen
let _apiKey: string | null = null
let _serverUrl: string | null | undefined = undefined

export function setAuthCache(mode: string, apiKey?: string) {
  _authMode = mode
  _apiKey = apiKey ?? null
}

export function clearAuthCache() {
  _authMode = undefined
  _apiKey = null
  _serverUrl = undefined
}

async function getBaseUrl(): Promise<string> {
  if (import.meta.env.DEV) return ''
  if (_serverUrl === undefined) {
    const { value } = await Preferences.get({ key: 'serverUrl' })
    _serverUrl = value
  }
  return _serverUrl ?? 'https://mijn.digitallifeline.nl'
}

let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

async function getHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  if (_authMode === undefined) {
    const { value } = await Preferences.get({ key: 'authMode' })
    _authMode = value
  }

  if (_authMode === 'apiKey') {
    if (_apiKey === null) {
      const { value } = await Preferences.get({ key: 'apiKey' })
      _apiKey = value
    }
    if (_apiKey) headers['X-API-Key'] = _apiKey
  } else {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const [headers, baseUrl] = await Promise.all([getHeaders(), getBaseUrl()])
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { ...headers, ...(options?.headers ?? {}) },
  })

  if (res.status === 401) {
    onUnauthorized?.()
    throw new Error('Niet ingelogd')
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
}
