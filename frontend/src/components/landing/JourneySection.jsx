import { useRef } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { useState } from 'react'
import {
  Search, MapPin, FileText, Calculator,
  Heart, Brain, TrendingUp, TrendingDown, CheckCircle,
} from 'lucide-react'

const STEPS = [
  {
    num: '01',
    title: 'Searching Company',
    description: 'Resolving your query against global ticker databases across 50+ exchanges.',
    icon: Search,
    output: '> Querying global symbol database...\n> Matching "AAPL" → Apple Inc.\n> Exchange: NASDAQ · Sector: Technology',
    color: '#0E8F5B',
  },
  {
    num: '02',
    title: 'Finding Symbol',
    description: 'Confirming the canonical ticker symbol and exchange listing.',
    icon: MapPin,
    output: '> Symbol confirmed: AAPL\n> Primary listing: NASDAQ\n> Secondary: LSE (AAPL.L)\n> Currency: USD',
    color: '#0E8F5B',
  },
  {
    num: '03',
    title: 'Collecting Financials',
    description: 'Fetching income statements, balance sheets, and cash flow across 5+ years.',
    icon: FileText,
    output: '> Fetching income statement... ✓\n> Fetching balance sheet... ✓\n> Fetching cash flow statement... ✓\n> 5-year historical data loaded',
    color: '#0B6E46',
  },
  {
    num: '04',
    title: 'Calculating Metrics',
    description: 'Computing 40+ financial ratios: P/E, ROE, ROIC, debt ratios, growth rates.',
    icon: Calculator,
    output: '> P/E Ratio: 28.4x\n> ROE: 145.3%\n> Revenue CAGR (5Y): +8.2%\n> Debt/Equity: 1.87\n> Free Cash Flow Yield: 3.9%',
    color: '#0B6E46',
  },
  {
    num: '05',
    title: 'Computing Health Score',
    description: 'Running 12 deterministic checks across profitability, growth, and financial strength.',
    icon: Heart,
    output: '> Profitability checks: 4/4 ✓\n> Growth checks: 3/4 ✓\n> Stability checks: 3/4 ✓\n> Valuation checks: 2/4 ✓\n> Health Score: 82/100',
    color: '#0E8F5B',
  },
  {
    num: '06',
    title: 'Running AI Analysis',
    description: 'Gemini analyses the complete financial picture — growth trajectory, risk factors, and moat.',
    icon: Brain,
    output: '> Analysing business quality...\n> Identifying competitive moat...\n> Assessing management efficiency...\n> Evaluating sector dynamics...\n> AI confidence: 87%',
    color: '#6B5CE7',
  },
  {
    num: '07',
    title: 'Generating Bull Thesis',
    description: 'Identifying the strongest case for why this company could outperform.',
    icon: TrendingUp,
    output: '> Strong ecosystem lock-in\n> Services revenue diversification\n> Exceptional FCF generation\n> Pricing power in premium segment\n> Emerging market penetration',
    color: '#0E8F5B',
  },
  {
    num: '08',
    title: 'Generating Bear Thesis',
    description: 'Surfacing the key risks, threats, and reasons for caution.',
    icon: TrendingDown,
    output: '> China revenue concentration risk\n> Smartphone market saturation\n> Regulatory antitrust pressure\n> High P/E relative to growth\n> Supply chain vulnerabilities',
    color: '#C8443A',
  },
  {
    num: '09',
    title: 'Final Verdict',
    description: 'A clear, transparent decision with confidence score and your recommended next step.',
    icon: CheckCircle,
    output: '> ─────────────────────────────\n> VERDICT:  ■ INVEST\n> Confidence: 87%\n> Health Score: 82/100\n> Risk Level: Medium\n> ─────────────────────────────',
    color: '#0E8F5B',
    verdict: 'INVEST',
  },
]

function TerminalOutput({ text, active }) {
  const lines = text.split('\n')
  return (
    <div style={{
      background: '#0A1A13', borderRadius: 12, padding: '20px 24px',
      fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.78rem',
      lineHeight: 1.8, minHeight: 120,
      border: '1px solid rgba(14,143,91,0.2)',
      boxShadow: '0 0 40px rgba(14,143,91,0.05)',
    }}>
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
          transition={{ delay: i * 0.12, duration: 0.4 }}
          style={{
            color: line.startsWith('>') ? 'rgba(14,143,91,0.9)' : 'rgba(255,255,255,0.6)',
            whiteSpace: 'pre',
          }}
        >
          {line}
        </motion.div>
      ))}
    </div>
  )
}

