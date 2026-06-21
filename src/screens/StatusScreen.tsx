import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import { supabase } from '../lib/supabase'
import CategoryTile from '../components/CategoryTile'
import EmergencyAlert from '../components/EmergencyAlert'
import type { CategoriesResponse, MeResponse, CategoryStatus, EventItem } from '../types'

const REFETCH_INTERVAL = 5 * 60 * 1000

const DATE_LOCALES: Record<string, string> = { nl: 'nl-NL', en: 'en-GB' }

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  return now
}

function formatDate(d: Date, language: string) {
  const locale = DATE_LOCALES[language] ?? 'nl-NL'
  const date = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(d)
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(d)
  return `${date} · ${time}`
}

function eventDescription(ev: EventItem, t: TFunction) {
  if (ev.description) return ev.description
  return t(`events.${ev.category}`, { defaultValue: t('events.default', { category: ev.category }) })
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

function overallStatus(cats: CategoryStatus[], t: TFunction) {
  if (cats.some(c => c.severity === 'emergency')) {
    return { label: t('status.emergency_label'), detail: t('status.emergency_detail'), bg: 'bg-red-50', text: 'text-red-700', ring: 'bg-red-100 text-red-600' }
  }
  if (cats.some(c => c.severity === 'warning')) {
    return { label: t('status.warning_label'), detail: t('status.warning_detail'), bg: 'bg-orange-50', text: 'text-orange-700', ring: 'bg-orange-100 text-orange-600' }
  }
  return { label: t('status.ok_label'), detail: t('status.ok_detail'), bg: 'bg-teal-50', text: 'text-teal-700', ring: 'bg-teal-100 text-teal-600' }
}

const EVENT_ICONS: Record<string, string> = {
  beweging: '☕',
  voordeur: '🚪',
  slaap: '🌙',
  activiteit: '☀️',
  medicatie: '💊',
  valdetectie: '⚠️',
  noodknop: '🆘',
}

export default function StatusScreen() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const now = useClock()
  const [emergency, setEmergency] = useState<CategoryStatus | null>(null)
  const eventsDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const meQuery = useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: () => apiClient.get('/api/mobile/me'),
  })

  const catQuery = useQuery<CategoriesResponse>({
    queryKey: ['categories'],
    queryFn: () => apiClient.get('/api/mobile/categories'),
    refetchInterval: REFETCH_INTERVAL,
  })

  const eventsQuery = useQuery<EventItem[]>({
    queryKey: ['events'],
    queryFn: () => apiClient.get('/api/mobile/events'),
    retry: false,
  })

  useEffect(() => {
    if (!meQuery.data) return
    const { viewer, roles } = meQuery.data
    if (roles.includes('bewaakt_persoon')) {
      navigate('/monitored', { replace: true })
      return
    }
    if (!viewer?.onboarding_phase_1_completed) {
      navigate('/registration', { replace: true })
      return
    }
    if (viewer === null || viewer.profile_completed === false) {
      navigate('/onboarding', { replace: true })
    }
  }, [meQuery.data, navigate])

  useEffect(() => {
    const householdId = catQuery.data?.household?.id
    if (!householdId) return

    const channel = supabase
      .channel(`status:${householdId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'category_status', filter: `household_id=eq.${householdId}` },
        () => { queryClient.invalidateQueries({ queryKey: ['categories'] }) }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'category_events', filter: `household_id=eq.${householdId}` },
        (payload) => {
          if (eventsDebounce.current) clearTimeout(eventsDebounce.current)
          eventsDebounce.current = setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['events'] })
          }, 1000)
          const row = payload.new as CategoryStatus
          if (row.severity === 'emergency') setEmergency(row)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [catQuery.data?.household?.id, queryClient])

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['categories'] })
    queryClient.invalidateQueries({ queryKey: ['events'] })
  }, [queryClient])

  const data = catQuery.data
  const status = data ? overallStatus(data.categories, t) : null
  const person = data?.monitored_person
  const events = eventsQuery.data ?? []

  return (
    <div className="min-h-screen bg-[#f5f3ef] dark:bg-[#0f0f13]">
      {emergency && (
        <EmergencyAlert category={emergency.category} onDismiss={() => setEmergency(null)} />
      )}

      <div className="px-4 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+24px)]">

        {/* Hoofdkaart */}
        <div className="bg-white dark:bg-[#1a1a24] rounded-3xl shadow-sm overflow-hidden">

          {/* Header: avatar + naam + datum */}
          <div className="px-5 pt-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-teal/20 dark:bg-brand-teal/30 flex items-center justify-center flex-shrink-0">
                <span className="text-brand-teal font-semibold text-sm">
                  {initials(meQuery.data?.viewer?.display_name ?? '')}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                  {meQuery.data?.viewer?.display_name ?? ''}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs capitalize">
                  {formatDate(now, i18n.language)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refresh}
                className="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-gray-500 active:text-gray-600"
                aria-label={t('status.refresh')}
              >
                ↻
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-gray-500 active:text-gray-600"
                aria-label={t('status.settings_btn')}
              >
                🔔
              </button>
            </div>
          </div>

          {/* Persoon */}
          {person && (
            <div className="px-5 py-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-base">{initials(person.name)}</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{person.name}</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">{data?.household?.name}{status ? ` · ${status.label.toLowerCase()}` : ''}</p>
              </div>
            </div>
          )}

          {/* Statusbanner */}
          {status && (
            <div className={`mx-5 mb-5 ${status.bg} rounded-2xl px-4 py-3 flex items-center gap-3`}>
              <div className={`w-8 h-8 rounded-full ${status.ring} flex items-center justify-center text-sm flex-shrink-0`}>
                ✓
              </div>
              <div>
                <p className={`${status.text} font-semibold text-base leading-tight`}>{status.label}</p>
                <p className={`${status.text} text-sm opacity-80`}>{status.detail}</p>
              </div>
            </div>
          )}

          {/* Laadstatus */}
          {(catQuery.isLoading || meQuery.isLoading) && (
            <div className="px-5 pb-6 text-center text-gray-400">{t('status.loading')}</div>
          )}

          {/* Foutmelding */}
          {(catQuery.error || meQuery.error) && !catQuery.isLoading && !meQuery.isLoading && (
            <div className="mx-5 mb-5 bg-red-50 rounded-2xl p-4">
              <p className="text-red-700 font-semibold text-sm mb-1">{t('status.error')}</p>
              <p className="text-red-500 text-xs font-mono break-all">
                {(catQuery.error as Error)?.message || (meQuery.error as Error)?.message}
              </p>
              <button
                onClick={refresh}
                className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium"
              >
                {t('status.retry')}
              </button>
            </div>
          )}

          {/* Lege staat — nog geen huishouden of sensordata */}
          {data && !data.household && !catQuery.isLoading && (
            <div className="mx-5 mb-6 bg-stone-50 dark:bg-[#252530] rounded-2xl px-4 py-5 text-center">
              <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-1">{t('status.not_linked_title')}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs">{t('status.not_linked_detail')}</p>
            </div>
          )}

          {data && data.household && data.categories.length === 0 && !catQuery.isLoading && (
            <div className="mx-5 mb-6 bg-stone-50 dark:bg-[#252530] rounded-2xl px-4 py-5 text-center">
              <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-1">{t('status.no_data_title')}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs">{t('status.no_data_detail')}</p>
            </div>
          )}

          {/* NU — categorie raster */}
          {data && data.categories.length > 0 && (
            <div className="px-5 mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{t('status.now_section')}</p>
              <div className="grid grid-cols-2 gap-3">
                {data.categories.map(item => (
                  <CategoryTile key={item.category} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* VANDAAG — activiteitenlijst */}
          {events.length > 0 && (
            <div className="px-5 pb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{t('status.today_section')}</p>
              <div className="flex flex-col">
                {events.map((ev, i) => (
                  <div key={ev.id}>
                    <div className="flex items-center gap-4 py-3">
                      <span className="text-gray-400 text-sm w-12 flex-shrink-0 tabular-nums">{ev.time}</span>
                      <span className="text-base flex-shrink-0">{EVENT_ICONS[ev.category] ?? '📌'}</span>
                      <span className="text-gray-800 dark:text-gray-200 text-sm">{eventDescription(ev, t)}</span>
                    </div>
                    {i < events.length - 1 && (
                      <div className="h-px bg-gray-100 dark:bg-gray-800 ml-16" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Tandwiel onderaan */}
        <button
          onClick={() => navigate('/settings')}
          className="mt-4 w-full flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500 text-sm py-2 active:text-gray-600"
        >
          <span>⚙️</span> {t('status.settings_btn')}
        </button>

      </div>
    </div>
  )
}
