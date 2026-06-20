import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/apiClient'
import { useAuth } from '../../context/AuthContext'
import RegistrationProgressBar from '../../components/RegistrationProgressBar'
import Step1Welcome from './steps/Step1Welcome'
import Step2PersonalData from './steps/Step2PersonalData'
import Step3Review from './steps/Step3Review'
import Step4EmailVerify from './steps/Step4EmailVerify'
import Step5Phone from './steps/Step5Phone'
import Step6Notifications from './steps/Step6Notifications'
import Step7Privacy from './steps/Step7Privacy'
import Step8Pending from './steps/Step6Pending'
import type { MeResponse } from '../../types'

export interface WizardData {
  salutation: string
  firstName: string
  lastName: string
  displayName: string
  relationship: string
  relationshipDescription: string
  dateOfBirth: string
  phoneVerified: boolean
  phoneSkipped: boolean
  notifyEmailLevels: string[]
  notifyPushLevels: string[]
  notifySms: boolean
  notifyWhatsapp: boolean
  notifyTelegram: boolean
  dataShielded: boolean
}

const DEFAULT_DATA: WizardData = {
  salutation: '',
  firstName: '',
  lastName: '',
  displayName: '',
  relationship: '',
  relationshipDescription: '',
  dateOfBirth: '',
  phoneVerified: false,
  phoneSkipped: false,
  notifyEmailLevels: ['warning', 'emergency'],
  notifyPushLevels: ['emergency'],
  notifySms: false,
  notifyWhatsapp: false,
  notifyTelegram: false,
  dataShielded: false,
}

const TOTAL_STEPS = 8

function mapFromServer(reg: NonNullable<MeResponse['registration']>): Partial<WizardData> {
  return {
    salutation: reg.salutation ?? '',
    firstName: reg.first_name ?? '',
    lastName: reg.last_name ?? '',
    displayName: reg.display_name ?? '',
    relationship: reg.relationship_to_monitored_person ?? '',
    relationshipDescription: reg.relationship_description ?? '',
    dateOfBirth: reg.date_of_birth ?? '',
    phoneVerified: reg.phone_verified,
    phoneSkipped: !reg.phone_verified && reg.onboarding_current_step > 5,
    notifyEmailLevels: reg.notify_email_levels ?? ['warning', 'emergency'],
    notifyPushLevels: reg.notify_push_levels ?? ['emergency'],
    notifySms: reg.preferred_notification_channels?.includes('sms') ?? false,
    notifyWhatsapp: reg.preferred_notification_channels?.includes('whatsapp') ?? false,
    notifyTelegram: reg.preferred_notification_channels?.includes('telegram') ?? false,
    dataShielded: reg.profile_shielded ?? false,
  }
}

