import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart2, TrendingUp, Activity, MessageSquare, BookOpen } from 'lucide-react'

const SCREENS = [
  {
    id: 'research',
    label: 'Research',
    icon: BarChart2,
    tagline: 'Deep company analysis in seconds',
    preview: <ResearchMockup />,
  },
  {
    id: 'verdict',
    label: 'AI Verdict',
    icon: Activity,
    tagline: 'Clear invest, watch, or skip decisions',
    preview: <VerdictMockup />,
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    icon: TrendingUp,
    tagline: 'Track your holdings with health scores',
    preview: <PortfolioMockup />,
  },
  {
    id: 'chat',
    label: 'AI Chat',
    icon: MessageSquare,
    tagline: 'Ask anything about any company',
    preview: <ChatMockup />,
  },
  {
    id: 'metrics',
    label: 'Metrics',
    icon: BookOpen,
    tagline: 'Financial ratios explained simply',
    preview: <MetricsMockup />,
  },
]

function MetricRow({ label, value, good, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F0F0EC' }}>
      <span style={{ fontSize: '0.78rem', color: '#5B6B63' }}>{label}</span>
      <span style={{
        fontSize: '0.82rem',
        fontFamily: mono ? "'IBM Plex Mono', monospace" : 'inherit',
        fontWeight: 700,
        color: good === true ? '#0E8F5B' : good === false ? '#C8443A' : '#0F211A',
      }}>{value}</span>
    </div>
  )
}

function ResearchMockup() {
  return (
    <div style={{ padding: '24px', fontFamily: "'Inter', sans-serif" }}>
      {/* Company header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #f0f0f0, #e0e0e0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#555' }}>🍎</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0F211A' }}>Apple Inc.</div>
          <div style={{ fontSize: '0.75rem', color: '#9AA69F', fontFamily: "'IBM Plex Mono', monospace" }}>AAPL · NASDAQ · Technology</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F211A' }}>$185.40</div>
          <div style={{ fontSize: '0.75rem', color: '#0E8F5B', fontWeight: 600 }}>+1.24%</div>
        </div>
      </div>

      {/* Health score */}
      <div style={{ background: '#F5F7F4', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'conic-gradient(#0E8F5B 295deg, #E5E8E2 295deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#F5F7F4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#0F211A' }}>82</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#9AA69F', marginBottom: 2 }}>Health Score</div>
          <div style={{ fontWeight: 700, color: '#0F211A', fontSize: '0.9rem' }}>Strong — 12/12 checks passed</div>
        </div>
      </div>

      <MetricRow label="P/E Ratio" value="28.4x" mono />
      <MetricRow label="ROE" value="145.3%" good={true} mono />
      <MetricRow label="Revenue CAGR" value="+8.2%" good={true} mono />
      <MetricRow label="Debt/Equity" value="1.87" mono />
    </div>
  )
}

