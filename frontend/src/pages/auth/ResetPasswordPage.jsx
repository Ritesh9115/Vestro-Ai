import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post(`/api/auth/reset-password/${token}`, { password })
      setDone(true)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed. Link may have expired.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FBFBF8' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 420, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.75rem', fontWeight: 600, color: '#0F211A', marginBottom: 8 }}>Set new password</h1>
          <p style={{ color: '#5B6B63', fontSize: '0.9rem' }}>Choose a strong password for your account</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #E5E8E2', borderRadius: 16, padding: 28, boxShadow: '0 4px 24px rgba(15,33,26,0.06)' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <CheckCircle size={40} color="#0E8F5B" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontWeight: 600, color: '#0F211A', marginBottom: 8 }}>Password reset!</p>
              <p style={{ color: '#5B6B63', fontSize: '0.875rem', marginBottom: 20 }}>All sessions have been invalidated for security.</p>
              <Link to="/login"
                style={{ display: 'inline-block', padding: '10px 24px', background: 'linear-gradient(135deg,#0E8F5B,#0B6E46)', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0F211A', marginBottom: 6 }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9AA69F' }} />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Min 8 chars, 1 uppercase, 1 number"
                    value={password} onChange={(e) => setPassword(e.target.value)} required
                    style={{ width: '100%', padding: '10px 40px 10px 36px', border: '1px solid #E5E8E2', borderRadius: 10, fontSize: '0.9rem', outline: 'none', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9AA69F', padding: 0 }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: 12, background: loading ? '#9AA69F' : 'linear-gradient(135deg,#0E8F5B,#0B6E46)', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.925rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
