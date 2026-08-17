import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const verdictColor = (v) => v === 'INVEST' ? '#0E8F5B' : v === 'WATCH' ? '#B8862E' : v === 'SKIP' ? '#C8443A' : '#9AA69F'
const verdictBg   = (v) => v === 'INVEST' ? '#E4F5EC' : v === 'WATCH' ? '#FBF4E8' : v === 'SKIP' ? '#FBEAE8' : '#F5F7F4'

function VerdictIcon({ verdict }) {
  const size = 16
  if (verdict === 'INVEST') return <TrendingUp size={size} color="#0E8F5B" />
  if (verdict === 'SKIP')   return <TrendingDown size={size} color="#C8443A" />
  return <Minus size={size} color="#B8862E" />
}

function DimensionBars({ scores }) {
  if (!scores) return null
  const dims = Object.entries(scores)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 16px', marginTop: 10 }}>
      {dims.map(([key, val]) => (
        <div key={key}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ fontSize: '0.65rem', color: '#9AA69F', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: val >= 70 ? '#0E8F5B' : val >= 45 ? '#B8862E' : '#C8443A' }}>{val}</span>
          </div>
          <div style={{ height: 4, borderRadius: 99, background: '#F5F7F4', overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 0.6 }}
              style={{ height: '100%', borderRadius: 99, background: val >= 70 ? '#0E8F5B' : val >= 45 ? '#B8862E' : '#C8443A' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ResearchTimeline({ symbol, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedIndex, setExpandedIndex] = useState(null)

  useEffect(() => {
    if (!symbol) return
    setLoading(true)
    setData(null)
    api.get(`/api/history/timeline/${symbol}`)
      .then((res) => setData(res.data))
      .catch(() => toast.error(`Failed to load timeline for ${symbol}`))
      .finally(() => setLoading(false))
  }, [symbol])

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E8E2', borderRadius: 16, padding: '20px 24px', boxShadow: '0 4px 24px rgba(15,33,26,0.08)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} color="#0E8F5B" />
            <span style={{ fontWeight: 800, color: '#0F211A', fontSize: '1.05rem', fontFamily: "'IBM Plex Mono',monospace" }}>{symbol}</span>
            {data?.companyName && <span style={{ color: '#9AA69F', fontSize: '0.8rem' }}>— {data.companyName}</span>}
          </div>
          <p style={{ color: '#9AA69F', fontSize: '0.75rem', marginTop: 2 }}>Research Timeline ⭐</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {data && (
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { label: 'Researches', value: data.totalResearches },
                { label: 'Verdict Changes', value: data.verdictChanges },
                { label: 'Latest', value: data.latestVerdict },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1rem', fontWeight: 800, color: s.label === 'Latest' ? verdictColor(s.value) : '#0F211A', fontFamily: "'IBM Plex Mono',monospace", margin: 0 }}>{s.value ?? '—'}</p>
                  <p style={{ fontSize: '0.65rem', color: '#9AA69F', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}
          {onClose && (
            <button onClick={onClose} style={{ background: '#F5F7F4', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer', color: '#9AA69F', display: 'flex' }}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ width: 28, height: 28, border: '3px solid #E5E8E2', borderTopColor: '#0E8F5B', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: '#9AA69F', fontSize: '0.8rem' }}>Loading research timeline...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && data?.timeline?.length === 0 && (
        <p style={{ color: '#9AA69F', fontSize: '0.875rem', textAlign: 'center', padding: '24px 0' }}>
          No research history for <strong>{symbol}</strong>. Research this stock to start your timeline.
        </p>
      )}

      {/* Timeline */}
      {!loading && data?.timeline?.length > 0 && (
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: 19, top: 24, bottom: 0, width: 2, background: 'linear-gradient(to bottom,#0E8F5B,#E5E8E2)', zIndex: 0 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {data.timeline.map((entry, i) => {
              const isLast = i === data.timeline.length - 1
              const hasChange = entry.changeExplanation != null
              const isExpanded = expandedIndex === i

              return (
                <motion.div key={entry._id || i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  style={{ display: 'flex', gap: 16, paddingBottom: isLast ? 0 : 20, position: 'relative', zIndex: 1 }}>
                  {/* Node */}
                  <div style={{ flexShrink: 0, width: 40, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: verdictBg(entry.verdict),
                      border: `2.5px solid ${verdictColor(entry.verdict)}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: isLast ? `0 0 0 4px ${verdictColor(entry.verdict)}22` : 'none',
                      transition: 'box-shadow 0.3s',
                    }}>
                      <VerdictIcon verdict={entry.verdict} />
                    </div>
                  </div>

                  {/* Card */}
                  <div style={{ flex: 1, background: isLast ? `${verdictColor(entry.verdict)}06` : '#FAFBF9', border: `1px solid ${isLast ? verdictColor(entry.verdict) + '30' : '#F0F2EF'}`, borderRadius: 12, padding: '12px 16px', marginBottom: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }}
                      onClick={() => setExpandedIndex(isExpanded ? null : i)}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <span style={{ background: verdictBg(entry.verdict), color: verdictColor(entry.verdict), borderRadius: 20, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 800 }}>{entry.verdict}</span>
                          {entry.confidence != null && <span style={{ fontSize: '0.72rem', color: '#9AA69F' }}>{entry.confidence}% confidence</span>}
                          {entry.healthScore != null && <span style={{ fontSize: '0.72rem', color: '#9AA69F' }}>· Health {entry.healthScore}/100</span>}
                          {isLast && <span style={{ fontSize: '0.68rem', background: '#0E8F5B', color: '#fff', borderRadius: 20, padding: '1px 7px', fontWeight: 700 }}>LATEST</span>}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#9AA69F', margin: 0 }}>
                          {entry.generatedAt ? format(new Date(entry.generatedAt), 'dd MMM yyyy, h:mm a') : ''}
                        </p>
                      </div>
                      {isExpanded ? <ChevronUp size={14} color="#9AA69F" /> : <ChevronDown size={14} color="#9AA69F" />}
                    </div>

                    {/* AI Change Explanation */}
                    {hasChange && (
                      <div style={{ marginTop: 10, padding: '8px 12px', background: 'linear-gradient(135deg,#7B61FF10,#4A90D910)', border: '1px solid #7B61FF30', borderRadius: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <Sparkles size={11} color="#7B61FF" />
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7B61FF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Explains This Change</span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#5B6B63', margin: 0, lineHeight: 1.5 }}>{entry.changeExplanation}</p>
                      </div>
                    )}

                    {/* Expanded: dimension scores + reasons */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: 'hidden' }}>
                          <div style={{ marginTop: 12 }}>
                            {entry.topReasons?.length > 0 && (
                              <div style={{ marginBottom: 10 }}>
                                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9AA69F', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Top Reasons</p>
                                {entry.topReasons.map((r, ri) => (
                                  <p key={ri} style={{ margin: '0 0 3px', fontSize: '0.78rem', color: '#5B6B63' }}>• {r}</p>
                                ))}
                              </div>
                            )}
                            {entry.keyRisks?.length > 0 && (
                              <div style={{ marginBottom: 10 }}>
                                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#C8443A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Key Risks</p>
                                {entry.keyRisks.map((r, ri) => (
                                  <p key={ri} style={{ margin: '0 0 3px', fontSize: '0.78rem', color: '#5B6B63' }}>• {r}</p>
                                ))}
                              </div>
                            )}
                            <DimensionBars scores={entry.dimensionScores} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
