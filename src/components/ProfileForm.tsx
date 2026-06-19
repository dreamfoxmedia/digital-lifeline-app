import { useTranslation } from 'react-i18next'
import type { ProfileFormData } from '../types'

const RELATIONS = ['partner', 'kind', 'ouder', 'familie', 'hulpverlener', 'overig'] as const
const CATEGORIES = ['beweging', 'slaap', 'noodknop', 'valdetectie', 'rookmelder', 'medicatie', 'activiteit']

interface Props {
  data: ProfileFormData
  onChange: (data: ProfileFormData) => void
  errors: Partial<Record<keyof ProfileFormData, string>>
}

export default function ProfileForm({ data, onChange, errors }: Props) {
  const { t } = useTranslation()

  function set<K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) {
    onChange({ ...data, [key]: value })
  }

  function toggleCategory(cat: string) {
    const next = data.notify_categories.includes(cat)
      ? data.notify_categories.filter(c => c !== cat)
      : [...data.notify_categories, cat]
    set('notify_categories', next)
  }

  return (
    <div className="space-y-5">
      {/* Volledige naam */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t('onboarding.full_name')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.full_name}
          onChange={e => set('full_name', e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-brand-teal"
        />
        {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
      </div>

      {/* Weergavenaam */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t('onboarding.display_name')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.display_name}
          onChange={e => set('display_name', e.target.value)}
          placeholder={t('onboarding.display_name_placeholder')}
          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-brand-teal"
        />
        {errors.display_name && <p className="text-red-500 text-sm mt-1">{errors.display_name}</p>}
      </div>

      {/* Telefoonnummer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t('onboarding.phone')}
        </label>
        <input
          type="tel"
          value={data.phone}
          onChange={e => set('phone', e.target.value)}
          placeholder="+31612345678"
          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-brand-teal"
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      {/* Relatie */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t('onboarding.relation')}
        </label>
        <select
          value={data.relation}
          onChange={e => set('relation', e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a24] text-gray-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-brand-teal appearance-none"
        >
          <option value="">{t('onboarding.relation_placeholder')}</option>
          {RELATIONS.map(r => (
            <option key={r} value={r}>{t(`onboarding.relation_${r === 'kind' ? 'child' : r === 'ouder' ? 'parent' : r === 'familie' ? 'family' : r === 'hulpverlener' ? 'caregiver' : r === 'overig' ? 'other' : r}`)}</option>
          ))}
        </select>
      </div>

      {/* Noodmeldingen toggle */}
      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('onboarding.notify_emergency')}
        </span>
        <button
          type="button"
          onClick={() => set('notify_emergency', !data.notify_emergency)}
          className={`relative w-12 h-6 rounded-full transition-colors ${data.notify_emergency ? 'bg-brand-teal' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${data.notify_emergency ? 'translate-x-6' : 'translate-x-0.5'}`}
          />
        </button>
      </div>

      {/* WhatsApp toggle */}
      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('onboarding.notify_whatsapp')}
        </span>
        <button
          type="button"
          onClick={() => set('notify_whatsapp', !data.notify_whatsapp)}
          className={`relative w-12 h-6 rounded-full transition-colors ${data.notify_whatsapp ? 'bg-brand-teal' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${data.notify_whatsapp ? 'translate-x-6' : 'translate-x-0.5'}`}
          />
        </button>
      </div>

      {/* Meldingscategorieën */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('onboarding.notify_categories')}
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => {
            const active = data.notify_categories.includes(cat)
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  active
                    ? 'bg-brand-teal border-brand-teal text-white'
                    : 'bg-transparent border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                {t(`categories.${cat}`)}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
