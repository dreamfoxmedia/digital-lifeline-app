import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import { supabase } from '../lib/supabase'
import EmergencyAlert from '../components/EmergencyAlert'
import type { MeResponse, CategoryStatus, WellbeingStatus, DashboardData } from '../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useIsDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains('dark')))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  return now
}

const CLOCK_LOCALES: Record<string, string> = { nl: 'nl-NL', en: 'en-GB', de: 'de-DE', fr: 'fr-FR', es: 'es-ES' }

function formatDateTime(d: Date, lang: string) {
  const locale = CLOCK_LOCALES[lang] ?? 'nl-NL'
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(d)
  const dayMonth = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(d)
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(d)
  return `${weekday} ${dayMonth} · ${time}`
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

// ─── Icon system ─────────────────────────────────────────────────────────────

type IconName = 'activity' | 'door' | 'shield' | 'shield-alert' | 'thermometer' | 'moon'
  | 'check-circle' | 'alert-triangle' | 'info' | 'coffee' | 'door-open' | 'sun' | 'bell'
  | 'settings' | 'x'

function Icon({ name, size = 24, color = 'currentColor' }: { name: string; size?: number; color?: string }) {
  const p: React.SVGProps<SVGSVGElement> = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth: 1.8,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  }
  switch (name as IconName) {
    case 'bell':
      return <svg {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
    case 'activity':
      return <svg {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
    case 'door':
      return <svg {...p}><path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" /><path d="M2 20h20" /><path d="M14 12v.01" /></svg>
    case 'shield':
      return <svg {...p}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>
    case 'shield-alert':
      return <svg {...p}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
    case 'thermometer':
      return <svg {...p}><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" /></svg>
    case 'moon':
      return <svg {...p}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
    case 'check-circle':
      return <svg {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    case 'alert-triangle':
      return <svg {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
    case 'info':
      return <svg {...p}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
    case 'coffee':
      return <svg {...p}><path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" /></svg>
    case 'door-open':
      return <svg {...p}><path d="M13 4h3a2 2 0 0 1 2 2v14" /><path d="M2 20h3" /><path d="M13 20h9" /><path d="M10 12v.01" /><path d="M13 4.56v16.16a1 1 0 0 1-1.24.97L5 20V5.56a2 2 0 0 1 1.52-1.94l4-1A2 2 0 0 1 13 4.56Z" /></svg>
    case 'sun':
      return <svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
    case 'settings':
      return <svg {...p}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
    case 'x':
      return <svg {...p}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
    default:
      return <svg {...p}><circle cx="12" cy="12" r="10" /></svg>
  }
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const T = {
  light: {
    bg: '#ebe7df', card: '#ffffff', cardBorder: 'transparent',
    shadow: '0 8px 30px rgba(20,30,45,0.10),0 1px 3px rgba(20,30,45,0.06)',
    muted: '#8a9099', icon: '#5b6470',
    avatarBg: '#d6e4f7', avatarText: '#1f4e85',
    heading: '#11233f', subtle: '#6b7280', label: '#a3a8af',
    tile: '#f3f1ec', tileBorder: 'transparent', tileIcon: '#8a8f96', tileLabel: '#878d94',
    value: '#1c2733', time: '#9aa0a8', tlIcon: '#5b6470', divider: '#ededeb',
    bw: '1px', dangerIcon: '#d6362b', warnIcon: '#b08a2a', skBase: '#f3f1ec', skHi: '#faf9f6',
  },
  dark: {
    bg: '#0b131d', card: '#16222f', cardBorder: '#43576b',
    shadow: '0 10px 34px rgba(0,0,0,0.5)',
    muted: '#7e8893', icon: '#9aa6b2',
    avatarBg: '#1c3a5e', avatarText: '#9cc4f0',
    heading: '#f0f4f8', subtle: '#97a2ae', label: '#69747f',
    tile: '#1b2734', tileBorder: '#46586b', tileIcon: '#8593a1', tileLabel: '#8995a2',
    value: '#eaeef3', time: '#798593', tlIcon: '#9aa6b2', divider: '#2c3947',
    bw: '1.5px', dangerIcon: '#ff6f5e', warnIcon: '#d7b54e', skBase: '#1b2734', skHi: '#243140',
  },
}

const BANNERS = {
  gerust:       { l: { bg:'#d9ede2', strong:'#266b52', text:'#3a8266', icon:'#2e7d5f', border:'transparent' }, d: { bg:'#15352b', strong:'#7fd6ab', text:'#a3ddc1', icon:'#54c08c', border:'#4a8f6f' } },
  aandacht:     { l: { bg:'#f6edcf', strong:'#8a6a1f', text:'#9a7c33', icon:'#b08a2a', border:'transparent' }, d: { bg:'#332c12', strong:'#e6c66a', text:'#d6bd72', icon:'#d7b54e', border:'#7c692e' } },
  afwijkend:    { l: { bg:'#fcebdf', strong:'#c25a30', text:'#cf7048', icon:'#d96a3c', border:'transparent' }, d: { bg:'#3a2417', strong:'#f0a877', text:'#e0966a', icon:'#ee9a63', border:'#8a663a' } },
  waarschuwing: { l: { bg:'#fce4e2', strong:'#b3261e', text:'#bb453d', icon:'#d6362b', border:'#eda49d' }, d: { bg:'#3d1a18', strong:'#ff9a8f', text:'#f0867a', icon:'#ff6f5e', border:'#a8483e' } },
  onvoldoende:  { l: { bg:'#ebedef', strong:'#4a5560', text:'#69737e', icon:'#8793a0', border:'transparent' }, d: { bg:'#1e2935', strong:'#aab6c2', text:'#8d99a6', icon:'#8593a1', border:'#445668' } },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function fmtTime(iso: string, lang: string) {
  const locale = CLOCK_LOCALES[lang] ?? 'nl-NL'
  return new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Shimmer({ tk }: { tk: typeof T.light }) {
  const s = {
    background: `linear-gradient(90deg,${tk.skBase} 25%,${tk.skHi} 37%,${tk.skBase} 63%)`,
    backgroundSize: '400% 100%',
    animation: 'dl-shimmer 1.4s ease infinite',
  } as React.CSSProperties
  return (
    <div>
      <div style={{ ...s, height: 66, borderRadius: 14, marginBottom: 24 }} />
      <div style={{ ...s, height: 13, width: 40, borderRadius: 6, marginBottom: 14 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 26 }}>
        {[0,1,2,3].map(i => <div key={i} style={{ ...s, height: 120, borderRadius: 14 }} />)}
      </div>
      <div style={{ ...s, height: 13, width: 64, borderRadius: 6, marginBottom: 16 }} />
      {[0,1,2].map(i => <div key={i} style={{ ...s, height: 22, borderRadius: 6, marginBottom: 16, width: i === 1 ? '88%' : i === 2 ? '72%' : '100%' }} />)}
    </div>
  )
}

function StatusBanner({ status, dashboard, isDark, borderWidth }: {
  status: WellbeingStatus
  dashboard: DashboardData
  isDark: boolean
  borderWidth: string
}) {
  const { t } = useTranslation()
  const b = isDark ? BANNERS[status].d : BANNERS[status].l
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: b.bg, border: `${borderWidth} solid ${b.border}`,
      borderRadius: 14, padding: '16px 18px', marginBottom: 14,
    }}>
      <div style={{ color: b.icon, flexShrink: 0, display: 'flex' }}>
        <Icon name={dashboard.banner.icon} size={26} color={b.icon} />
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 600, color: b.strong, lineHeight: 1.2 }}>
          {t(dashboard.banner.titleKey)}
        </div>
        <div style={{ fontSize: 16, color: b.text, marginTop: 2 }}>
          {t(dashboard.banner.subKey)}
        </div>
      </div>
    </div>
  )
}

function SafetyBlock({ alert, isDark }: {
  alert: { category: string; observedAt: string }
  isDark: boolean
}) {
  const { t, i18n } = useTranslation()
  const b = isDark ? BANNERS.waarschuwing.d : BANNERS.waarschuwing.l
  const catLabel = t(`categories.${alert.category}`, { defaultValue: capitalize(alert.category) })
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: b.bg, border: `1.5px solid ${b.border}`,
      borderRadius: 14, padding: '15px 18px', marginBottom: 24,
    }}>
      <div style={{ color: b.icon, flexShrink: 0, display: 'flex' }}>
        <Icon name="shield-alert" size={26} color={b.icon} />
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase', color: b.icon, marginBottom: 2 }}>
          {t('status.safety_label')}
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, color: b.strong, lineHeight: 1.2 }}>
          {catLabel}
        </div>
        <div style={{ fontSize: 15, color: b.text, marginTop: 2 }}>
          {t('status.alert_at', { time: fmtTime(alert.observedAt, i18n.language) })}
        </div>
      </div>
    </div>
  )
}

