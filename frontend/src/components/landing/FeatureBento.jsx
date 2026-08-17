import { motion } from 'framer-motion'
import {
  Brain, PieChart, Zap, Eye, MessageSquare,
  Clock, Lightbulb, Globe, BarChart2, Download,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Investment Research',
    description: 'Gemini analyses growth, profitability, valuation, and risk using real financial data. Not hallucinations.',
    size: 'large',
    accent: '#0E8F5B',
    bg: 'linear-gradient(135deg, #E4F5EC 0%, #F0FAF5 100%)',
  },
  {
    icon: PieChart,
    title: 'Portfolio Intelligence',
    description: 'Track holdings with health scores, sector diversification, and risk analysis.',
    size: 'normal',
    accent: '#0B6E46',
    bg: '#F5F7F4',
  },
  {
    icon: Zap,
    title: 'Scenario Lab',
    description: 'Model "what-if" scenarios. Change revenue, debt, or ROE — see verdict shift in real time.',
    size: 'normal',
    accent: '#B8862E',
    bg: '#FAF7EF',
  },
  {
    icon: Eye,
    title: 'Smart Watchlist',
    description: 'Monitor companies you\'re considering. Get notified of material changes to their fundamentals.',
    size: 'normal',
    accent: '#0E8F5B',
    bg: '#F5F7F4',
  },
  {
    icon: MessageSquare,
    title: 'AI Chat',
    description: 'Ask anything about any company. Powered by real research data — not generic knowledge.',
    size: 'normal',
    accent: '#6B5CE7',
    bg: '#F5F4FD',
  },
  {
    icon: Clock,
    title: 'Research History',
    description: 'Every research you\'ve run is saved. Revisit, compare, track how your thesis evolves.',
    size: 'normal',
    accent: '#5B6B63',
    bg: '#F5F7F4',
  },
  {
    icon: Lightbulb,
    title: 'Explainable AI',
    description: 'Every verdict shows the exact checks that passed or failed. Zero black-box decisions.',
    size: 'large',
    accent: '#0E8F5B',
    bg: 'linear-gradient(135deg, #F5F7F4 0%, #E8F0EB 100%)',
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    description: 'US, India, Europe, Japan, China, Australia. NSE, BSE, NYSE, NASDAQ, LSE, TSE.',
    size: 'normal',
    accent: '#0B6E46',
    bg: '#F5F7F4',
  },
  {
    icon: BarChart2,
    title: 'Compare Companies',
    description: 'Side-by-side comparison of financials, health scores, and verdicts across competitors.',
    size: 'normal',
    accent: '#B8862E',
    bg: '#FAF7EF',
  },
  {
    icon: Download,
    title: 'Export Reports',
    description: 'Save research as PDF reports. Share with your team or build your investment memo.',
    size: 'normal',
    accent: '#5B6B63',
    bg: '#F5F7F4',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function FeatureBento() {
  return (
    <section style={{ padding: '0 24px 120px', background: '#FBFBF8' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Section intro */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 64px' }}
        >
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem', color: '#0E8F5B', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
            Features
          </p>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(2rem, 4.5vw, 3rem)',
            fontWeight: 600, lineHeight: 1.1,
            letterSpacing: '-0.025em', color: '#0F211A',
            margin: '0 0 20px',
          }}>
            Every tool an investor<br />actually needs.
          </h2>
          <p style={{ fontSize: '1rem', color: '#5B6B63', lineHeight: 1.7, margin: 0 }}>
            Purpose-built for long-term, fundamentals-first investing.
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridAutoRows: 'auto',
            gap: 16,
          }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              variants={itemVariants}
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(15,33,26,0.1)' }}
              style={{
                gridColumn: f.size === 'large' ? 'span 2' : 'span 1',
                background: f.bg,
                border: '1px solid rgba(229,232,226,0.7)',
                borderRadius: 20,
                padding: 28,
                cursor: 'default',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle corner glow on large cards */}
              {f.size === 'large' && (
                <div style={{
                  position: 'absolute', top: -40, right: -40,
                  width: 120, height: 120, borderRadius: '50%',
                  background: `radial-gradient(circle, ${f.accent}18 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }} />
              )}

              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${f.accent}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <f.icon size={22} color={f.accent} strokeWidth={1.8} />
              </div>

              <h3 style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: f.size === 'large' ? '1.15rem' : '1rem',
                fontWeight: 700, color: '#0F211A',
                margin: '0 0 10px', letterSpacing: '-0.01em',
              }}>
                {f.title}
              </h3>

              <p style={{
                fontSize: '0.875rem', color: '#5B6B63',
                lineHeight: 1.65, margin: 0,
                maxWidth: f.size === 'large' ? 400 : 'none',
              }}>
                {f.description}
              </p>

              {/* Hover border beam effect */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 20,
                background: `linear-gradient(135deg, transparent, ${f.accent}08)`,
                opacity: 0, transition: 'opacity 0.3s',
                pointerEvents: 'none',
              }} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
