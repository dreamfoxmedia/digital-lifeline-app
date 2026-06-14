import { Preferences } from '@capacitor/preferences'
import { supabase } from './supabase'

const BASE_URL = 'https://mijn.digitallifeline.nl'

let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

async function getHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const { value: authMode } = await Preferences.get({ key: 'authMode' })

  if (authMode === 'apiKey') {
    const { value: apiKey } = await Preferences.get({ key: 'apiKey' })
    if (apiKey) headers['X-API-Key'] = apiKey
  } else {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getHeaders()
  const res = await fetch(`${BASE_URL}${path}`, {
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
