import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, StarOff, Trash2, FileDown, Tag, Edit3, Filter, ChevronDown, ChevronUp, StickyNote } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const verdictColor = (v) => v === 'INVEST' ? '#0E8F5B' : v === 'WATCH' ? '#B8862E' : v === 'SKIP' ? '#C8443A' : '#9AA69F'
const verdictBg   = (v) => v === 'INVEST' ? '#E4F5EC' : v === 'WATCH' ? '#FBF4E8' : v === 'SKIP' ? '#FBEAE8' : '#F5F7F4'

export default function SavedReportsPage() {
  const [reports, setReports] = useState([])
  const [pagination, setPagination] = useState({})
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [verdictFilter, setVerdictFilter] = useState('')
  const [favoriteOnly, setFavoriteOnly] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [editingNotes, setEditingNotes] = useState(null) // { id, notes }

  useEffect(() => { fetchReports() }, [page, verdictFilter, favoriteOnly])

  async function fetchReports() {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (verdictFilter) params.verdict = verdictFilter
      if (favoriteOnly) params.favorite = 'true'
      const res = await api.get('/api/reports', { params })
      setReports(res.data.reports || [])
      setPagination(res.data.pagination || {})
    } catch { toast.error('Failed to load saved reports') }
    finally { setLoading(false) }
  }

  async function toggleFavorite(id, current) {
    try {
      await api.patch(`/api/reports/${id}`, { isFavorite: !current })
      setReports((prev) => prev.map((r) => r._id === id ? { ...r, isFavorite: !current } : r))
    } catch { toast.error('Failed to update') }
  }

  async function saveNotes(id, notes) {
    try {
      await api.patch(`/api/reports/${id}`, { notes })
      setReports((prev) => prev.map((r) => r._id === id ? { ...r, notes } : r))
      setEditingNotes(null)
      toast.success('Notes saved')
    } catch { toast.error('Failed to save notes') }
  }

  async function deleteReport(id) {
    if (!confirm('Delete this saved report?')) return
    try {
      await api.delete(`/api/reports/${id}`)
      toast.success('Report deleted')
      fetchReports()
    } catch { toast.error('Failed to delete') }
  }

  async function exportPDF(id, symbol) {
    try {
      const res = await api.get(`/api/reports/${id}/export`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `vestro-${symbol}-report.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Report downloaded!')
    } catch { toast.error('Export failed') }
  }

  const card = { background: '#fff', border: '1px solid #E5E8E2', borderRadius: 14 }

  if (loading && reports.length === 0) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #E5E8E2', borderTopColor: '#0E8F5B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ background: '#FBFBF8', minHeight: '100vh' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.75rem', fontWeight: 600, color: '#0F211A', margin: 0 }}>Saved Reports</h1>
          <p style={{ color: '#5B6B63', fontSize: '0.875rem', marginTop: 4 }}>Your bookmarked AI research analyses</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {['', 'INVEST', 'WATCH', 'SKIP'].map((v) => (
            <button key={v} onClick={() => { setVerdictFilter(v); setPage(1) }}
              style={{ padding: '7px 16px', border: `1.5px solid ${verdictFilter === v ? (verdictColor(v) || '#0E8F5B') : '#E5E8E2'}`, borderRadius: 20, background: verdictFilter === v ? verdictBg(v) : '#fff', color: verdictFilter === v ? (verdictColor(v) || '#0F211A') : '#5B6B63', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
              {v || 'All'}
            </button>
          ))}
          <button onClick={() => { setFavoriteOnly(!favoriteOnly); setPage(1) }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', border: `1.5px solid ${favoriteOnly ? '#B8862E' : '#E5E8E2'}`, borderRadius: 20, background: favoriteOnly ? '#FBF4E8' : '#fff', color: favoriteOnly ? '#B8862E' : '#5B6B63', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
            <Star size={12} /> Favorites
          </button>
          {pagination.total !== undefined && (
            <span style={{ marginLeft: 'auto', color: '#9AA69F', fontSize: '0.8rem' }}>{pagination.total} saved reports</span>
          )}
        </div>

        {reports.length === 0 ? (
          <div style={{ ...card, padding: 60, textAlign: 'center' }}>
            <Star size={40} color="#E5E8E2" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontWeight: 600, color: '#0F211A', marginBottom: 8 }}>No saved reports yet</p>
            <p style={{ color: '#9AA69F', fontSize: '0.875rem' }}>Save an AI research report to access it here any time</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reports.map((report, i) => (
              <motion.div key={report._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                style={{ ...card, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                  onClick={() => setExpandedId(expandedId === report._id ? null : report._id)}>
                  {/* Star */}
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(report._id, report.isFavorite) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: report.isFavorite ? '#B8862E' : '#E5E8E2', padding: 4, flexShrink: 0 }}>
                    <Star size={18} fill={report.isFavorite ? '#B8862E' : 'none'} />
                  </button>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, color: '#0F211A', fontSize: '0.95rem', fontFamily: "'IBM Plex Mono',monospace" }}>{report.symbol}</span>
                      {report.verdict && <span style={{ background: verdictBg(report.verdict), color: verdictColor(report.verdict), borderRadius: 20, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700 }}>{report.verdict}</span>}
                      {report.confidence && <span style={{ fontSize: '0.72rem', color: '#9AA69F' }}>{report.confidence}% confidence</span>}
                    </div>
                    <p style={{ color: '#9AA69F', fontSize: '0.75rem', margin: 0 }}>
                      {report.companyName || '—'} · Saved {report.savedAt ? format(new Date(report.savedAt), 'dd MMM yyyy') : ''}
                    </p>
                    {report.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
                        {report.tags.map((tag) => (
                          <span key={tag} style={{ background: '#F5F7F4', color: '#5B6B63', borderRadius: 6, padding: '1px 7px', fontSize: '0.68rem' }}>#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <button onClick={(e) => { e.stopPropagation(); exportPDF(report._id, report.symbol) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#F5F7F4', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#5B6B63', fontSize: '0.75rem', fontWeight: 600 }}>
                      <FileDown size={12} /> PDF
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteReport(report._id) }}
                      style={{ padding: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#C8443A' }}>
                      <Trash2 size={13} />
                    </button>
                    {expandedId === report._id ? <ChevronUp size={14} color="#9AA69F" /> : <ChevronDown size={14} color="#9AA69F" />}
                  </div>
                </div>

                {/* Expanded: notes editor */}
                <AnimatePresence>
                  {expandedId === report._id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      style={{ borderTop: '1px solid #F5F7F4', padding: '16px 20px', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <StickyNote size={14} color="#9AA69F" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F211A' }}>Your Notes</span>
                        <button onClick={() => setEditingNotes({ id: report._id, notes: report.notes || '' })}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9AA69F', padding: 2 }}>
                          <Edit3 size={12} />
                        </button>
                      </div>
                      {editingNotes?.id === report._id ? (
                        <div>
                          <textarea value={editingNotes.notes} onChange={(e) => setEditingNotes({ ...editingNotes, notes: e.target.value })}
                            rows={4}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E8E2', borderRadius: 10, fontSize: '0.85rem', outline: 'none', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box', resize: 'vertical' }}
                            placeholder="Add your investment notes, thesis, or reminders..." />
                          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <button onClick={() => saveNotes(report._id, editingNotes.notes)}
                              style={{ padding: '7px 16px', background: '#0E8F5B', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Save Notes</button>
                            <button onClick={() => setEditingNotes(null)}
                              style={{ padding: '7px 12px', background: '#F5F7F4', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#5B6B63', fontSize: '0.8rem' }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <p style={{ color: report.notes ? '#5B6B63' : '#9AA69F', fontSize: '0.85rem', lineHeight: 1.6, margin: 0, fontStyle: report.notes ? 'normal' : 'italic' }}>
                          {report.notes || 'No notes yet. Click ✏️ to add.'}
                        </p>
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
