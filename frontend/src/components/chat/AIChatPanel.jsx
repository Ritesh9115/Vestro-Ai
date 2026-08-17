import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, MessageCircle, RotateCcw, ChevronDown } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const PERSONAS = [
  { id: 'default',    label: '💬 General',   desc: 'Open-ended financial questions' },
  { id: 'beginner',  label: '🎓 Beginner',   desc: 'Plain English, no jargon' },
  { id: 'ca',        label: '📊 CA Mode',    desc: 'CA-level technical analysis' },
  { id: 'buffett',   label: '🧠 Buffett',    desc: 'Value investing lens' },
  { id: 'summarize', label: '📝 Summarize',  desc: '5-bullet executive summary' },
  { id: 'compare',   label: '⚖️ Compare',    desc: 'vs competitors' },
  { id: 'why_watch', label: '❓ Why this?',  desc: 'Explain the verdict step-by-step' },
]

function MessageBubble({ msg, i }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
      style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 14 }}>
      {!isUser && (
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#0E8F5B,#0B6E46)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 8, marginTop: 2 }}>
          <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 800, fontFamily: "'IBM Plex Mono'" }}>V</span>
        </div>
      )}
      <div style={{
        maxWidth: '80%',
        padding: '10px 14px',
        borderRadius: isUser ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
        background: isUser ? 'linear-gradient(135deg,#0E8F5B,#0B6E46)' : '#fff',
        color: isUser ? '#fff' : '#0F211A',
        fontSize: '0.85rem',
        lineHeight: 1.6,
        border: isUser ? 'none' : '1px solid #E5E8E2',
        boxShadow: '0 2px 8px rgba(15,33,26,0.06)',
        whiteSpace: 'pre-wrap',
      }}>
        {msg.content}
        {msg.persona && msg.persona !== 'default' && !isUser && (
          <p style={{ margin: '6px 0 0', fontSize: '0.65rem', color: '#9AA69F' }}>
            {PERSONAS.find((p) => p.id === msg.persona)?.label || ''}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default function AIChatPanel({ symbol, reportContext, isOpen, onClose }) {
  const { isAuthenticated } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [persona, setPersona] = useState('default')
  const [loading, setLoading] = useState(false)
  const [showPersonas, setShowPersonas] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Load existing chat history when symbol changes
  useEffect(() => {
    if (!isOpen || !symbol || !isAuthenticated) return
    api.get(`/api/chat/${symbol}`)
      .then((res) => {
        if (res.data.messages?.length > 0) setMessages(res.data.messages)
        else setMessages([{
          role: 'assistant',
          content: `Hi! I'm Vestro AI. I've loaded the research report for **${symbol}**.\n\nYou can ask me:\n• Why did it get this verdict?\n• What are the key risks?\n• How does it compare to competitors?\n\nOr click a persona button below for a specialized mode.`,
          persona: 'default',
        }])
      })
      .catch(() => {
        setMessages([{
          role: 'assistant',
          content: `Hi! I'm Vestro AI, ready to answer questions about **${symbol}**.\n\nSelect a persona or type your question below.`,
          persona: 'default',
        }])
      })
  }, [symbol, isOpen, isAuthenticated])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200)
  }, [isOpen])

  async function sendMessage(e, quickMessage) {
    e?.preventDefault()
    const text = quickMessage || input.trim()
    if (!text || loading) return
    if (!isAuthenticated) { toast.error('Please sign in to use AI Chat'); return }

    setMessages((prev) => [...prev, { role: 'user', content: text, persona }])
    setInput('')
    setLoading(true)

    try {
      const res = await api.post('/api/chat', { symbol, message: text, persona, reportContext })
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.message, persona }])
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI chat failed')
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', persona: 'default' }])
    } finally { setLoading(false) }
  }

  async function clearChat() {
    if (!confirm('Clear this chat history?')) return
    try {
      await api.delete(`/api/chat/${symbol}`)
      setMessages([{
        role: 'assistant',
        content: `Chat cleared. Ask me anything about **${symbol}**.`,
        persona: 'default',
      }])
      toast.success('Chat cleared')
    } catch { toast.error('Failed to clear chat') }
  }

  const selectedPersona = PERSONAS.find((p) => p.id === persona)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed', right: 24, bottom: 24, zIndex: 900,
            width: 400, height: 600,
            background: '#fff',
            border: '1px solid #E5E8E2',
            borderRadius: 20,
            boxShadow: '0 20px 60px rgba(15,33,26,0.18)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>

          {/* Header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0F2EF', display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#0E8F5B08,transparent)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#0E8F5B,#0B6E46)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MessageCircle size={15} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 800, color: '#0F211A', fontSize: '0.875rem', margin: 0 }}>Vestro AI Chat</p>
              <p style={{ color: '#9AA69F', fontSize: '0.7rem', margin: 0 }}>Context: {symbol} report loaded</p>
            </div>
            <button onClick={clearChat} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9AA69F', padding: 4 }} title="Clear chat">
              <RotateCcw size={13} />
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9AA69F', padding: 4 }}>
              <X size={15} />
            </button>
          </div>

          {/* Persona selector */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #F0F2EF' }}>
            <button onClick={() => setShowPersonas(!showPersonas)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: '#F5F7F4', border: 'none', borderRadius: 10, padding: '7px 12px', cursor: 'pointer' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F211A', flex: 1, textAlign: 'left' }}>{selectedPersona?.label}</span>
              <span style={{ fontSize: '0.7rem', color: '#9AA69F' }}>{selectedPersona?.desc}</span>
              <ChevronDown size={12} color="#9AA69F" style={{ transform: showPersonas ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            <AnimatePresence>
              {showPersonas && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden', marginTop: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {PERSONAS.map((p) => (
                      <button key={p.id} onClick={() => { setPersona(p.id); setShowPersonas(false) }}
                        style={{ padding: '8px 10px', border: `1.5px solid ${persona === p.id ? '#0E8F5B' : '#E5E8E2'}`, borderRadius: 9, background: persona === p.id ? '#E4F5EC' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.75rem', color: persona === p.id ? '#0E8F5B' : '#0F211A', margin: 0 }}>{p.label}</p>
                        <p style={{ fontSize: '0.65rem', color: '#9AA69F', margin: '2px 0 0' }}>{p.desc}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} i={i} />)}

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#0E8F5B,#0B6E46)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 800, fontFamily: "'IBM Plex Mono'" }}>V</span>
                </div>
                <div style={{ padding: '12px 14px', background: '#fff', border: '1px solid #E5E8E2', borderRadius: '4px 14px 14px 14px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map((i) => (
                      <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                        style={{ width: 7, height: 7, borderRadius: '50%', background: '#0E8F5B' }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick starters */}
          {messages.length <= 1 && !loading && (
            <div style={{ padding: '0 14px 10px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['Why this verdict?', 'Key risks?', 'Compare to peers', 'Is it overvalued?'].map((q) => (
                <button key={q} onClick={() => sendMessage(null, q)}
                  style={{ padding: '5px 10px', background: '#F5F7F4', border: '1px solid #E5E8E2', borderRadius: 20, cursor: 'pointer', color: '#5B6B63', fontSize: '0.72rem', fontWeight: 600 }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          {!isAuthenticated ? (
            <div style={{ padding: '12px 14px', borderTop: '1px solid #F0F2EF', textAlign: 'center' }}>
              <p style={{ color: '#9AA69F', fontSize: '0.8rem' }}>
                <a href="/login" style={{ color: '#0E8F5B', fontWeight: 600 }}>Sign in</a> to use AI Chat
              </p>
            </div>
          ) : (
            <form onSubmit={sendMessage} style={{ padding: '10px 14px', borderTop: '1px solid #F0F2EF', display: 'flex', gap: 8 }}>
              <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask about ${symbol}...`} disabled={loading}
                style={{ flex: 1, padding: '10px 12px', border: '1.5px solid #E5E8E2', borderRadius: 12, fontSize: '0.85rem', outline: 'none', fontFamily: 'Inter,sans-serif', background: loading ? '#F5F7F4' : '#fff' }} />
              <motion.button whileTap={{ scale: 0.9 }} type="submit" disabled={loading || !input.trim()}
                style={{ width: 40, height: 40, background: loading || !input.trim() ? '#E5E8E2' : 'linear-gradient(135deg,#0E8F5B,#0B6E46)', border: 'none', borderRadius: 12, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Send size={15} color={loading || !input.trim() ? '#9AA69F' : '#fff'} />
              </motion.button>
            </form>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
