import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import { supabase } from '../lib/supabase'
import CategoryTile from '../components/CategoryTile'
import EmergencyAlert from '../components/EmergencyAlert'
import type { CategoriesResponse, MeResponse, CategoryStatus, EventItem } from '../types'

const REFETCH_INTERVAL = 5 * 60 * 1000

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  return now
}

function formatDate(d: Date) {
  const date = new Intl.DateTimeFormat('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' }).format(d)
  const time = new Intl.DateTimeFormat('nl-NL', { hour: '2-digit', minute: '2-digit' }).format(d)
  return `${date} · ${time}`
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

function overallStatus(cats: CategoryStatus[]) {
  if (cats.some(c => c.severity === 'emergency')) {
    return { label: 'Noodmelding', detail: 'Directe aandacht vereist', bg: 'bg-red-50', text: 'text-red-700', ring: 'bg-red-100 text-red-600' }
  }
  if (cats.some(c => c.severity === 'warning')) {
    return { label: 'Let op', detail: 'Iets vraagt aandacht', bg: 'bg-orange-50', text: 'text-orange-700', ring: 'bg-orange-100 text-orange-600' }
  }
  return { label: 'Geen zorgen', detail: 'Normaal dagritme vandaag', bg: 'bg-teal-50', text: 'text-teal-700', ring: 'bg-teal-100 text-teal-600' }
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
  const queryClient = useQueryClient()
  const now = useClock()
  const [emergency, setEmergency] = useState<CategoryStatus | null>(null)

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
    const { viewer } = meQuery.data
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
          queryClient.invalidateQueries({ queryKey: ['events'] })
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
  const status = data ? overallStatus(data.categories) : null
  const person = data?.monitored_person
  const events = eventsQuery.data ?? []

  return (
    <div className="min-h-screen bg-[#ede9e3]">
      {emergency && (
        <EmergencyAlert category={emergency.category} onDismiss={() => setEmergency(null)} />
      )}

      <div className="px-4 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+24px)]">

        {/* Hoofdkaart */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">

          {/* Datum + knoppen */}
          <div className="px-5 pt-5 flex items-center justify-between">
            <span className="text-gray-400 text-sm capitalize">{formatDate(now)}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={refresh}
                className="w-8 h-8 flex items-center justify-center text-gray-400 active:text-gray-600"
                aria-label="Vernieuwen"
              >
                ↻
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="w-8 h-8 flex items-center justify-center text-gray-400 active:text-gray-600"
                aria-label="Instellingen"
              >
                🔔
              </button>
            </div>
          </div>

          {/* Persoon */}
          {person && (
            <div className="px-5 py-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-base">{initials(person.name)}</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg leading-tight">{person.name}</p>
                <p className="text-gray-400 text-sm">{data?.household.name}{status ? ` · ${status.label.toLowerCase()}` : ''}</p>
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
          {catQuery.isLoading && (
            <div className="px-5 pb-6 text-center text-gray-400">Laden...</div>
          )}

          {/* NU — categorie raster */}
          {data && data.categories.length > 0 && (
            <div className="px-5 mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Nu</p>
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
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Vandaag</p>
              <div className="flex flex-col">
                {events.map((ev, i) => (
                  <div key={ev.id}>
                    <div className="flex items-center gap-4 py-3">
                      <span className="text-gray-400 text-sm w-12 flex-shrink-0 tabular-nums">{ev.time}</span>
                      <span className="text-base flex-shrink-0">{EVENT_ICONS[ev.category] ?? '📌'}</span>
                      <span className="text-gray-800 text-sm">{ev.description}</span>
                    </div>
                    {i < events.length - 1 && (
                      <div className="h-px bg-gray-100 ml-16" />
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
          className="mt-4 w-full flex items-center justify-center gap-2 text-gray-400 text-sm py-2 active:text-gray-600"
        >
          <span>⚙️</span> Instellingen
        </button>

      </div>
    </div>
  )
}