function InsightCard({ card, tk }: { card: DashboardData['cards'][0]; tk: typeof T.light }) {
  const { t, i18n } = useTranslation()
  const label = t(`categories.${card.category}`, { defaultValue: capitalize(card.category) })
  const value = t(`status.card_${card.state}`)
  const sub = card.state === 'empty'
    ? t('status.card_sub_empty')
    : card.lastSeen
      ? t(`status.card_sub_${card.state}`, { time: fmtTime(card.lastSeen, i18n.language) })
      : ''
  return (
    <div style={{
      background: tk.tile,
      border: `${tk.bw} solid ${tk.tileBorder}`,
      borderRadius: 14, padding: '16px 16px 18px',
    }}>
      <div style={{ color: tk.tileIcon, marginBottom: 12, display: 'flex' }}>
        <Icon name={card.icon} size={24} color={tk.tileIcon} />
      </div>
      <div style={{ fontSize: 14, color: tk.tileLabel, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: tk.value, lineHeight: 1.25 }}>{value}</div>
      <div style={{ fontSize: 13.5, color: tk.tileLabel, marginTop: 4, lineHeight: 1.32 }}>{sub}</div>
    </div>
  )
}

function TimelineRow({ ev, tk, isLast }: { ev: DashboardData['timeline'][0]; tk: typeof T.light; isLast: boolean }) {
  const { t, i18n } = useTranslation()
  const iconColor = ev.tone === 'danger' ? tk.dangerIcon : ev.tone === 'warning' ? tk.warnIcon : tk.tlIcon
  const catLabel = t(`categories.${ev.category}`, { defaultValue: capitalize(ev.category) })
  const text = ev.status
    ? `${catLabel}: ${ev.status}`
    : ev.tone
      ? t('status.timeline_alert', { category: catLabel })
      : t('status.timeline_activity', { category: catLabel })
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 18,
      padding: '15px 2px',
      borderBottom: isLast ? 'none' : `${tk.bw} solid ${tk.divider}`,
    }}>
      <div style={{ fontSize: 17, color: tk.time, fontVariantNumeric: 'tabular-nums', width: 48, flexShrink: 0 }}>
        {fmtTime(ev.observedAt, i18n.language)}
      </div>
      <div style={{ flexShrink: 0, display: 'flex', color: iconColor }}>
        <Icon name={ev.icon} size={22} color={iconColor} />
      </div>
      <div style={{ fontSize: 18, color: tk.value, fontWeight: 500 }}>{text}</div>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

