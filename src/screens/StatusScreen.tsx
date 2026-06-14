import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import { supabase } from '../lib/supabase'
import ProfileCard from '../components/ProfileCard'
import CategoryCard from '../components/CategoryCard'
import EmergencyAlert from '../components/EmergencyAlert'
import type { CategoriesResponse, MeResponse, CategoryStatus } from '../types'

const REFETCH_INTERVAL = 5 * 60 * 1000

export default function StatusScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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

  // Doorsturen naar onboarding als profiel onvolledig is
  useEffect(() => {
    const profile = meQuery.data?.profile
    if (!profile) return
    const needsOnboarding = !profile.full_name || profile.notify_emergency === undefined
    if (needsOnboarding) navigate('/onboarding', { replace: true })
  }, [meQuery.data, navigate])

  // Realtime Supabase subscription
  useEffect(() => {
    const householdId = catQuery.data?.household?.id
    if (!householdId) return

    const channel = supabase
      .channel(`status:${householdId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'category_status', filter: `household_id=eq.${householdId}` },
        () => { queryClient.invalidateQueries({ queryKey: ['categories'] }) }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'category_events', filter: `household_id=eq.${householdId}` },
        (payload) => {
          const row = payload.new as CategoryStatus
          if (row.severity === 'emergency') setEmergency(row)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [catQuery.data?.household?.id, queryClient])

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['categories'] })
  }, [queryClient])

  const loading = catQuery.isLoading || meQuery.isLoading
  const error = catQuery.error || meQuery.error

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f13] flex flex-col">
      {/* Noodmelding overlay */}
      {emergency && (
        <EmergencyAlert
          category={emergency.category}
          onDismiss={() => setEmergency(null)}
        />
      )}

      {/* Header */}
      <div className="px-4 pt-[calc(env(safe-area-inset-top)+16px)] pb-4 bg-[#0f0f13] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FFB454] flex items-center justify-center">
            <svg viewBox="0 0 256 256" className="w-3.5 h-3.5" fill="none" stroke="white" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20,128 L72,128 L88,76 L108,180 L128,96 L148,128 L236,128" />
            </svg>
          </div>
          <h1 className="text-white font-bold text-lg">{t('status.title')}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20"
            aria-label="Vernieuwen"
          >
            <span className="text-white text-base">↻</span>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20"
            aria-label="Instellingen"
          >
            <span className="text-white text-base">⚙️</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+24px)]">
        {loading && (
          <div className="flex items-center justify-center pt-20">
            <p className="text-gray-400">{t('status.loading')}</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center pt-20 gap-4">
            <p className="text-gray-400">{t('status.error')}</p>
            <button
              onClick={refresh}
              className="px-6 py-2 rounded-xl bg-[#FFB454] text-white font-medium"
            >
              {t('status.retry')}
            </button>
          </div>
        )}

        {catQuery.data && !loading && (
          <>
            {/* Profielkaart */}
            <div className="pt-4">
              <ProfileCard
                person={catQuery.data.monitored_person}
                household={catQuery.data.household}
              />
            </div>

            {/* Categorie-tegels */}
            <div className="flex flex-col gap-3 pt-2">
              {catQuery.data.categories.map(item => (
                <CategoryCard key={item.category} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
