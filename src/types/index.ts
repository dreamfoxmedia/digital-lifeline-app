export type AuthMode = 'session' | 'apiKey'

export type RegistrationStatus =
  | 'started'
  | 'profile_completed'
  | 'email_verified'
  | 'phone_verified'
  | 'partially_completed'
  | 'fully_completed'

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
  phone?: string | null
  relation?: string | null
  notify_emergency: boolean
  notify_whatsapp: boolean
  notify_categories: string[]
  profile_completed: boolean
  person_type?: 'family' | 'caregiver' | 'monitored' | null
  // Registratievelden (samengevoegd vanuit user_registrations)
  role?: 'family' | 'caregiver' | null
  registration_status?: RegistrationStatus | null
  onboarding_current_step?: number
  onboarding_phase_1_completed?: boolean
  onboarding_completed?: boolean
  monitoring_disclaimer_accepted?: boolean
  monitoring_disclaimer_version?: string | null
  gender?: string | null
  first_name?: string | null
  last_name?: string | null
  relationship_to_monitored_person?: string | null
  relationship_description?: string | null
  date_of_birth?: string | null
  email_verified?: boolean
  phone_number_e164?: string | null
  phone_verified?: boolean
  phone_verified_at?: string | null
  preferred_notification_channels?: string[]
  notify_email_levels?: string[] | null
  notify_push_levels?: string[] | null
  profile_shielded?: boolean | null
  avatar_url?: string | null
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
  notify_whatsapp: boolean
  notify_categories: string[]
}
