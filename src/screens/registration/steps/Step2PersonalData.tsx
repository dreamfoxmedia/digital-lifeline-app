import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { WizardData } from '../RegistrationFlow'

const RELATIONSHIPS = [
  'partner', 'spouse', 'father', 'mother', 'son', 'daughter',
  'brother', 'sister', 'grandfather', 'grandmother', 'grandchild',
  'other_family', 'neighbor', 'friend', 'informal_caregiver',
  'professional_caregiver', 'home_care', 'nurse', 'coach', 'gp',
  'case_manager', 'legal_guardian', 'other',
] as const

type ErrorKey = string
type Errors = Partial<Record<string, ErrorKey>>

function validate(data: WizardData): Errors {
  const e: Errors = {}
  if (!data.firstName.trim()) e.firstName = 'reg.err_required'
  if (!data.lastName.trim()) e.lastName = 'reg.err_required'
  if (!data.displayName.trim()) e.displayName = 'reg.err_required'
  else if (data.displayName.trim().length < 2) e.displayName = 'reg.err_min_length|2'
  else if (data.displayName.trim().length > 50) e.displayName = 'reg.err_max_length|50'
  if (!data.relationship) e.relationship = 'reg.err_required'
  if (data.relationship === 'other' && !data.relationshipDescription.trim())
    e.relationshipDescription = 'reg.err_required'
  if (data.dateOfBirth) {
    const dob = new Date(data.dateOfBirth)
    if (dob > new Date()) e.dateOfBirth = 'reg.err_dob_future'
  }
  return e
}

interface Props {
  data: WizardData
  saving: boolean
  onChange: (updates: Partial<WizardData>) => void
  onNext: () => void
}

export default function Step2PersonalData({ data, saving, onChange, onNext }: Props) {
  const { t } = useTranslation()
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState(false)

  function set<K extends keyof WizardData>(key: K, value: WizardData[K]) {
    onChange({ [key]: value })
  }

  function translateError(key: ErrorKey | undefined): string | undefined {
    if (!key) return undefined
    if (key.includes('|')) {
      const [k, val] = key.split('|')
      const num = parseInt(val)
      if (k === 'reg.err_min_length') return t('reg.err_min_length', { min: num })
      if (k === 'reg.err_max_length') return t('reg.err_max_length', { max: num })
    }
    return t(key)
  }

  function handleNext() {
    const e = validate(data)
    if (Object.keys(e).length > 0) {
      setErrors(e)
      setTouched(true)
      return
    }
    onNext()
  }

  function field(key: string) {
    return touched ? translateError(errors[key]) : undefined
  }

  const inputCls = (err?: string) =>
    `w-full px-4 py-3.5 rounded-xl border ${err ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-brand-teal appearance-none`

  return (
    <div className="px-6 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
          {t('reg.step2_title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {t('reg.step2_intro')}
        </p>
      </div>

      {/* Aanspreekvorm */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t('reg.step2_salutation')}
        </label>
        <select
          value={data.salutation}
          onChange={e => set('salutation', e.target.value)}
          className={inputCls()}
        >
          <option value="">{t('reg.step2_salutation_placeholder')}</option>
          <option value="de_heer">{t('reg.step2_salutation_sir')}</option>
          <option value="mevrouw">{t('reg.step2_salutation_madam')}</option>
          <option value="geen_voorkeur">{t('reg.step2_salutation_none')}</option>
        </select>
      </div>

      {/* Voornaam */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t('reg.step2_first_name')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          autoComplete="given-name"
          value={data.firstName}
          onChange={e => set('firstName', e.target.value)}
          className={inputCls(field('firstName'))}
        />
        {field('firstName') && <p className="text-red-500 text-sm mt-1">{field('firstName')}</p>}
      </div>

      {/* Achternaam */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t('reg.step2_last_name')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          autoComplete="family-name"
          value={data.lastName}
          onChange={e => set('lastName', e.target.value)}
          className={inputCls(field('lastName'))}
        />
        {field('lastName') && <p className="text-red-500 text-sm mt-1">{field('lastName')}</p>}
      </div>

      {/* Schermnaam */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t('reg.step2_display_name')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.displayName}
          onChange={e => set('displayName', e.target.value)}
          className={inputCls(field('displayName'))}
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">
          {t('reg.step2_display_name_hint')}
        </p>
        {field('displayName') && <p className="text-red-500 text-sm mt-1">{field('displayName')}</p>}
      </div>

      {/* Relatie */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t('reg.step2_relationship')} <span className="text-red-500">*</span>
        </label>
        <select
          value={data.relationship}
          onChange={e => set('relationship', e.target.value)}
          className={inputCls(field('relationship'))}
        >
          <option value="">{t('reg.step2_relationship_placeholder')}</option>
          {RELATIONSHIPS.map(r => (
            <option key={r} value={r}>{t(`reg.rel_${r}`)}</option>
          ))}
        </select>
        {field('relationship') && <p className="text-red-500 text-sm mt-1">{field('relationship')}</p>}
      </div>

      {/* Omschrijving bij "Overig" */}
      {data.relationship === 'other' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('reg.step2_relationship_other')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.relationshipDescription}
            onChange={e => set('relationshipDescription', e.target.value)}
            className={inputCls(field('relationshipDescription'))}
          />
          {field('relationshipDescription') && (
            <p className="text-red-500 text-sm mt-1">{field('relationshipDescription')}</p>
          )}
        </div>
      )}

      {/* Geboortedatum */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t('reg.step2_dob')}
        </label>
        <input
          type="date"
          value={data.dateOfBirth}
          max={new Date().toISOString().slice(0, 10)}
          onChange={e => set('dateOfBirth', e.target.value)}
          className={inputCls(field('dateOfBirth'))}
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('reg.step2_dob_hint')}</p>
        {field('dateOfBirth') && <p className="text-red-500 text-sm mt-1">{field('dateOfBirth')}</p>}
      </div>

      <div className="pt-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <button
          type="button"
          disabled={saving}
          onClick={handleNext}
          className="w-full py-4 rounded-xl bg-brand-teal text-white font-semibold text-base disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {saving ? '...' : t('reg.step2_next')}
        </button>
      </div>
    </div>
  )
}
