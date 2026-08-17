import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Bell, BellOff, Eye, ExternalLink } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useIsMobile } from '../hooks/useIsMobile'

const verdictColor = (v) => v === 'INVEST' ? '#0E8F5B' : v === 'WATCH' ? '#B8862E' : v === 'SKIP' ? '#C8443A' : '#9AA69F'
const verdictBg   = (v) => v === 'INVEST' ? '#E4F5EC' : v === 'WATCH' ? '#FBF4E8' : v === 'SKIP' ? '#FBEAE8' : '#F5F7F4'

export default function WatchlistPage() {
  const isMobile = useIsMobile()
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ symbol: '', companyName: '', sector: '', exchange: '' })
  const [adding, setAdding] = useState(false)
  const [alertModal, setAlertModal] = useState(null) // { item }
  const [alertForm, setAlertForm] = useState({ alertPrice: '', alertType: 'above', alertEnabled: true })

  useEffect(() => { fetchWatchlist() }, [])

  async function fetchWatchlist() {
    try {
      const res = await api.get('/api/watchlist')
      setWatchlist(res.data.watchlist || [])
    } catch { toast.error('Failed to load watchlist') }
    finally { setLoading(false) }
  }

  async function addItem(e) {
    e.preventDefault()
    setAdding(true)
    try {
      await api.post('/api/watchlist', addForm)
      toast.success(`${addForm.symbol.toUpperCase()} added to watchlist!`)
      setAddForm({ symbol: '', companyName: '', sector: '', exchange: '' })
      setShowAdd(false)
      fetchWatchlist()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add')
    } finally { setAdding(false) }
  }

  async function removeItem(symbol) {
    if (!confirm(`Remove ${symbol} from watchlist?`)) return
    try {
      await api.delete(`/api/watchlist/${symbol}`)
      toast.success('Removed from watchlist')
      setWatchlist((prev) => prev.filter((w) => w.symbol !== symbol))
    } catch { toast.error('Failed to remove') }
  }

  async function saveAlert() {
    if (!alertModal) return
    try {
      await api.patch(`/api/watchlist/${alertModal.symbol}/alert`, {
        alertPrice: parseFloat(alertForm.alertPrice) || null,
        alertType: alertForm.alertType,
        alertEnabled: alertForm.alertEnabled,
      })
      toast.success('Alert saved!')
      setAlertModal(null)
      fetchWatchlist()
    } catch { toast.error('Failed to save alert') }
  }

  const card = { background: '#fff', border: '1px solid #E5E8E2', borderRadius: 14, boxShadow: '0 2px 8px rgba(15,33,26,0.04)' }

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #E5E8E2', borderTopColor: '#0E8F5B', borderRadius: '50%', animation: 'vspin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ background: '#FBFBF8', minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '20px 16px 80px' : '32px 24px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: isMobile ? '1.5rem' : '1.75rem', fontWeight: 600, color: '#0F211A', margin: 0 }}>Watchlist</h1>
            {!isMobile && <p style={{ color: '#5B6B63', fontSize: '0.875rem', marginTop: 4 }}>Track stocks and set price alerts</p>}
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAdd(!showAdd)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'linear-gradient(135deg,#0E8F5B,#0B6E46)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'Inter,sans-serif' }}>
            <Plus size={16} /> Add Symbol
          </motion.button>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ ...card, padding: 20, marginBottom: 20, overflow: 'hidden' }}>
              <form onSubmit={addItem}>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0F211A', marginBottom: 12 }}>Add to Watchlist</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, marginBottom: 12 }}>
                  {[['symbol', 'Symbol (e.g. RELIANCE.NS)'], ['companyName', 'Company Name'], ['sector', 'Sector'], ['exchange', 'Exchange']].map(([k, ph]) => (
                    <input key={k} placeholder={ph} value={addForm[k]} onChange={(e) => setAddForm({ ...addForm, [k]: e.target.value })}
                      required={k === 'symbol'}
                      style={{ padding: '9px 12px', border: '1px solid #E5E8E2', borderRadius: 8, fontSize: '0.875rem', outline: 'none', fontFamily: 'Inter,sans-serif' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" disabled={adding}
                    style={{ padding: '9px 20px', background: '#0E8F5B', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                    {adding ? 'Adding...' : 'Add'}
                  </button>
                  <button type="button" onClick={() => setShowAdd(false)}
                    style={{ padding: '9px 16px', background: 'none', border: '1px solid #E5E8E2', borderRadius: 8, cursor: 'pointer', color: '#5B6B63', fontSize: '0.875rem' }}>Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        {watchlist.length === 0 ? (
          <div style={{ ...card, padding: 60, textAlign: 'center' }}>
            <Eye size={40} color="#E5E8E2" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontWeight: 600, color: '#0F211A', marginBottom: 8 }}>Your watchlist is empty</p>
            <p style={{ color: '#9AA69F', fontSize: '0.875rem' }}>Add symbols to track them and receive price alerts</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {watchlist.map((item, i) => (
              <motion.div key={item._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{ ...card, padding: '16px', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: 12, flexDirection: isMobile ? 'column' : 'row' }}>
                {/* Symbol */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, color: '#0F211A', fontSize: '1rem', fontFamily: "'IBM Plex Mono',monospace" }}>{item.symbol}</span>
                    {item.lastVerdict && (
                      <span style={{ background: verdictBg(item.lastVerdict), color: verdictColor(item.lastVerdict), borderRadius: 20, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700 }}>{item.lastVerdict}</span>
                    )}
                    {item.alertEnabled && (
                      <span style={{ background: '#FBF4E8', color: '#B8862E', borderRadius: 20, padding: '2px 8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Bell size={10} /> Alert ON
                      </span>
                    )}
                  </div>
                  <p style={{ color: '#5B6B63', fontSize: '0.8rem', margin: 0 }}>
                    {item.companyName || '—'} {item.sector ? `· ${item.sector}` : ''} {item.exchange ? `· ${item.exchange}` : ''}
                  </p>
                  {item.alertEnabled && item.alertPrice && (
                    <p style={{ color: '#B8862E', fontSize: '0.75rem', margin: '4px 0 0' }}>
                      🔔 Alert when price goes {item.alertType} ₹{item.alertPrice?.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                  <Link to={`/?symbol=${item.symbol}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', background: '#F5F7F4', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#0F211A', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                    <ExternalLink size={12} /> Research
                  </Link>
                  <button onClick={() => { setAlertModal(item); setAlertForm({ alertPrice: item.alertPrice || '', alertType: item.alertType || 'above', alertEnabled: item.alertEnabled }) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', background: item.alertEnabled ? '#FBF4E8' : '#F5F7F4', border: 'none', borderRadius: 8, cursor: 'pointer', color: item.alertEnabled ? '#B8862E' : '#9AA69F', fontSize: '0.8rem', fontWeight: 600 }}>
                    {item.alertEnabled ? <Bell size={12} /> : <BellOff size={12} />} Alert
                  </button>
                  <button onClick={() => removeItem(item.symbol)}
                    style={{ padding: '7px', background: 'none', border: 'none', cursor: 'pointer', color: '#C8443A' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Modal */}
      <AnimatePresence>
        {alertModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,33,26,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
            onClick={() => setAlertModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(15,33,26,0.2)' }}>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: '#0F211A', marginBottom: 4 }}>Price Alert — {alertModal.symbol}</p>
              <p style={{ color: '#5B6B63', fontSize: '0.8rem', marginBottom: 20 }}>Get notified when the price crosses your target</p>

              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                {['above', 'below'].map((t) => (
                  <button key={t} onClick={() => setAlertForm({ ...alertForm, alertType: t })}
                    style={{ flex: 1, padding: 10, border: `2px solid ${alertForm.alertType === t ? '#0E8F5B' : '#E5E8E2'}`, borderRadius: 10, background: alertForm.alertType === t ? '#E4F5EC' : '#fff', color: alertForm.alertType === t ? '#0E8F5B' : '#9AA69F', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                    {t}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0F211A', marginBottom: 6 }}>Target Price (₹)</label>
                <input type="number" value={alertForm.alertPrice} onChange={(e) => setAlertForm({ ...alertForm, alertPrice: e.target.value })}
                  placeholder="e.g. 2500"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E8E2', borderRadius: 10, fontSize: '1rem', outline: 'none', fontFamily: "'IBM Plex Mono',monospace", boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <input type="checkbox" id="alertEnabled" checked={alertForm.alertEnabled} onChange={(e) => setAlertForm({ ...alertForm, alertEnabled: e.target.checked })}
                  style={{ accentColor: '#0E8F5B', width: 16, height: 16 }} />
                <label htmlFor="alertEnabled" style={{ fontSize: '0.875rem', color: '#0F211A', fontWeight: 500 }}>Enable this alert</label>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={saveAlert}
                  style={{ flex: 1, padding: 12, background: 'linear-gradient(135deg,#0E8F5B,#0B6E46)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>
                  Save Alert
                </button>
                <button onClick={() => setAlertModal(null)}
                  style={{ padding: '12px 16px', background: '#F5F7F4', border: 'none', borderRadius: 10, cursor: 'pointer', color: '#5B6B63' }}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
