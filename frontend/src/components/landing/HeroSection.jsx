import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, TrendingUp, ArrowDown } from 'lucide-react'

const WORDS = [
  { text: 'Research', italic: false },
  { text: 'before', italic: true, accent: true },
  { text: 'the', italic: false },
  { text: 'market', italic: false },
  { text: 'convinces', italic: false },
  { text: 'you.', italic: false },
]

const TICKERS = ['AAPL', 'TCS.NS', 'TSLA', 'RELIANCE.NS', 'MSFT', 'INFY.NS']

export default function HeroSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, -120])
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.65], [1, 0.96])

  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) navigate(`/research/${query.trim().toUpperCase()}`)
  }

  return (
    <section
      ref={ref}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 24px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glow — purposeful: signals "clarity" */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 800, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,143,91,0.07) 0%, rgba(228,245,236,0.15) 40%, transparent 70%)',
          filter: 'blur(2px)',
        }} />
        <div style={{
          position: 'absolute', top: '60%', left: '10%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,143,91,0.05) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', top: '30%', right: '8%',
          width: 250, height: 250, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(11,110,70,0.04) 0%, transparent 70%)',
        }} />
        {/* Subtle grid */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.025 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0F211A" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      <motion.div style={{ y, opacity, scale, position: 'relative', zIndex: 10, maxWidth: 760, width: '100%' }}>
        {/* Eyebrow label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 36 }}
        >
          <div style={{ width: 28, height: 1, background: '#0E8F5B', opacity: 0.6 }} />
          <span style={{
            fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase',
            fontWeight: 700, color: '#0E8F5B', fontFamily: "'IBM Plex Mono', monospace",
          }}>
            AI Investment Research
          </span>
          <div style={{ width: 28, height: 1, background: '#0E8F5B', opacity: 0.6 }} />
        </motion.div>

        {/* Headline — word-by-word reveal */}
        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 'clamp(3rem, 7vw, 5.5rem)',
          fontWeight: 600,
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          color: '#0F211A',
          margin: '0 0 28px',
        }}>
          {WORDS.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, delay: 0.35 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'inline-block', marginRight: '0.28em' }}
            >
              {word.accent
                ? <em style={{ fontStyle: 'italic', color: '#0E8F5B' }}>{word.text}</em>
                : word.text
              }
            </motion.span>
          ))}
        </h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: '#5B6B63', lineHeight: 1.65, maxWidth: 500, margin: '0 auto 52px' }}
        >
          Real financial data. AI-powered analysis.<br />
          One clear verdict:{' '}
          <strong style={{ color: '#0E8F5B' }}>INVEST</strong> ·{' '}
          <strong style={{ color: '#B8862E' }}>WATCH</strong> ·{' '}
          <strong style={{ color: '#C8443A' }}>SKIP</strong>
        </motion.p>

        {/* Search bar */}
        <motion.form
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.18, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSearch}
          style={{
            display: 'flex', gap: 0,
            maxWidth: 540, margin: '0 auto 28px',
            background: '#fff',
            border: '1px solid #E5E8E2',
            borderRadius: 16,
            padding: '6px 6px 6px 20px',
            boxShadow: '0 4px 40px rgba(15,33,26,0.08), 0 1px 4px rgba(15,33,26,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 12 }}>
            <Search size={17} color="#9AA69F" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search AAPL, TCS.NS, TSLA..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1, border: 'none', outline: 'none',
                fontSize: '0.95rem', color: '#0F211A', background: 'transparent',
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 22px',
              background: 'linear-gradient(135deg, #0E8F5B 0%, #0B6E46 100%)',
              border: 'none', borderRadius: 10,
              color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 12px rgba(14,143,91,0.3)',
            }}
          >
            Research <TrendingUp size={15} />
          </motion.button>
        </motion.form>

        {/* Quick access tickers */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <span style={{ fontSize: '0.75rem', color: '#9AA69F', marginRight: 4, alignSelf: 'center' }}>Try:</span>
          {TICKERS.map((ticker, i) => (
            <motion.button
              key={ticker}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.55 + i * 0.06 }}
              whileHover={{ scale: 1.06, background: '#E4F5EC', color: '#0E8F5B', borderColor: '#0E8F5B' }}
              onClick={() => navigate(`/research/${ticker}`)}
              style={{
                padding: '4px 12px', background: '#F5F7F4',
                border: '1px solid #E5E8E2', borderRadius: 99,
                fontSize: '0.76rem', fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 500, color: '#5B6B63', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {ticker}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator — purposeful: invites continuation of the story */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
        style={{
          position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}
      >
        <motion.div
          style={{
            width: 24, height: 40, borderRadius: 12, border: '1.5px solid #C5CBC3',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '6px 0',
          }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            style={{ width: 3, height: 8, borderRadius: 99, background: '#9AA69F' }}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
