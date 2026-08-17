import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart2, BookOpen, Eye, Star, TrendingUp, Clock, Zap, ChevronRight, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { useIsMobile } from '../hooks/useIsMobile'

const verdictColor = (v) => v === 'INVEST' ? '#0E8F5B' : v === 'WATCH' ? '#B8862E' : v === 'SKIP' ? '#C8443A' : '#9AA69F'
const verdictBg   = (v) => v === 'INVEST' ? '#E4F5EC' : v === 'WATCH' ? '#FBF4E8' : v === 'SKIP' ? '#FBEAE8' : '#F5F7F4'

export default function UserDashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/user/dashboard')
      .then((res) => setDashboard(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  async function handleLogout() {
    await logout()
    toast.success('Logged out')
    navigate('/')
  }

  const card = { background: '#fff', border: '1px solid #E5E8E2', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(15,33,26,0.04)' }

  const quickLinks = [
    { label: 'Research', icon: <BookOpen size={18} />, path: '/', desc: 'Analyse any stock with AI' },
    { label: 'Portfolio', icon: <BarChart2 size={18} />, path: '/portfolio', desc: '13-metric portfolio health' },
    { label: 'Watchlist', icon: <Eye size={18} />, path: '/watchlist', desc: 'Track stocks + price alerts' },
    { label: 'Simulator', icon: <Zap size={18} />, path: '/simulator', desc: 'AI investment projections' },
    { label: 'History', icon: <Clock size={18} />, path: '/history', desc: 'Your research timeline' },
    { label: 'Saved Reports', icon: <Star size={18} />, path: '/reports', desc: 'Bookmarked analyses' },
  ]

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FBFBF8' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #E5E8E2', borderTopColor: '#0E8F5B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <div style={{ background: '#FBFBF8', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '20px 16px 80px' : '36px 24px 80px' }}>

        {/* Welcome header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'center' : 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <p style={{ fontSize: '0.8rem', color: '#9AA69F', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}
            </p>
            <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: isMobile ? '1.6rem' : '2rem', fontWeight: 700, color: '#0F211A', margin: 0 }}>
              {user?.name?.split(' ')[0]} 👋
            </h1>
            {!isMobile && <p style={{ color: '#5B6B63', fontSize: '0.875rem', marginTop: 6 }}>Here's your investment intelligence overview</p>}
          </motion.div>
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'none', border: '1px solid #E5E8E2', borderRadius: 10, cursor: 'pointer', color: '#9AA69F', fontSize: '0.8rem', fontWeight: 600 }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        {/* Stats row */}
        {dashboard?.stats && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Researches Done', value: dashboard.stats.researchCount, icon: <TrendingUp size={18} color="#0E8F5B" /> },
              { label: 'Portfolio Holdings', value: dashboard.stats.portfolioHoldings, icon: <BarChart2 size={18} color="#4A90D9" /> },
              { label: 'Watchlist Items', value: dashboard.stats.watchlistItems, icon: <Eye size={18} color="#B8862E" /> },
              { label: 'INVEST Verdicts', value: dashboard.stats.verdictDistribution?.INVEST || 0, icon: <Star size={18} color="#0E8F5B" /> },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <p style={{ fontSize: '0.72rem', color: '#9AA69F', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                  {s.icon}
                </div>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: '#0F211A', fontFamily: "'IBM Plex Mono',monospace", margin: 0 }}>{s.value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Verdict Distribution */}
        {dashboard?.stats?.verdictDistribution && (
          <div style={{ ...card, marginBottom: 32 }}>
            <p style={{ fontWeight: 700, color: '#0F211A', fontSize: '0.9rem', marginBottom: 16 }}>Research Verdict Distribution</p>
            <div style={{ display: 'flex', gap: 16 }}>
              {Object.entries(dashboard.stats.verdictDistribution).map(([v, count]) => {
                const total = Object.values(dashboard.stats.verdictDistribution).reduce((a, b) => a + b, 0)
                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={v} style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: verdictColor(v) }}>{v}</span>
                      <span style={{ fontSize: '0.75rem', color: '#9AA69F' }}>{count}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 99, background: '#F5F7F4', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.2 }}
                        style={{ height: '100%', borderRadius: 99, background: verdictColor(v) }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#9AA69F' }}>{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: 24 }}>
          {/* Quick Links */}
          <div>
            <p style={{ fontWeight: 700, color: '#0F211A', fontSize: '0.9rem', marginBottom: 16 }}>Quick Access</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              {quickLinks.map((l, i) => (
                <motion.div key={l.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={l.path} style={{ textDecoration: 'none' }}>
                    <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'border-color 0.2s', ':hover': { borderColor: '#0E8F5B' } }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E4F5EC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0E8F5B', flexShrink: 0 }}>{l.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, color: '#0F211A', fontSize: '0.875rem', margin: 0 }}>{l.label}</p>
                        <p style={{ color: '#9AA69F', fontSize: '0.75rem', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.desc}</p>
                      </div>
                      <ChevronRight size={14} color="#9AA69F" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Research */}
          <div>
            <p style={{ fontWeight: 700, color: '#0F211A', fontSize: '0.9rem', marginBottom: 16 }}>Recent Research</p>
            <div style={card}>
              {dashboard?.recentResearch?.length > 0 ? (
                dashboard.recentResearch.map((r, i) => (
                  <div key={r._id} style={{ padding: '10px 0', borderBottom: i < dashboard.recentResearch.length - 1 ? '1px solid #F5F7F4' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: '#0F211A', fontSize: '0.875rem', fontFamily: "'IBM Plex Mono',monospace" }}>{r.symbol}</span>
                      {r.verdict && (
                        <span style={{ background: verdictBg(r.verdict), color: verdictColor(r.verdict), borderRadius: 20, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700 }}>{r.verdict}</span>
                      )}
                    </div>
                    <p style={{ color: '#9AA69F', fontSize: '0.72rem', margin: 0 }}>
                      {r.generatedAt ? format(new Date(r.generatedAt), 'dd MMM yyyy') : ''}
                      {r.confidence ? ` · ${r.confidence}% confidence` : ''}
                    </p>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <p style={{ color: '#9AA69F', fontSize: '0.875rem' }}>No research yet</p>
                  <Link to="/" style={{ color: '#0E8F5B', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', display: 'block', marginTop: 8 }}>Search your first stock →</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
