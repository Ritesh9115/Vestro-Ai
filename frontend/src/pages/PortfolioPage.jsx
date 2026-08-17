import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, TrendingUp, TrendingDown, RefreshCw, PieChart, AlertTriangle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const SECTOR_COLORS = ['#0E8F5B', '#B8862E', '#4A90D9', '#C8443A', '#7B61FF', '#00BCD4', '#FF6B35', '#9C27B0']

function HealthRing({ score }) {
  const r = 52, circ = 2 * Math.PI * r
  const progress = ((score || 0) / 100) * circ
  const color = score >= 70 ? '#0E8F5B' : score >= 45 ? '#B8862E' : '#C8443A'
  return (
    <svg width={120} height={120} viewBox="0 0 120 120">
      <circle cx={60} cy={60} r={r} fill="none" stroke="#E5E8E2" strokeWidth={10} />
      <circle cx={60} cy={60} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${progress} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 60 60)" style={{ transition: 'stroke-dasharray 1s ease' }} />
      <text x={60} y={64} textAnchor="middle" fontSize={20} fontWeight={700} fill={color} fontFamily="Inter">{score ?? '—'}</text>
      <text x={60} y={78} textAnchor="middle" fontSize={10} fill="#9AA69F" fontFamily="Inter">/100</text>
    </svg>
  )
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ symbol: '', companyName: '', sector: '', shares: '', avgBuyPrice: '' })
  const [adding, setAdding] = useState(false)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [loadingPortfolio, setLoadingPortfolio] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedSuggestion, setExpandedSuggestion] = useState(null)

  useEffect(() => { fetchPortfolio() }, [])

  async function fetchPortfolio() {
    setLoadingPortfolio(true)
    try {
      const res = await api.get('/api/portfolio')
      setHoldings(res.data.holdings || [])
    } catch { toast.error('Failed to load portfolio') }
    finally { setLoadingPortfolio(false) }
  }

  async function fetchAnalytics() {
    setLoadingAnalytics(true)
    try {
      const res = await api.get('/api/portfolio/analytics')
      setAnalytics(res.data)
    } catch { toast.error('Failed to load analytics') }
    finally { setLoadingAnalytics(false) }
  }

  useEffect(() => { if (holdings.length > 0) fetchAnalytics() }, [holdings.length])

  async function addHolding(e) {
    e.preventDefault()
    setAdding(true)
    try {
      await api.post('/api/portfolio/holdings', {
        ...addForm,
        shares: parseFloat(addForm.shares),
        avgBuyPrice: parseFloat(addForm.avgBuyPrice),
      })
      toast.success('Holding added!')
      setAddForm({ symbol: '', companyName: '', sector: '', shares: '', avgBuyPrice: '' })
      setShowAddForm(false)
      fetchPortfolio()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add holding')
    } finally { setAdding(false) }
  }

  async function deleteHolding(id, symbol) {
    if (!confirm(`Remove ${symbol} from portfolio?`)) return
    try {
      await api.delete(`/api/portfolio/holdings/${id}`)
      toast.success('Holding removed')
      fetchPortfolio()
    } catch { toast.error('Failed to remove') }
  }

  const card = { background: '#fff', border: '1px solid #E5E8E2', borderRadius: 14, padding: 20 }

  const verdictColor = (v) => v === 'INVEST' ? '#0E8F5B' : v === 'WATCH' ? '#B8862E' : v === 'SKIP' ? '#C8443A' : '#9AA69F'

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'holdings', label: `Holdings (${holdings.length})` },
    { id: 'scenarios', label: 'Scenarios' },
    { id: 'ai', label: '✨ AI Insights' },
  ]

  const sectorData = analytics?.sectorExposure?.map((s, i) => ({ name: s.sector, value: s.percent, fill: SECTOR_COLORS[i % SECTOR_COLORS.length] })) || []

  return (
    <div style={{ background: '#FBFBF8', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.75rem', fontWeight: 600, color: '#0F211A', margin: 0 }}>Portfolio</h1>
            <p style={{ color: '#5B6B63', fontSize: '0.875rem', marginTop: 4 }}>Track, analyse and optimise your investments</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'linear-gradient(135deg,#0E8F5B,#0B6E46)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'Inter,sans-serif' }}>
            <Plus size={16} /> Add Holding
          </motion.button>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ ...card, marginBottom: 24, overflow: 'hidden' }}>
              <form onSubmit={addHolding}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0F211A', marginBottom: 16 }}>Add New Holding</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 16 }}>
                  {[['symbol', 'Symbol (e.g. TCS.NS)', 'text'], ['companyName', 'Company Name', 'text'], ['sector', 'Sector', 'text'], ['shares', 'Shares', 'number'], ['avgBuyPrice', 'Avg Buy Price (₹)', 'number']].map(([key, ph, type]) => (
                    <input key={key} type={type} placeholder={ph} value={addForm[key]}
                      onChange={(e) => setAddForm({ ...addForm, [key]: e.target.value })}
                      required={['symbol', 'shares', 'avgBuyPrice'].includes(key)}
                      style={{ padding: '9px 12px', border: '1px solid #E5E8E2', borderRadius: 8, fontSize: '0.875rem', outline: 'none', fontFamily: 'Inter,sans-serif' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" disabled={adding}
                    style={{ padding: '9px 20px', background: '#0E8F5B', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                    {adding ? 'Adding...' : 'Add Holding'}
                  </button>
                  <button type="button" onClick={() => setShowAddForm(false)}
                    style={{ padding: '9px 16px', background: 'none', border: '1px solid #E5E8E2', borderRadius: 8, cursor: 'pointer', fontSize: '0.875rem', color: '#5B6B63' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Portfolio Loading Skeleton */}
        <style>{`
          @keyframes shimmer { 0% { background-position: -1000px 0 } 100% { background-position: 1000px 0 } }
          .pf-skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%); background-size: 1000px 100%; animation: shimmer 1.4s infinite; border-radius: 10px; }
        `}</style>
        {(loadingPortfolio || loadingAnalytics) ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '10px 16px', background: '#E4F5EC', borderRadius: 10 }}>
              <div style={{ width: 16, height: 16, border: '2.5px solid #0E8F5B44', borderTopColor: '#0E8F5B', borderRadius: '50%', animation: 'vspin 0.7s linear infinite', flexShrink: 0 }} />
              <span style={{ fontSize: '0.85rem', color: '#0B6E46', fontWeight: 600 }}>{loadingPortfolio ? 'Loading your portfolio...' : 'Analysing your portfolio...'}</span>
              <style>{`@keyframes vspin{to{transform:rotate(360deg)}}`}</style>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 24 }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ background: '#fff', border: '1px solid #E5E8E2', borderRadius: 14, padding: 20 }}>
                  <div className="pf-skeleton" style={{ height: 11, width: '60%', marginBottom: 14 }} />
                  <div className="pf-skeleton" style={{ height: 28, width: '75%' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ background: '#fff', border: '1px solid #E5E8E2', borderRadius: 14, padding: 24, height: 170 }}>
                  <div className="pf-skeleton" style={{ height: 16, width: '45%', marginBottom: 18 }} />
                  <div className="pf-skeleton" style={{ height: 11, width: '90%', marginBottom: 10 }} />
                  <div className="pf-skeleton" style={{ height: 11, width: '70%', marginBottom: 10 }} />
                  <div className="pf-skeleton" style={{ height: 11, width: '80%' }} />
                </div>
              ))}
            </div>
          </div>
        ) : holdings.length === 0 ? (
          <div style={{ ...card, textAlign: 'center', padding: 60 }}>
            <PieChart size={40} color="#E5E8E2" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontWeight: 600, color: '#0F211A', marginBottom: 8 }}>Your portfolio is empty</p>
            <p style={{ color: '#9AA69F', fontSize: '0.875rem' }}>Add your first holding to start tracking your investments</p>
          </div>
        ) : (
          <>
            {/* Summary strip */}
            {analytics && !analytics.isEmpty && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 24 }}>
                {[
                  { label: 'Portfolio Value', value: analytics.summary?.totalValue ? `₹${analytics.summary.totalValue.toLocaleString('en-IN')}` : '—' },
                  { label: 'Total Gain/Loss', value: analytics.summary?.totalGain != null ? `${analytics.summary.totalGain >= 0 ? '+' : ''}₹${analytics.summary.totalGain.toLocaleString('en-IN')}` : '—', color: analytics.summary?.totalGain >= 0 ? '#0E8F5B' : '#C8443A' },
                  { label: 'Health Score', value: `${analytics.portfolioHealthScore ?? '—'}/100` },
                  { label: 'Diversification', value: `${analytics.diversificationScore ?? '—'}/100` },
                  { label: 'Expected CAGR', value: analytics.expectedCAGR ? `${analytics.expectedCAGR}%` : '—', color: '#0E8F5B' },
                  { label: 'Risk Score', value: `${analytics.portfolioRiskScore ?? '—'}/100`, color: analytics.portfolioRiskScore > 50 ? '#C8443A' : '#0E8F5B' },
                ].map((item) => (
                  <motion.div key={item.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={card}>
                    <p style={{ fontSize: '0.72rem', color: '#9AA69F', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{item.label}</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: item.color || '#0F211A', fontFamily: "'IBM Plex Mono',monospace" }}>{item.value}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid #E5E8E2', marginBottom: 24 }}>
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  style={{ padding: '12px 4px', marginRight: 20, fontSize: '0.875rem', fontWeight: 600, color: activeTab === t.id ? '#0F211A' : '#9AA69F', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === t.id ? '#0E8F5B' : 'transparent'}`, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Overview tab */}
            {activeTab === 'overview' && analytics && !analytics.isEmpty && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Health Ring */}
                <div style={card}>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F211A', marginBottom: 16 }}>Portfolio Health</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <HealthRing score={analytics.portfolioHealthScore} />
                    <div>
                      {[{ label: 'Diversification', val: `${analytics.diversificationScore}/100` }, { label: 'Risk Score', val: `${analytics.portfolioRiskScore}/100` }, { label: 'Holdings', val: analytics.summary?.holdingsCount }].map((r) => (
                        <div key={r.label} style={{ marginBottom: 8 }}>
                          <span style={{ fontSize: '0.75rem', color: '#9AA69F' }}>{r.label}: </span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F211A' }}>{r.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sector Pie */}
                <div style={card}>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F211A', marginBottom: 12 }}>Sector Exposure</p>
                  {sectorData.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <ResponsiveContainer width={120} height={120}>
                        <RechartsPie>
                          <Pie data={sectorData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={55}>
                            {sectorData.map((_, i) => <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
                        </RechartsPie>
                      </ResponsiveContainer>
                      <div style={{ flex: 1 }}>
                        {sectorData.slice(0, 5).map((s, i) => (
                          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: SECTOR_COLORS[i % SECTOR_COLORS.length] }} />
                            <span style={{ fontSize: '0.75rem', color: '#5B6B63', flex: 1 }}>{s.name}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F211A' }}>{s.value.toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : <p style={{ color: '#9AA69F', fontSize: '0.875rem' }}>No sector data</p>}
                </div>

                {/* Top Strong */}
                {analytics.topStrong?.length > 0 && (
                  <div style={card}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0E8F5B', marginBottom: 12 }}>💪 Top Strong Holdings</p>
                    {analytics.topStrong.map((h) => (
                      <div key={h.symbol} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F5F7F4' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F211A' }}>{h.symbol}</span>
                        <span style={{ fontSize: '0.8rem', color: '#0E8F5B', fontWeight: 600 }}>{h.lastHealthScore}/100</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Top Weak */}
                {analytics.topWeak?.length > 0 && (
                  <div style={card}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#C8443A', marginBottom: 12 }}>⚠️ Top Weak Holdings</p>
                    {analytics.topWeak.map((h) => (
                      <div key={h.symbol} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F5F7F4' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F211A' }}>{h.symbol}</span>
                        <span style={{ fontSize: '0.8rem', color: '#C8443A', fontWeight: 600 }}>{h.lastHealthScore}/100</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Holdings tab */}
            {activeTab === 'holdings' && (
              <div style={card}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr>
                        {['Symbol', 'Company', 'Sector', 'Shares', 'Avg Price', 'Verdict', 'Health', ''].map((h) => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#9AA69F', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E5E8E2' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((h) => (
                        <tr key={h._id} style={{ borderBottom: '1px solid #F5F7F4' }}>
                          <td style={{ padding: '12px', fontWeight: 700, color: '#0F211A', fontFamily: "'IBM Plex Mono',monospace" }}>{h.symbol}</td>
                          <td style={{ padding: '12px', color: '#5B6B63' }}>{h.companyName || '—'}</td>
                          <td style={{ padding: '12px', color: '#9AA69F', fontSize: '0.8rem' }}>{h.sector || '—'}</td>
                          <td style={{ padding: '12px', color: '#0F211A' }}>{h.shares}</td>
                          <td style={{ padding: '12px', fontFamily: "'IBM Plex Mono',monospace", color: '#0F211A' }}>₹{h.avgBuyPrice?.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '12px' }}>
                            {h.lastVerdict && <span style={{ background: `${verdictColor(h.lastVerdict)}18`, color: verdictColor(h.lastVerdict), borderRadius: 20, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>{h.lastVerdict}</span>}
                          </td>
                          <td style={{ padding: '12px', color: '#0F211A', fontWeight: 600 }}>{h.lastHealthScore ? `${h.lastHealthScore}/100` : '—'}</td>
                          <td style={{ padding: '12px' }}>
                            <button onClick={() => deleteHolding(h._id, h.symbol)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8443A', padding: 4 }}><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Scenarios tab */}
            {activeTab === 'scenarios' && analytics?.scenarios && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
                {[
                  { key: 'bull', label: '🐂 Bull Scenario', color: '#0E8F5B', bg: '#E4F5EC' },
                  { key: 'base', label: '📊 Base Scenario', color: '#4A90D9', bg: '#EBF3FB' },
                  { key: 'bear', label: '🐻 Bear Scenario', color: '#B8862E', bg: '#FBF4E8' },
                ].map(({ key, label, color, bg }) => {
                  const s = analytics.scenarios[key]
                  if (!s) return null
                  return (
                    <motion.div key={key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      style={{ background: '#fff', border: `1px solid ${bg}`, borderRadius: 14, padding: 20 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.95rem', color, marginBottom: 4 }}>{label}</p>
                      <p style={{ fontSize: '0.75rem', color: '#9AA69F', marginBottom: 16 }}>Expected CAGR: <strong style={{ color }}>{s.cagr}</strong></p>
                      {[['1 Year', s.return1Y], ['3 Years', s.return3Y], ['5 Years', s.return5Y]].map(([yr, val]) => (
                        <div key={yr} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F5F7F4' }}>
                          <span style={{ fontSize: '0.8rem', color: '#5B6B63' }}>{yr}</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color, fontFamily: "'IBM Plex Mono',monospace" }}>₹{val?.toLocaleString('en-IN') ?? '—'}</span>
                        </div>
                      ))}
                    </motion.div>
                  )
                })}

                {/* Rebalancing */}
                {analytics.rebalancingSuggestions?.length > 0 && (
                  <div style={{ ...card, gridColumn: '1/-1' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F211A', marginBottom: 12 }}>⚖️ Rebalancing Suggestions</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
                      {analytics.rebalancingSuggestions.map((s) => (
                        <div key={s.sector} style={{ padding: '10px 14px', borderRadius: 10, background: s.action === 'REDUCE' ? '#FBEAE8' : s.action === 'INCREASE' ? '#E4F5EC' : '#F5F7F4', border: `1px solid ${s.action === 'REDUCE' ? '#F3D4D0' : s.action === 'INCREASE' ? '#C8E6D8' : '#E5E8E2'}` }}>
                          <p style={{ fontWeight: 700, fontSize: '0.8rem', color: s.action === 'REDUCE' ? '#C8443A' : s.action === 'INCREASE' ? '#0E8F5B' : '#5B6B63', marginBottom: 4 }}>{s.action}</p>
                          <p style={{ fontSize: '0.85rem', color: '#0F211A', margin: 0 }}>{s.sector}</p>
                          <p style={{ fontSize: '0.75rem', color: '#9AA69F', margin: '4px 0 0' }}>{s.currentWeight.toFixed(1)}% → {s.targetWeight}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI Insights tab */}
            {activeTab === 'ai' && (
              <div>
                {loadingAnalytics ? (
                  <div style={{ textAlign: 'center', padding: 60 }}>
                    <div style={{ width: 32, height: 32, border: '3px solid #E5E8E2', borderTopColor: '#0E8F5B', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    <p style={{ color: '#9AA69F', fontSize: '0.875rem' }}>Analysing your portfolio with AI...</p>
                  </div>
                ) : analytics?.aiSuggestions ? (
                  <div>
                    <div style={{ ...card, marginBottom: 16, background: 'linear-gradient(135deg,#0E8F5B10,#0B6E4606)', border: '1px solid #C8E6D8' }}>
                      <p style={{ fontWeight: 700, color: '#0F211A', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles size={16} color="#0E8F5B" /> AI Assessment</p>
                      <p style={{ color: '#5B6B63', fontSize: '0.9rem', lineHeight: 1.6 }}>{analytics.aiSuggestions.overallAssessment}</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                      {[['Strengths', analytics.aiSuggestions.strengthSummary, '#0E8F5B'], ['Weaknesses', analytics.aiSuggestions.weaknessSummary, '#C8443A']].map(([title, text, color]) => (
                        <div key={title} style={card}>
                          <p style={{ fontWeight: 700, color, fontSize: '0.875rem', marginBottom: 8 }}>{title}</p>
                          <p style={{ color: '#5B6B63', fontSize: '0.875rem', lineHeight: 1.5 }}>{text}</p>
                        </div>
                      ))}
                    </div>
                    {analytics.aiSuggestions.suggestions?.map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                        style={{ ...card, marginBottom: 10, cursor: 'pointer' }} onClick={() => setExpandedSuggestion(expandedSuggestion === i ? null : i)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ background: s.priority === 'HIGH' ? '#FBEAE8' : s.priority === 'MEDIUM' ? '#FBF4E8' : '#E4F5EC', color: s.priority === 'HIGH' ? '#C8443A' : s.priority === 'MEDIUM' ? '#B8862E' : '#0E8F5B', borderRadius: 20, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700 }}>{s.priority}</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F211A' }}>{s.action}</span>
                            {s.symbol && <span style={{ fontSize: '0.8rem', color: '#9AA69F', fontFamily: "'IBM Plex Mono',monospace" }}>• {s.symbol}</span>}
                          </div>
                          {expandedSuggestion === i ? <ChevronUp size={16} color="#9AA69F" /> : <ChevronDown size={16} color="#9AA69F" />}
                        </div>
                        <AnimatePresence>
                          {expandedSuggestion === i && (
                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                              style={{ margin: '10px 0 0', color: '#5B6B63', fontSize: '0.85rem', lineHeight: 1.5 }}>{s.reason}</motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                    <p style={{ fontSize: '0.75rem', color: '#9AA69F', marginTop: 12, textAlign: 'center' }}>{analytics.aiSuggestions.disclaimer}</p>
                  </div>
                ) : (
                  <div style={{ ...card, textAlign: 'center', padding: 40 }}>
                    <button onClick={fetchAnalytics} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#0E8F5B', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', margin: '0 auto' }}>
                      <RefreshCw size={14} /> Generate AI Insights
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