export default function RegistrationFlow() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { signOut } = useAuth()

  const meQuery = useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: () => apiClient.get('/api/mobile/me'),
  })

  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>(DEFAULT_DATA)
  const [initialized, setInitialized] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (initialized || !meQuery.data) return
    const reg = meQuery.data.registration
    if (reg) {
      const startStep = Math.max(1, reg.onboarding_current_step ?? 1)
      setStep(startStep)
      setData(prev => ({ ...prev, ...mapFromServer(reg) }))
    }
    setInitialized(true)
  }, [meQuery.data, initialized])

  const role: 'family' | 'caregiver' | null =
    meQuery.data?.roles.includes('caregiver') ? 'caregiver' :
    meQuery.data?.roles.includes('family') ? 'family' :
    (meQuery.data?.registration?.role ?? null)

  function merge(updates: Partial<WizardData>) {
    setData(prev => ({ ...prev, ...updates }))
  }

  async function save(payload: object, nextStep: number) {
    setSaveError(null)
    setSaving(true)
    try {
      await apiClient.patch('/api/mobile/registration', {
        ...payload,
        onboarding_current_step: nextStep,
      })
      queryClient.invalidateQueries({ queryKey: ['me'] })
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Er is iets misgegaan.')
      throw e
    } finally {
      setSaving(false)
    }
  }

  // Step 1 handlers
  async function handleStep1Accept() {
    save({
      monitoring_disclaimer_accepted: true,
      monitoring_disclaimer_version: '1.0',
    }, 2).catch(() => {})
    setStep(2)
  }

  function handleStep1Decline() {
    signOut()
  }

  // Step 2 → step 3 (just advance, no save yet)
  function handleStep2Next() {
    setStep(3)
  }

  // Step 3 confirm → save profile + advance
  async function handleStep3Confirm() {
    try {
      await save({
        salutation: data.salutation || null,
        first_name: data.firstName,
        last_name: data.lastName,
        display_name: data.displayName,
        relationship_to_monitored_person: data.relationship || null,
        relationship_description: data.relationship === 'other' ? data.relationshipDescription : null,
        date_of_birth: data.dateOfBirth || null,
        registration_status: 'profile_completed',
      }, 4)
      setStep(4)
    } catch {}
  }

  // Step 4 email verified
  async function handleStep4Done() {
    try {
      await save({ registration_status: 'email_verified' }, 5)
      setStep(5)
    } catch {}
  }

  // Step 5 phone verified
  async function handleStep5Verified(phoneE164: string) {
    merge({ phoneVerified: true, phoneSkipped: false })
    try {
      await save({
        phone_number_e164: phoneE164,
        phone_verified: true,
        registration_status: 'phone_verified',
      }, 6)
      setStep(6)
    } catch {}
  }

  // Step 5 skip phone
  async function handleStep5Skip() {
    merge({ phoneSkipped: true, phoneVerified: false })
    try {
      await save({
        registration_status: 'partially_completed',
      }, 6)
      setStep(6)
    } catch {}
  }

  // Step 6 notification preferences → step 7
  async function handleStep6NotifDone() {
    const channels: string[] = []
    if (data.phoneVerified && data.notifySms) channels.push('sms')
    if (data.phoneVerified && data.notifyWhatsapp) channels.push('whatsapp')
    if (data.notifyTelegram) channels.push('telegram')
    try {
      await save({
        notify_email_levels: data.notifyEmailLevels,
        notify_push_levels: data.notifyPushLevels,
        preferred_notification_channels: channels,
      }, 7)
      setStep(7)
    } catch {}
  }

  // Step 7 privacy → step 8
  async function handleStep7PrivacyDone() {
    try {
      await save({ profile_shielded: data.dataShielded }, 8)
      setStep(8)
    } catch {}
  }

  // Step 8 final save
  async function handleStep8Done() {
    try {
      await save({
        onboarding_phase_1_completed: true,
        onboarding_completed: true,
        registration_status: data.phoneVerified ? 'fully_completed' : 'partially_completed',
      }, 8)
      navigate('/welcome', { replace: true })
    } catch {}
  }

  if (meQuery.isLoading || !initialized) {
    return (
      <div className="min-h-screen bg-[#f5f3ef] dark:bg-[#0f0f13] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f3ef] dark:bg-[#0f0f13] flex flex-col">
      <div className="sticky top-0 z-10">
        <RegistrationProgressBar current={step} total={TOTAL_STEPS} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {step === 1 && (
          <Step1Welcome
            role={role}
            saving={saving}
            onAccept={handleStep1Accept}
            onDecline={handleStep1Decline}
          />
        )}
        {step === 2 && (
          <Step2PersonalData
            data={data}
            saving={saving}
            onChange={merge}
            onNext={handleStep2Next}
          />
        )}
        {step === 3 && (
          <Step3Review
            data={data}
            saving={saving}
            onBack={() => setStep(2)}
            onConfirm={handleStep3Confirm}
          />
        )}
        {step === 4 && (
          <Step4EmailVerify
            prefillEmail={meQuery.data?.profile.email ?? ''}
            onVerified={handleStep4Done}
          />
        )}
        {step === 5 && (
          <Step5Phone
            onVerified={handleStep5Verified}
            onSkip={handleStep5Skip}
          />
        )}
        {step === 6 && (
          <Step6Notifications
            phoneVerified={data.phoneVerified}
            emailLevels={data.notifyEmailLevels}
            pushLevels={data.notifyPushLevels}
            notifySms={data.notifySms}
            notifyWhatsapp={data.notifyWhatsapp}
            notifyTelegram={data.notifyTelegram}
            saving={saving}
            onChange={merge}
            onNext={handleStep6NotifDone}
          />
        )}
        {step === 7 && (
          <Step7Privacy
            dataShielded={data.dataShielded}
            saving={saving}
            onChange={merge}
            onNext={handleStep7PrivacyDone}
          />
        )}
        {step === 8 && (
          <Step8Pending
            phoneVerified={data.phoneVerified}
            saving={saving}
            onDone={handleStep8Done}
          />
        )}
      </div>

      {saveError && (
        <div className="px-6 py-4 bg-red-50 dark:bg-red-900/20 border-t-2 border-red-400 dark:border-red-600">
          <p className="text-red-700 dark:text-red-300 text-sm font-semibold mb-0.5">Opslaan mislukt</p>
          <p className="text-red-600 dark:text-red-400 text-xs">{saveError}</p>
        </div>
      )}
    </div>
  )
}