export default function JourneySection() {
  const containerRef = useRef(null)
  const [activeStep, setActiveStep] = useState(0)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const step = Math.min(Math.floor(latest * STEPS.length), STEPS.length - 1)
    setActiveStep(step)
  })

  const progressHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section
      id="journey-section"
      ref={containerRef}
      style={{
        position: 'relative',
        height: `${STEPS.length * 110}vh`,
        background: '#0F211A',
      }}
    >
      {/* Sticky inner panel */}
      <div style={{
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', padding: '48px 24px 36px', flexShrink: 0 }}
        >
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.72rem', color: 'rgba(14,143,91,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            The research pipeline
          </p>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 600, color: '#fff',
            letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1,
          }}>
            9 steps. Seconds, not days.
          </h2>
        </motion.div>

        {/* Main content area */}
        <div style={{
          flex: 1, display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: 0, maxWidth: 1100, margin: '0 auto', width: '100%',
          padding: '0 48px 48px', alignItems: 'start',
          overflow: 'hidden',
        }}>
          {/* Left: step navigator with progress line */}
          <div style={{ position: 'relative', paddingRight: 32 }}>
            {/* Progress track */}
            <div style={{
              position: 'absolute', left: 18, top: 0, bottom: 0,
              width: 2, background: 'rgba(255,255,255,0.06)',
            }} />
            <motion.div style={{
              position: 'absolute', left: 18, top: 0,
              width: 2, background: 'linear-gradient(to bottom, #0E8F5B, #0B6E46)',
              height: progressHeight,
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {STEPS.map((step, i) => {
                const isActive = i === activeStep
                const isDone = i < activeStep
                return (
                  <motion.div
                    key={step.num}
                    animate={{
                      opacity: isActive ? 1 : isDone ? 0.5 : 0.25,
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: '10px 0', cursor: 'default', position: 'relative',
                    }}
                  >
                    {/* Node */}
                    <motion.div
                      animate={{
                        background: isActive
                          ? 'linear-gradient(135deg, #0E8F5B, #0B6E46)'
                          : isDone ? '#0B6E46' : '#1A3328',
                        boxShadow: isActive ? '0 0 16px rgba(14,143,91,0.4)' : 'none',
                        scale: isActive ? 1.2 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      style={{
                        width: 36, height: 36, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, zIndex: 1,
                        border: '2px solid rgba(14,143,91,0.3)',
                      }}
                    >
                      {isDone
                        ? <span style={{ color: '#fff', fontSize: 14 }}>✓</span>
                        : <step.icon size={15} color={isActive ? '#fff' : 'rgba(255,255,255,0.4)'} />
                      }
                    </motion.div>

                    {/* Label */}
                    <div>
                      <div style={{
                        fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.62rem',
                        color: isActive ? 'rgba(14,143,91,0.8)' : 'rgba(255,255,255,0.25)',
                        letterSpacing: '0.06em', marginBottom: 2,
                      }}>
                        {step.num}
                      </div>
                      <div style={{
                        fontSize: '0.82rem', fontWeight: 600,
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                        transition: 'color 0.3s',
                      }}>
                        {step.title}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Right: animated step content */}
          <div style={{ paddingLeft: 32, borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
            {STEPS.map((step, i) => (
              <div key={step.num} style={{ display: activeStep === i ? 'block' : 'none' }}>
                <motion.div
                  key={`content-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Step badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{
                      padding: '4px 12px', background: 'rgba(14,143,91,0.15)',
                      border: '1px solid rgba(14,143,91,0.3)', borderRadius: 99,
                    }}>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.68rem', color: '#0E8F5B', fontWeight: 600, letterSpacing: '0.06em' }}>
                        STEP {step.num}
                      </span>
                    </div>
                    {i === STEPS.length - 1 && (
                      <div style={{
                        padding: '4px 14px',
                        background: 'linear-gradient(135deg, #0E8F5B, #0B6E46)',
                        borderRadius: 99,
                        fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.72rem',
                        color: '#fff', fontWeight: 700, letterSpacing: '0.08em',
                      }}>
                        INVEST ✓
                      </div>
                    )}
                  </div>

                  <h3 style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                    fontWeight: 600, color: '#fff',
                    letterSpacing: '-0.02em', margin: '0 0 12px', lineHeight: 1.2,
                  }}>
                    {step.title}
                  </h3>

                  <p style={{
                    fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)',
                    lineHeight: 1.7, margin: '0 0 28px', maxWidth: 440,
                  }}>
                    {step.description}
                  </p>

                  <TerminalOutput text={step.output} active={activeStep === i} />

                  {/* Progress indicator */}
                  <div style={{ marginTop: 24, display: 'flex', gap: 6, alignItems: 'center' }}>
                    {STEPS.map((_, j) => (
                      <div
                        key={j}
                        style={{
                          height: 2, flex: 1, borderRadius: 1,
                          background: j <= i ? '#0E8F5B' : 'rgba(255,255,255,0.1)',
                          transition: 'background 0.3s',
                        }}
                      />
                    ))}
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginLeft: 8 }}>
                      {i + 1}/{STEPS.length}
                    </span>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