const REFETCH_INTERVAL = 5 * 60 * 1000

export default function StatusScreen() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const now = useClock()
  const isDark = useIsDark()
  const tk = isDark ? T.dark : T.light
  const [emergency, setEmergency] = useState<CategoryStatus | null>(null)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const eventsDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const meQuery = useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: () => apiClient.get('/api/mobile/me'),
  })

  const dashboardQuery = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.get('/api/mobile/dashboard'),
    refetchInterval: REFETCH_INTERVAL,
  })

  // Navigation guards
  useEffect(() => {
    if (!meQuery.data) return
    const { viewer, roles } = meQuery.data
    if (roles.includes('bewaakt_persoon')) { navigate('/monitored', { replace: true }); return }
    if (!viewer?.onboarding_phase_1_completed) { navigate('/registration', { replace: true }); return }
    if (viewer === null || viewer.profile_completed === false) navigate('/onboarding', { replace: true })
  }, [meQuery.data, navigate])

  // Real-time subscription — use household_id from viewer (me query)
  useEffect(() => {
    const householdId = meQuery.data?.viewer?.household_id
    if (!householdId) return
    const channel = supabase
      .channel(`status:${householdId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'category_status', filter: `household_id=eq.${householdId}` },
        () => queryClient.invalidateQueries({ queryKey: ['dashboard'] }))
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'category_events', filter: `household_id=eq.${householdId}` },
        payload => {
          if (eventsDebounce.current) clearTimeout(eventsDebounce.current)
          eventsDebounce.current = setTimeout(() => queryClient.invalidateQueries({ queryKey: ['dashboard'] }), 1000)
          const row = payload.new as CategoryStatus
          if (row.severity === 'emergency') setEmergency(row)
        })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [meQuery.data?.viewer?.household_id, queryClient])

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }, [queryClient])

  const isLoading = dashboardQuery.isLoading || meQuery.isLoading
  const dashboard = dashboardQuery.data ?? null

  const viewerName = meQuery.data?.viewer?.display_name ?? ''

  return (
    <div
      style={{
        minHeight: '100vh',
        background: tk.bg,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: `calc(env(safe-area-inset-top) + 20px) 16px calc(env(safe-area-inset-bottom) + 24px)`,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {emergency && (
        <EmergencyAlert category={emergency.category} onDismiss={() => setEmergency(null)} />
      )}

      <div style={{
        width: '100%', maxWidth: 392,
        background: tk.card,
        border: `${tk.bw} solid ${tk.cardBorder}`,
        borderRadius: 26,
        boxShadow: tk.shadow,
        padding: '24px 22px 14px',
      }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 500, color: tk.muted, letterSpacing: '-0.1px' }}>
            {formatDateTime(now, i18n.language)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {avatarOpen && (
              <button
                onClick={() => setAvatarOpen(false)}
                aria-label={t('common.close')}
                style={{ color: tk.icon, background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
              >
                <Icon name="x" size={24} color={tk.icon} />
              </button>
            )}
            <button
              onClick={() => navigate('/notifications')}
              aria-label={t('status.notifications_btn')}
              style={{ color: tk.icon, background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
            >
              <Icon name="bell" size={24} color={tk.icon} />
            </button>
            <button
              onClick={() => navigate('/settings')}
              aria-label={t('settings.title')}
              style={{ color: tk.icon, background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
            >
              <Icon name="settings" size={24} color={tk.icon} />
            </button>
          </div>
        </div>

        {/* Avatar overlay */}
        {avatarOpen && (
          <div
            onClick={() => setAvatarOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.82)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}
            >
              <div style={{
                width: 180, height: 180, borderRadius: '50%',
                background: tk.avatarBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              }}>
                {dashboard?.personAvatarUrl
                  ? <img src={dashboard.personAvatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 56, fontWeight: 600, color: tk.avatarText }}>
                      {dashboard?.personInitials ?? initials(viewerName)}
                    </span>
                }
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#ffffff', letterSpacing: '-0.3px' }}>
                {dashboard?.personName ?? viewerName}
              </div>
            </div>
          </div>
        )}

        {/* Profile row — monitored person */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <button
            onClick={() => setAvatarOpen(true)}
            aria-label={t('status.avatar_enlarge')}
            style={{
              width: 64, height: 64, borderRadius: '50%',
              background: tk.avatarBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
              border: 'none', padding: 0, cursor: 'pointer',
            }}
          >
            {dashboard?.personAvatarUrl
              ? <img src={dashboard.personAvatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 19, fontWeight: 600, color: tk.avatarText, letterSpacing: '0.3px' }}>
                  {dashboard?.personInitials ?? initials(viewerName)}
                </span>
            }
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 26, fontWeight: 600, color: tk.heading, lineHeight: 1.15, letterSpacing: '-0.4px' }}>
              {dashboard?.personName ?? viewerName}
            </div>
            <div style={{ fontSize: 16, color: tk.subtle, marginTop: 3 }}>
              {isLoading ? t('status.onvoldoende_line') : dashboard ? t(dashboard.statusLineKey) : t('status.gerust_line')}
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading && <Shimmer tk={tk} />}

        {/* Error state */}
        {dashboardQuery.isError && !isLoading && (
          <div style={{ background: '#fce4e2', borderRadius: 14, padding: '16px 18px', marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#b3261e', marginBottom: 4 }}>{t('status.error_title')}</div>
            <div style={{ fontSize: 14, color: '#bb453d', marginBottom: 12 }}>{t('status.error_body')}</div>
            <button
              onClick={refresh}
              style={{ background: '#eda49d', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 600, color: '#b3261e', cursor: 'pointer' }}
            >
              {t('status.retry')}
            </button>
          </div>
        )}

        {/* Content */}
        {!isLoading && dashboard && (
          <div>
            {/* Status banner */}
            <StatusBanner
              status={dashboard.status}
              dashboard={dashboard}
              isDark={isDark}
              borderWidth={tk.bw}
            />

            {/* Safety priority block */}
            {dashboard.alert
              ? <SafetyBlock alert={dashboard.alert} isDark={isDark} />
              : <div style={{ height: 10 }} />
            }

            {/* NU — insight cards grid */}
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '1.4px', color: tk.label, marginBottom: 12, textTransform: 'uppercase' }}>
              {t('status.now_section')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 26 }}>
              {dashboard.cards.map((card, i) => (
                <InsightCard key={i} card={card} tk={tk} />
              ))}
            </div>

            {/* VANDAAG — timeline */}
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '1.4px', color: tk.label, marginBottom: 6, textTransform: 'uppercase' }}>
              {t('status.today_section')}
            </div>
            {dashboard.timeline.length === 0 ? (
              <div style={{ padding: '22px 4px 26px', color: tk.time, fontSize: 16, lineHeight: 1.4 }}>
                {t('status.no_data_yet')}
              </div>
            ) : (
              <div>
                {dashboard.timeline.map((ev, i) => (
                  <TimelineRow key={ev.id} ev={ev} tk={tk} isLast={i === dashboard.timeline.length - 1} />
                ))}
              </div>
            )}
          </div>
        )}


      </div>
    </div>
  )
}
