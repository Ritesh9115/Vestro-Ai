import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [darkBg, setDarkBg] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY
      setScrolled(y > 60)
      // Detect when user is in the dark (Journey) section
      const journeyEl = document.getElementById('journey-section')
      if (journeyEl) {
        const rect = journeyEl.getBoundingClientRect()
        setDarkBg(rect.top < 64 && rect.bottom > 64)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const textColor = darkBg && !scrolled ? '#ffffff' : '#0F211A'
  const subTextColor = darkBg && !scrolled ? 'rgba(255,255,255,0.6)' : '#5B6B63'

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 48px',
        height: 64,
        background: scrolled ? 'rgba(251,251,248,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(229,232,226,0.7)' : '1px solid transparent',
        transition: 'background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease',
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
        <div
          style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg,#0E8F5B,#0B6E46)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, fontWeight: 600,
          }}
        >V</div>
        <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 20, color: textColor, letterSpacing: '-0.01em', transition: 'color 0.4s' }}>Vestro</span>
        <span style={{ fontSize: '0.65rem', background: '#E4F5EC', color: '#0E8F5B', borderRadius: 6, padding: '2px 6px', fontWeight: 700, letterSpacing: '0.04em' }}>AI</span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
        {['Features', 'How it works', 'Compare'].map(label => (
          <span
            key={label}
            style={{ fontSize: '0.875rem', color: subTextColor, cursor: 'pointer', fontWeight: 500, transition: 'color 0.4s' }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Auth */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Link
          to="/login"
          style={{ fontSize: '0.875rem', color: subTextColor, textDecoration: 'none', fontWeight: 500, transition: 'color 0.4s' }}
        >
          Sign in
        </Link>
        <motion.button
          onClick={() => navigate('/signup')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 18px',
            background: 'linear-gradient(135deg, #0E8F5B 0%, #0B6E46 100%)',
            border: 'none', borderRadius: 10,
            color: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(14,143,91,0.25)',
          }}
        >
          Start Free <ArrowUpRight size={14} />
        </motion.button>
      </div>
    </motion.nav>
  )
}