function VerdictMockup() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{
          display: 'inline-block', padding: '12px 32px',
          background: 'linear-gradient(135deg, #0E8F5B, #0B6E46)',
          borderRadius: 12, marginBottom: 12,
        }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '0.08em' }}>INVEST</span>
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.72rem', color: '#9AA69F' }}>Confidence: 87% · Health: 82/100</div>
      </div>

      <div style={{ background: '#F0FAF5', border: '1px solid #C8EDD9', borderRadius: 10, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0E8F5B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Bull Thesis</div>
        {['Strong ecosystem lock-in', 'Exceptional FCF generation', 'Services revenue growth'].map(b => (
          <div key={b} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4 }}>
            <span style={{ color: '#0E8F5B', flexShrink: 0, marginTop: 1 }}>✓</span>
            <span style={{ fontSize: '0.78rem', color: '#0F211A' }}>{b}</span>
          </div>
        ))}
      </div>

      <div style={{ background: '#FEF5F4', border: '1px solid #F5D0CE', borderRadius: 10, padding: 14 }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#C8443A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Bear Thesis</div>
        {['China revenue concentration', 'Regulatory pressure', 'Market saturation risk'].map(b => (
          <div key={b} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4 }}>
            <span style={{ color: '#C8443A', flexShrink: 0, marginTop: 1 }}>▲</span>
            <span style={{ fontSize: '0.78rem', color: '#0F211A' }}>{b}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PortfolioMockup() {
  const holdings = [
    { name: 'AAPL', sector: 'Technology', value: '$12,450', gain: '+18.3%', verdict: 'INVEST' },
    { name: 'TCS.NS', sector: 'IT Services', value: '₹8,200', gain: '+11.2%', verdict: 'INVEST' },
    { name: 'TSLA', sector: 'Automotive', value: '$3,800', gain: '-4.1%', verdict: 'WATCH' },
  ]
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[{ label: 'Total Value', val: '$24,450', color: '#0F211A' }, { label: 'Health Avg', val: '76/100', color: '#0E8F5B' }, { label: 'Gain', val: '+12.4%', color: '#0E8F5B' }].map(s => (
          <div key={s.label} style={{ flex: 1, background: '#F5F7F4', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: '0.68rem', color: '#9AA69F', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>
      {holdings.map(h => (
        <div key={h.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F0F0EC' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#E4F5EC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', fontWeight: 700, color: '#0E8F5B' }}>{h.name.slice(0,4)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0F211A' }}>{h.name}</div>
            <div style={{ fontSize: '0.7rem', color: '#9AA69F' }}>{h.sector}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{h.value}</div>
            <div style={{ fontSize: '0.72rem', color: h.gain.startsWith('+') ? '#0E8F5B' : '#C8443A', fontWeight: 600 }}>{h.gain}</div>
          </div>
          <div style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.66rem', fontWeight: 700, background: h.verdict === 'INVEST' ? '#E4F5EC' : '#FFF8EC', color: h.verdict === 'INVEST' ? '#0E8F5B' : '#B8862E' }}>
            {h.verdict}
          </div>
        </div>
      ))}
    </div>
  )
}

function ChatMockup() {
  const messages = [
    { role: 'user', text: "What are the biggest risks for Apple in 2025?" },
    { role: 'ai', text: "Apple faces three primary risks: (1) China revenue concentration — ~20% of revenue depends on a market with increasing regulatory pressure, (2) Services growth deceleration as the market matures, and (3) Antitrust scrutiny on the App Store revenue model..." },
    { role: 'user', text: "Is the P/E justified?" },
    { role: 'ai', text: "At 28.4x trailing P/E, Apple trades at a premium, but it's increasingly a services business — which commands higher multiples. The 87% gross margin on Services partially justifies this." },
  ]
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, height: 260, overflowY: 'auto' }}>
      {messages.map((m, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
          <div style={{
            maxWidth: '80%', padding: '10px 14px', borderRadius: 12,
            background: m.role === 'user' ? 'linear-gradient(135deg, #0E8F5B, #0B6E46)' : '#F5F7F4',
            color: m.role === 'user' ? '#fff' : '#0F211A',
            fontSize: '0.78rem', lineHeight: 1.6,
          }}>
            {m.text}
          </div>
        </div>
      ))}
    </div>
  )
}

function MetricsMockup() {
  return (
    <div style={{ padding: '24px' }}>
      {[
        { metric: 'P/E Ratio', value: '28.4x', bench: 'Industry: 24.1x', interpretation: 'Slightly overvalued vs peers but justified by quality premium', status: 'warn' },
        { metric: 'Return on Equity', value: '145.3%', bench: 'Benchmark: >15%', interpretation: 'Exceptional capital efficiency — top quartile globally', status: 'good' },
        { metric: 'Revenue CAGR (5Y)', value: '+8.2%', bench: 'Industry: +5.1%', interpretation: 'Above-industry growth despite large revenue base', status: 'good' },
        { metric: 'Debt/Equity', value: '1.87', bench: 'Conservative: <1.0', interpretation: 'Elevated but manageable given strong FCF generation', status: 'neutral' },
      ].map(m => (
        <div key={m.metric} style={{ marginBottom: 14, padding: '12px 14px', background: '#F5F7F4', borderRadius: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0F211A' }}>{m.metric}</span>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.8rem', fontWeight: 700,
              color: m.status === 'good' ? '#0E8F5B' : m.status === 'warn' ? '#B8862E' : '#5B6B63',
            }}>{m.value}</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#9AA69F', marginBottom: 4 }}>{m.bench}</div>
          <div style={{ fontSize: '0.72rem', color: '#5B6B63', lineHeight: 1.5 }}>{m.interpretation}</div>
        </div>
      ))}
    </div>
  )
}

export default function ProductShowcase() {
  const [active, setActive] = useState('research')
  const activeScreen = SCREENS.find(s => s.id === active)

  return (
    <section style={{
      background: 'linear-gradient(to bottom, #0F211A 0%, #FBFBF8 12%)',
      padding: '0 24px 120px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Narrative bridge */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 64px', paddingTop: 80 }}
        >
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem', color: '#0E8F5B', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
            The product
          </p>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(2rem, 4.5vw, 3rem)',
            fontWeight: 600, lineHeight: 1.1,
            letterSpacing: '-0.025em', color: '#0F211A',
            margin: '0 0 20px',
          }}>
            Everything you need.<br />
            Nothing you don't.
          </h2>
          <p style={{ fontSize: '1rem', color: '#5B6B63', lineHeight: 1.7, maxWidth: 420, margin: '0 auto' }}>
            Built for serious investors who want real data, not noise.
          </p>
        </motion.div>

        {/* Product showcase */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: '#fff',
            border: '1px solid #E5E8E2',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(15,33,26,0.08)',
          }}
        >
          {/* Tabs */}
          <div style={{
            display: 'flex', borderBottom: '1px solid #E5E8E2',
            background: '#FAFAF8', padding: '0 4px',
          }}>
            {SCREENS.map(screen => {
              const isActive = screen.id === active
              return (
                <button
                  key={screen.id}
                  onClick={() => setActive(screen.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '14px 20px', border: 'none', cursor: 'pointer',
                    background: 'transparent', fontSize: '0.85rem', fontWeight: 600,
                    color: isActive ? '#0E8F5B' : '#9AA69F',
                    borderBottom: `2px solid ${isActive ? '#0E8F5B' : 'transparent'}`,
                    transition: 'all 0.2s',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <screen.icon size={15} />
                  {screen.label}
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 380 }}>
            {/* Left info */}
            <div style={{ padding: '40px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid #F0F0EC' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#E4F5EC', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <activeScreen.icon size={22} color="#0E8F5B" />
                  </div>
                  <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.8rem', fontWeight: 600, color: '#0F211A', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                    {activeScreen.label}
                  </h3>
                  <p style={{ fontSize: '1rem', color: '#5B6B63', lineHeight: 1.65, margin: 0 }}>
                    {activeScreen.tagline}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right preview */}
            <div style={{ position: 'relative', overflow: 'hidden', background: '#FAFAF8' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 16, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.99 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{ height: '100%' }}
                >
                  {activeScreen.preview}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
