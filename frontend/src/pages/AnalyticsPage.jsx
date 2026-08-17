import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, BarChart2, Star, Shield, Flame, Award } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const verdictColor = (v) => v === 'INVEST' ? '#0E8F5B' : v === 'WATCH' ? '#B8862E' : v === 'SKIP' ? '#C8443A' : '#9AA69F'
const verdictBg   = (v) => v === 'INVEST' ? '#E4F5EC' : v === 'WATCH' ? '#FBF4E8' : v === 'SKIP' ? '#FBEAE8' : '#F5F7F4'

function StatCard({ symbol, companyName, sector, stat, statLabel, statColor, verdict, rank }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: '#fff', border: '1px solid #E5E8E2', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F5F7F4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9AA69F' }}>#{rank}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ fontWeight: 800, color: '#0F211A', fontSize: '0.875rem', fontFamily: "'IBM Plex Mono',monospace" }}>{symbol}</span>
          {verdict && <span style={{ background: verdictBg(verdict), color: verdictColor(verdict), borderRadius: 20, padding: '1px 7px', fontSize: '0.65rem', fontWeight: 700 }}>{verdict}</span>}
        </div>
        <p style={{ color: '#9AA69F', fontSize: '0.7rem', margin: 0 }}>{companyName || '—'} {sector ? `· ${sector}` : ''}</p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 800, color: statColor || '#0F211A', fontFamily: "'IBM Plex Mono',monospace", margin: 0 }}>{stat}</p>
        <p style={{ fontSize: '0.65rem', color: '#9AA69F', margin: 0 }}>{statLabel}</p>
      </div>
    </motion.div>
  )
}

const SECTIONS = [
  { key: 'trending',       label: '🔥 Trending Now',       endpoint: '/api/analytics/trending',        icon: <Flame size={16} />,    statKey: 'trending30d',   statLabel: '30-day researches', statColor: '#C8443A', color: '#C8443A' },
  { key: 'researched',     label: '🔬 Most Researched',     endpoint: '/api/analytics/most-researched', icon: <BarChart2 size={16} />, statKey: 'researchCount', statLabel: 'total researches',  statColor: '#4A90D9', color: '#4A90D9' },
  { key: 'confidence',     label: '🎯 Top Confidence',      endpoint: '/api/analytics/top-confidence',  icon: <Award size={16} />,    statKey: 'avgConfidence', statLabel: 'avg confidence %',  statColor: '#0E8F5B', color: '#0E8F5B' },
  { key: 'topPerforming',  label: '💚 Top Performing',      endpoint: '/api/analytics/top-performing',  icon: <TrendingUp size={16} />,statKey: 'avgHealthScore',statLabel: 'avg health score',  statColor: '#0E8F5B', color: '#0E8F5B' },
  { key: 'highestRisk',    label: '⚠️ Highest Risk',        endpoint: '/api/analytics/highest-risk',    icon: <Shield size={16} />,   statKey: 'skipCount',     statLabel: 'SKIP verdicts',     statColor: '#C8443A', color: '#C8443A' },
]

export default function AnalyticsPage() {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('trending')

  useEffect(() => {
    async function fetchAll() {
      try {
        const results = await Promise.allSettled(
          SECTIONS.map((s) => api.get(s.endpoint).then((r) => ({ key: s.key, data: Object.values(r.data)[0] })))
        )
        const merged = {}
        results.forEach((r) => { if (r.status === 'fulfilled') merged[r.value.key] = r.value.data })
        setData(merged)
      } catch { toast.error('Failed to load analytics') }
      finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  const activeConfig = SECTIONS.find((s) => s.key === activeSection)
  const activeData = data[activeSection] || []

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #E5E8E2', borderTopColor: '#0E8F5B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ background: '#FBFBF8', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.75rem', fontWeight: 600, color: '#0F211A', margin: 0 }}>Platform Analytics</h1>
          <p style={{ color: '#5B6B63', fontSize: '0.875rem', marginTop: 4 }}>Live intelligence on what the Vestro community is researching</p>
          <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E4F5EC', padding: '6px 12px', borderRadius: 8 }}>
            <BarChart2 size={14} color="#0E8F5B" />
            <span style={{ fontSize: '0.75rem', color: '#0E8F5B', fontWeight: 600 }}>Note: This data is based entirely on our users' research activity.</span>
          </div>
        </div>

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 36 }}>
          {[
            { label: 'Trending Symbols', value: data.trending?.length || 0, icon: <Flame size={20} color="#C8443A" /> },
            { label: 'Top Confidence', value: data.confidence?.[0]?.avgConfidence ? `${data.confidence[0].avgConfidence}%` : '—', icon: <Award size={20} color="#0E8F5B" /> },
            { label: '#1 Most Researched', value: data.researched?.[0]?.symbol || '—', icon: <BarChart2 size={20} color="#4A90D9" /> },
            { label: 'Most Researches', value: data.researched?.[0]?.researchCount || 0, icon: <TrendingUp size={20} color="#0E8F5B" /> },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              style={{ background: '#fff', border: '1px solid #E5E8E2', borderRadius: 14, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <p style={{ fontSize: '0.72rem', color: '#9AA69F', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{s.label}</p>
                {s.icon}
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F211A', fontFamily: "'IBM Plex Mono',monospace", margin: 0 }}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Section tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E5E8E2', marginBottom: 24, overflowX: 'auto' }}>
          {SECTIONS.map((s) => (
            <button key={s.key} onClick={() => setActiveSection(s.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 0', marginRight: 28, fontSize: '0.875rem', fontWeight: 700, color: activeSection === s.key ? '#0F211A' : '#9AA69F', background: 'none', border: 'none', borderBottom: `2.5px solid ${activeSection === s.key ? s.color : 'transparent'}`, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter,sans-serif' }}>
              <span style={{ color: activeSection === s.key ? s.color : '#9AA69F' }}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Active section leaderboard */}
        {activeData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9AA69F', fontSize: '0.875rem' }}>
            No data available yet. Research stocks to populate analytics.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 12 }}>
            {activeData.map((item, i) => (
              <StatCard
                key={item.symbol}
                rank={i + 1}
                symbol={item.symbol}
                companyName={item.companyName}
                sector={item.sector}
                verdict={item.lastVerdict}
                stat={item[activeConfig.statKey] ?? '—'}
                statLabel={activeConfig.statLabel}
                statColor={activeConfig.statColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
