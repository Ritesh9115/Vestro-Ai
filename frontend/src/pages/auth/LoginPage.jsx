import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', form)
      login(res.data.user, res.data.accessToken, res.data.refreshToken)
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`)
      navigate('/me')
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Login failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FBFBF8' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 420, padding: '0 24px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#0E8F5B,#0B6E46)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'IBM Plex Mono'", fontWeight: 700, fontSize: 16 }}>V</div>
            <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 22, color: '#0F211A' }}>Vestro</span>
          </Link>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.75rem', fontWeight: 600, color: '#0F211A', margin: '20px 0 8px' }}>Welcome back</h1>
          <p style={{ color: '#5B6B63', fontSize: '0.9rem' }}>Sign in to your Vestro account</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E5E8E2', borderRadius: 16, padding: 28, boxShadow: '0 4px 24px rgba(15,33,26,0.06)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0F211A', marginBottom: 6 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9AA69F' }} />
                <input type="email" placeholder="you@email.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required
                  style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #E5E8E2', borderRadius: 10, fontSize: '0.9rem', outline: 'none', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F211A' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: '#0E8F5B', textDecoration: 'none', fontWeight: 500 }}>Forgot?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9AA69F' }} />
                <input type={showPassword ? 'text' : 'password'} placeholder="Your password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required
                  style={{ width: '100%', padding: '10px 40px 10px 36px', border: '1px solid #E5E8E2', borderRadius: 10, fontSize: '0.9rem', outline: 'none', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9AA69F', padding: 0 }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px', background: loading ? '#9AA69F' : 'linear-gradient(135deg,#0E8F5B,#0B6E46)', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.925rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Inter,sans-serif' }}
            >
              {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={16} /></>}
            </motion.button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#5B6B63', fontSize: '0.875rem' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#0E8F5B', fontWeight: 600, textDecoration: 'none' }}>Create one free</Link>
        </p>
      </motion.div>
    </div>
  )
}
