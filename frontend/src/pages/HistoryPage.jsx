import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Filter, Trash2, ChevronDown, ChevronUp, TrendingUp, ArrowRight, Search } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import ResearchTimeline from '../components/timeline/ResearchTimeline'

const verdictColor = (v) => v === 'INVEST' ? '#0E8F5B' : v === 'WATCH' ? '#B8862E' : v === 'SKIP' ? '#C8443A' : '#9AA69F'
const verdictBg   = (v) => v === 'INVEST' ? '#E4F5EC' : v === 'WATCH' ? '#FBF4E8' : v === 'SKIP' ? '#FBEAE8' : '#F5F7F4'

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [pagination, setPagination] = useState({})
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [verdictFilter, setVerdictFilter] = useState('')
  const [timelineSymbol, setTimelineSymbol] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [searchSymbol, setSearchSymbol] = useState('')

  useEffect(() => { fetchHistory() }, [page, verdictFilter])

  async function fetchHistory() {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (verdictFilter) params.verdict = verdictFilter
      const res = await api.get('/api/history', { params })
      setHistory(res.data.history || [])
      setPagination(res.data.pagination || {})
    } catch { toast.error('Failed to load history') }
    finally { setLoading(false) }
  }

  async function deleteEntry(id) {
    if (!confirm('Delete this research entry?')) return
    try {
      await api.delete(`/api/history/${id}`)
      toast.success('Entry deleted')
      fetchHistory()
    } catch { toast.error('Failed to delete') }
  }

  const card = { background: '#fff', border: '1px solid #E5E8E2', borderRadius: 14 }

  return (
    <div style={{ background: '#FBFBF8', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.75rem', fontWeight: 600, color: '#0F211A', margin: 0 }}>Research History</h1>
            <p style={{ color: '#5B6B63', fontSize: '0.875rem', marginTop: 4 }}>Every stock you've analysed — with AI-explained changes</p>
          </div>
          {/* Timeline symbol search */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9AA69F' }} />
              <input placeholder="Timeline: RELIANCE.NS" value={searchSymbol} onChange={(e) => setSearchSymbol(e.target.value)}
                style={{ padding: '9px 12px 9px 30px', border: '1px solid #E5E8E2', borderRadius: 10, fontSize: '0.8rem', outline: 'none', fontFamily: 'Inter,sans-serif', width: 200 }} />
            </div>
            <button onClick={() => { if (searchSymbol.trim()) setTimelineSymbol(searchSymbol.trim().toUpperCase()) }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'linear-gradient(135deg,#0E8F5B,#0B6E46)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
              <TrendingUp size={14} /> View Timeline
            </button>
          </div>
        </div>

        {/* Timeline Panel */}
        <AnimatePresence>
          {timelineSymbol && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ marginBottom: 24, overflow: 'hidden' }}>
              <ResearchTimeline symbol={timelineSymbol} onClose={() => setTimelineSymbol(null)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {['', 'INVEST', 'WATCH', 'SKIP'].map((v) => (
            <button key={v} onClick={() => { setVerdictFilter(v); setPage(1) }}
              style={{ padding: '7px 16px', border: `1.5px solid ${verdictFilter === v ? verdictColor(v || '#0E8F5B') : '#E5E8E2'}`, borderRadius: 20, background: verdictFilter === v ? verdictBg(v) : '#fff', color: verdictFilter === v ? verdictColor(v || '#0E8F5B') : '#5B6B63', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
              {v || 'All'}
            </button>
          ))}
          {pagination.total !== undefined && (
            <span style={{ marginLeft: 'auto', color: '#9AA69F', fontSize: '0.8rem', alignSelf: 'center' }}>
              {pagination.total} research entries
            </span>
          )}
        </div>

        {/* History list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #E5E8E2', borderTopColor: '#0E8F5B', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : history.length === 0 ? (
          <div style={{ ...card, padding: 60, textAlign: 'center' }}>
            <Clock size={40} color="#E5E8E2" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontWeight: 600, color: '#0F211A', marginBottom: 8 }}>No research history yet</p>
            <p style={{ color: '#9AA69F', fontSize: '0.875rem' }}>Every stock you research will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {history.map((entry, i) => (
              <motion.div key={entry._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                style={{ ...card, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                  onClick={() => setExpandedId(expandedId === entry._id ? null : entry._id)}>
                  {/* Left: symbol + metadata */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, color: '#0F211A', fontSize: '0.95rem', fontFamily: "'IBM Plex Mono',monospace" }}>{entry.symbol}</span>
                      {entry.verdict && (
                        <span style={{ background: verdictBg(entry.verdict), color: verdictColor(entry.verdict), borderRadius: 20, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700 }}>{entry.verdict}</span>
                      )}
                      {entry.confidence && <span style={{ fontSize: '0.72rem', color: '#9AA69F' }}>{entry.confidence}% confidence</span>}
                    </div>
                    <p style={{ color: '#9AA69F', fontSize: '0.75rem', margin: 0 }}>
                      {entry.companyName || '—'} · {entry.sector || '—'} · {entry.generatedAt ? format(new Date(entry.generatedAt), 'dd MMM yyyy, HH:mm') : ''}
                    </p>
                  </div>

                  {/* Health score */}
                  {entry.healthScore != null && (
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <p style={{ fontSize: '1.1rem', fontWeight: 800, color: entry.healthScore >= 70 ? '#0E8F5B' : entry.healthScore >= 45 ? '#B8862E' : '#C8443A', fontFamily: "'IBM Plex Mono',monospace", margin: 0 }}>{entry.healthScore}</p>
                      <p style={{ fontSize: '0.68rem', color: '#9AA69F', margin: 0 }}>Health</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={(e) => { e.stopPropagation(); setTimelineSymbol(entry.symbol) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#F5F7F4', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#5B6B63', fontSize: '0.75rem', fontWeight: 600 }}>
                      <TrendingUp size={11} /> Timeline
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteEntry(entry._id) }}
                      style={{ padding: '5px', background: 'none', border: 'none', cursor: 'pointer', color: '#C8443A' }}>
                      <Trash2 size={13} />
                    </button>
                    {expandedId === entry._id ? <ChevronUp size={14} color="#9AA69F" /> : <ChevronDown size={14} color="#9AA69F" />}
                  </div>
                </div>

                {/* Expanded: dimension scores + top reasons */}
                <AnimatePresence>
                  {expandedId === entry._id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      style={{ borderTop: '1px solid #F5F7F4', padding: '16px 20px', overflow: 'hidden' }}>
                      {entry.dimensionScores && (
                        <div style={{ marginBottom: 14 }}>
                          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9AA69F', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>9-Dimension Scores</p>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 8 }}>
                            {Object.entries(entry.dimensionScores).map(([dim, score]) => (
                              <div key={dim} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F5F7F4', borderRadius: 8, padding: '6px 10px' }}>
                                <span style={{ fontSize: '0.72rem', color: '#5B6B63', fontWeight: 500, textTransform: 'capitalize' }}>{dim.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: score >= 70 ? '#0E8F5B' : score >= 45 ? '#B8862E' : '#C8443A', fontFamily: "'IBM Plex Mono',monospace" }}>{score}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {entry.topReasons?.length > 0 && (
                        <div>
                          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9AA69F', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Top Reasons</p>
                          {entry.topReasons.map((r, i) => (
                            <p key={i} style={{ margin: '0 0 4px', fontSize: '0.8rem', color: '#5B6B63' }}>• {r}</p>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}
              style={{ padding: '8px 16px', border: '1px solid #E5E8E2', borderRadius: 8, background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', color: page <= 1 ? '#9AA69F' : '#0F211A', fontWeight: 600, fontSize: '0.875rem' }}>
              ← Previous
            </button>
            <span style={{ padding: '8px 16px', fontSize: '0.875rem', color: '#5B6B63', alignSelf: 'center' }}>Page {page} of {pagination.pages}</span>
            <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}
              style={{ padding: '8px 16px', border: '1px solid #E5E8E2', borderRadius: 8, background: '#fff', cursor: page >= pagination.pages ? 'not-allowed' : 'pointer', color: page >= pagination.pages ? '#9AA69F' : '#0F211A', fontWeight: 600, fontSize: '0.875rem' }}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
