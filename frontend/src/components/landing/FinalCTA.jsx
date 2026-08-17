import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight, GitBranch } from 'lucide-react'

const FOOTER_LINKS = {
  Product: ['Research', 'Portfolio', 'Watchlist', 'Scenario Lab', 'AI Chat'],
  Company: ['About', 'Privacy Policy', 'Terms of Service'],
  Resources: ['Learn', 'Analytics', 'Research History', 'Saved Reports'],
}

export default function FinalCTA() {
  const navigate = useNavigate()

  return (
    <>
      {/* CTA section */}
      <section style={{
        background: 'linear-gradient(135deg, #0F211A 0%, #0B3D28 50%, #0F211A 100%)',
        padding: '120px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background texture */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 800, height: 600, borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(14,143,91,0.12) 0%, transparent 70%)',
          }} />
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}>
            <defs>
              <pattern id="cta-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0E8F5B" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-grid)" />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'relative', zIndex: 10, maxWidth: 700, margin: '0 auto' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(14,143,91,0.15)', border: '1px solid rgba(14,143,91,0.3)', borderRadius: 99, marginBottom: 32 }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0E8F5B' }} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.72rem', color: 'rgba(14,143,91,0.9)', letterSpacing: '0.1em' }}>
              FREE TO START
            </span>
          </motion.div>

          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
            fontWeight: 600, lineHeight: 1.05,
            letterSpacing: '-0.03em', color: '#fff',
            margin: '0 0 24px',
          }}>
            Research smarter.<br />
            <em style={{ color: '#0E8F5B', fontStyle: 'italic' }}>Not harder.</em>
          </h2>

          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 48px' }}>
            Stop switching between 7 different tools. Start making investment decisions backed by real data and honest AI analysis.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button
              onClick={() => navigate('/signup')}
              whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(14,143,91,0.4)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '16px 36px',
                background: 'linear-gradient(135deg, #0E8F5B 0%, #0B6E46 100%)',
                border: 'none', borderRadius: 14,
                color: '#fff', fontWeight: 700, fontSize: '1rem',
                cursor: 'pointer', letterSpacing: '-0.01em',
                boxShadow: '0 4px 24px rgba(14,143,91,0.3)',
              }}
            >
              Start Researching <ArrowUpRight size={18} />
            </motion.button>

            <motion.button
              onClick={() => navigate('/research/AAPL')}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '16px 36px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 14,
                color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              Try with Apple →
            </motion.button>
          </div>

          <p style={{ marginTop: 28, fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
            No credit card required · Real data · Instant results
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#0A1810',
        padding: '64px 48px 40px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Top: logo + links */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(3, auto)', gap: 48, marginBottom: 64, alignItems: 'start' }}>
            {/* Brand */}
            <div>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#0E8F5B,#0B6E46)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, fontWeight: 600 }}>V</div>
                <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 20, color: '#fff' }}>Vestro</span>
                <span style={{ fontSize: '0.65rem', background: 'rgba(14,143,91,0.2)', color: '#0E8F5B', borderRadius: 6, padding: '2px 6px', fontWeight: 700 }}>AI</span>
              </Link>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, maxWidth: 260, margin: '0 0 20px' }}>
                AI investment research built on real financial data. Transparent verdicts for serious investors.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, textDecoration: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                  <GitBranch size={13} /> GitHub
                </a>
              </div>
            </div>

            {/* Links */}
            {Object.entries(FOOTER_LINKS).map(([cat, links]) => (
              <div key={cat}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                  {cat}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {links.map(link => (
                    <a key={link} href="#" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = '#fff'}
                      onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
              © 2026 Vestro AI. Not financial advice. For informational purposes only.
            </p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', margin: 0, fontFamily: "'IBM Plex Mono', monospace" }}>
              v2.0 · Real data · Honest AI
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
