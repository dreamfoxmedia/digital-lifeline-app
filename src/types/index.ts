export type AuthMode = 'session' | 'apiKey'

export interface AuthState {
  mode: AuthMode | null
  apiKey: string | null
  accessToken: string | null
  userId: string | null
}

export interface Profile {
  user_id: string
  email: string
  login_name: string
  full_name: string
  status: string
  phone?: string
  relation?: string
  notify_emergency?: boolean
  notify_categories?: string[]
}

export interface Viewer {
  id: string
  household_id: string
  display_name: string
  phone?: string
  relation?: string
  notify_emergency: boolean
  notify_categories: string[]
  profile_completed: boolean
}

export interface MeResponse {
  profile: Profile
  viewer: Viewer | null
  roles: string[]
}

export interface MonitoredPerson {
  id: string
  name: string
  email?: string
  phone?: string
  notes?: string
}

export interface Household {
  id: string
  name: string
}

export type Severity = 'info' | 'warning' | 'emergency'

export interface CategoryStatus {
  category: string
  status: string
  status_info: unknown
  severity: Severity
  observed_at: string
  updated_at: string
}

export interface CategoriesResponse {
  household: Household | null
  monitored_person: MonitoredPerson | null
  categories: CategoryStatus[]
}

export interface EventItem {
  id: string
  time: string
  category: string
  description: string | null
}

export interface ProfileFormData {
  full_name: string
  display_name: string
  phone: string
  relation: string
  notify_emergency: boolean
  notify_categories: string[]
}
