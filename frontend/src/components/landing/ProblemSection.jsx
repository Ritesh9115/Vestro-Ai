import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const PLATFORMS = [
  { name: 'Yahoo Finance', color: '#6001d2' },
  { name: 'Moneycontrol', color: '#004A8F' },
  { name: 'Screener.in', color: '#1a3a5c' },
  { name: 'Tickertape', color: '#2b5be0' },
  { name: 'ChatGPT', color: '#10a37f' },
  { name: 'Reddit', color: '#ff4500' },
  { name: 'Economic Times', color: '#d52b1e' },
  { name: 'TradingView', color: '#1848cc' },
]

// Scattered positions for the chaos layout
const SCATTER = [
  { x: '-38%', y: '-30%' },
  { x: '28%',  y: '-38%' },
  { x: '-52%', y: '5%'   },
  { x: '45%',  y: '-8%'  },
  { x: '-20%', y: '32%'  },
  { x: '35%',  y: '28%'  },
  { x: '-44%', y: '50%'  },
  { x: '18%',  y: '50%'  },
]

export default function ProblemSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  // Phase 0→0.35: chaos appears; 0.35→0.65: converge; 0.65→1: Vestro emerges
  const chaosOpacity = useTransform(scrollYProgress, [0.05, 0.25, 0.55, 0.68], [0, 1, 1, 0])
  const vestroOpacity = useTransform(scrollYProgress, [0.55, 0.72], [0, 1])
  const vestroY = useTransform(scrollYProgress, [0.55, 0.72], [30, 0])
  const headingY = useTransform(scrollYProgress, [0.0, 0.3], [40, 0])
  const headingOpacity = useTransform(scrollYProgress, [0.0, 0.2], [0, 1])

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        minHeight: '200vh',
        background: 'linear-gradient(to bottom, #FBFBF8 0%, #F4F0E8 40%, #FBFBF8 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Sticky container drives the scroll-based story */}
      <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>

        {/* Opening statement */}
        <motion.div
          style={{ y: headingY, opacity: headingOpacity, textAlign: 'center', maxWidth: 640, position: 'relative', zIndex: 10 }}
        >
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.8rem', color: '#9AA69F', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
            The problem
          </p>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 600, lineHeight: 1.1,
            letterSpacing: '-0.025em', color: '#0F211A',
            margin: '0 0 20px',
          }}>
            The average investor<br />
            uses <em style={{ color: '#C8443A', fontStyle: 'italic' }}>7 different tools</em><br />
            before making a decision.
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#5B6B63', lineHeight: 1.65, maxWidth: 480, margin: '0 auto' }}>
            Each one tells a different story. None of them talk to each other.
            The result? Analysis paralysis at the worst possible moment.
          </p>
        </motion.div>

        {/* Scattered platform logos — represent chaos */}
        <motion.div
          style={{ opacity: chaosOpacity, position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          {PLATFORMS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(calc(-50% + ${SCATTER[i].x}), calc(-50% + ${SCATTER[i].y}))`,
                background: '#fff',
                border: '1px solid #E5E8E2',
                borderRadius: 10,
                padding: '9px 16px',
                boxShadow: '0 2px 16px rgba(15,33,26,0.07)',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{
                fontSize: '0.8rem', fontWeight: 700,
                color: p.color, fontFamily: "'Inter', sans-serif",
              }}>
                {p.name}
              </span>
            </motion.div>
          ))}

          {/* Chaos connectors — thin lines between them */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }}>
            {SCATTER.slice(0, 6).map((s, i) => {
              const next = SCATTER[(i + 1) % 6]
              return (
                <line
                  key={i}
                  x1={`calc(50% + ${s.x})`} y1={`calc(50% + ${s.y})`}
                  x2={`calc(50% + ${next.x})`} y2={`calc(50% + ${next.y})`}
                  stroke="#0F211A" strokeWidth="1" strokeDasharray="4 4"
                />
              )
            })}
          </svg>
        </motion.div>

        {/* Vestro — the resolution */}
        <motion.div
          style={{
            opacity: vestroOpacity, y: vestroY,
            position: 'absolute', zIndex: 20,
            textAlign: 'center', pointerEvents: 'none',
          }}
        >
          <motion.div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 16,
              background: 'linear-gradient(135deg, #0F211A 0%, #0B3D28 100%)',
              borderRadius: 20, padding: '28px 48px',
              boxShadow: '0 24px 80px rgba(15,33,26,0.25), 0 0 0 1px rgba(255,255,255,0.06)',
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #0E8F5B, #0B6E46)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 700, color: '#fff',
            }}>V</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: '1.8rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>
                Vestro AI
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>
                ONE PLATFORM · ONE DECISION
              </div>
            </div>
          </motion.div>
          <motion.p
            style={{ color: '#5B6B63', fontSize: '1rem', marginTop: 24, fontStyle: 'italic' }}
          >
            Everything you need. Nothing you don't.
          </motion.p>
        </motion.div>

      </div>
    </section>
  )
}
