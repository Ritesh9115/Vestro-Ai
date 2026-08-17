import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/auth/forgot-password', { email })
      setSent(true)
    } catch {
      toast.error('Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FBFBF8' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 420, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.75rem', fontWeight: 600, color: '#0F211A', marginBottom: 8 }}>Reset password</h1>
          <p style={{ color: '#5B6B63', fontSize: '0.9rem' }}>We'll send a reset link to your email</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E5E8E2', borderRadius: 16, padding: 28, boxShadow: '0 4px 24px rgba(15,33,26,0.06)' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <CheckCircle size={40} color="#0E8F5B" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontWeight: 600, color: '#0F211A', marginBottom: 8 }}>Check your inbox</p>
              <p style={{ color: '#5B6B63', fontSize: '0.875rem' }}>If an account exists for {email}, a reset link has been sent.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0F211A', marginBottom: 6 }}>Email address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9AA69F' }} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required
                    style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #E5E8E2', borderRadius: 10, fontSize: '0.9rem', outline: 'none', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box' }} />
                </div>
              </div>
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: 12, background: loading ? '#9AA69F' : 'linear-gradient(135deg,#0E8F5B,#0B6E46)', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.925rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#5B6B63', fontSize: '0.875rem', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
