import { motion } from 'framer-motion'
import { ShieldCheck, Database, Eye, Gauge, Globe, Lock } from 'lucide-react'

const PILLARS = [
  {
    icon: Database,
    title: 'Real Financial Data',
    body: 'Every number fetched directly from Yahoo Finance, Financial Modeling Prep, and other verified providers. The AI never invents figures.',
  },
  {
    icon: Gauge,
    title: 'Deterministic Health Score',
    body: 'The 0–100 Health Score is computed by 12 objective checks. Every pass or fail is shown. No black box, no subjectivity.',
  },
  {
    icon: Eye,
    title: 'Explainable AI',
    body: 'Every verdict includes the exact reasoning chain. Bull thesis, bear thesis, risk factors — all grounded in real data.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparent Confidence',
    body: 'Confidence scores reflect genuine uncertainty, not marketing. An 87% confidence means exactly that — not artificial conviction.',
  },
  {
    icon: Globe,
    title: 'Multiple Data Providers',
    body: 'Cross-referenced from multiple financial APIs. Not a single point of failure. Data quality is our top priority.',
  },
  {
    icon: Lock,
    title: 'No Hallucinations',
    body: 'Gemini is only given real data and asked to reason — never to generate facts. This is a fundamental architectural choice.',
  },
]

export default function TrustSection() {
  return (
    <section style={{ padding: '0 24px 120px', background: '#FBFBF8' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 64px' }}
        >
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem', color: '#0E8F5B', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
            Why trust Vestro
          </p>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(2rem, 4.5vw, 3rem)',
            fontWeight: 600, lineHeight: 1.1,
            letterSpacing: '-0.025em', color: '#0F211A',
            margin: '0 0 20px',
          }}>
            Built on truth,<br />not guesses.
          </h2>
          <p style={{ fontSize: '1rem', color: '#5B6B63', lineHeight: 1.7 }}>
            We believe investors deserve tools that are honest about what they know and what they don't.
          </p>
        </motion.div>

        {/* Pillars grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
        }}>
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3 }}
              style={{
                padding: '28px 28px',
                background: '#fff',
                border: '1px solid #E5E8E2',
                borderRadius: 20,
                transition: 'box-shadow 0.3s',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Top green accent line */}
              <div style={{ position: 'absolute', top: 0, left: 28, right: 28, height: 2, background: 'linear-gradient(to right, #0E8F5B, transparent)', borderRadius: 99 }} />

              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: '#E4F5EC',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 18,
              }}>
                <pillar.icon size={22} color="#0E8F5B" strokeWidth={1.8} />
              </div>

              <h3 style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '1rem', fontWeight: 700,
                color: '#0F211A', margin: '0 0 10px',
                letterSpacing: '-0.01em',
              }}>
                {pillar.title}
              </h3>

              <p style={{
                fontSize: '0.875rem', color: '#5B6B63',
                lineHeight: 1.65, margin: 0,
              }}>
                {pillar.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
