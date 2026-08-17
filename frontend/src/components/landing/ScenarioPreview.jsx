import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sliders, TrendingUp, Activity } from 'lucide-react'

function clamp(val, min, max) { return Math.max(min, Math.min(max, val)) }

function computeHealth(revenue, debt, roe) {
  let score = 50
  score += (revenue - 50) * 0.3  // revenue: 0-100 → -15 to +15
  score -= (debt - 50) * 0.25    // debt: 0-100 → -12.5 to +12.5 (lower is better)
  score += (roe - 50) * 0.35     // roe: 0-100 → -17.5 to +17.5
  return clamp(Math.round(score), 10, 98)
}

function getVerdict(health) {
  if (health >= 70) return { label: 'INVEST', color: '#0E8F5B', bg: '#E4F5EC', border: '#C8EDD9' }
  if (health >= 50) return { label: 'WATCH', color: '#B8862E', bg: '#FFF8EC', border: '#F0D9A0' }
  return { label: 'SKIP', color: '#C8443A', bg: '#FBEAE8', border: '#F3D4D0' }
}

function Slider({ label, value, onChange, leftLabel, rightLabel }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F211A' }}>{label}</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.82rem', color: '#0E8F5B', fontWeight: 700 }}>
          {value}%
        </span>
      </div>
      <div style={{ position: 'relative', height: 6, background: '#E5E8E2', borderRadius: 99 }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${value}%`, borderRadius: 99,
          background: 'linear-gradient(to right, #0E8F5B, #0B6E46)',
          transition: 'width 0.1s',
        }} />
        <input
          type="range" min={0} max={100}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', opacity: 0,
            cursor: 'pointer', height: '100%',
          }}
        />
        <motion.div
          style={{
            position: 'absolute', top: '50%',
            left: `${value}%`, transform: 'translate(-50%, -50%)',
            width: 18, height: 18, borderRadius: '50%',
            background: '#fff', border: '2.5px solid #0E8F5B',
            boxShadow: '0 2px 8px rgba(14,143,91,0.3)',
            pointerEvents: 'none',
          }}
          animate={{ left: `${value}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: '0.68rem', color: '#9AA69F' }}>{leftLabel}</span>
        <span style={{ fontSize: '0.68rem', color: '#9AA69F' }}>{rightLabel}</span>
      </div>
    </div>
  )
}

function HealthRing({ score }) {
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference
  const verdict = getVerdict(score)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ position: 'relative', width: 130, height: 130 }}>
        <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="65" cy="65" r="54" fill="none" stroke="#E5E8E2" strokeWidth="10" />
          <motion.circle
            cx="65" cy="65" r="54" fill="none"
            stroke={verdict.color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <motion.span
            key={score}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ fontFamily: "'Fraunces', serif", fontSize: '2rem', fontWeight: 700, color: '#0F211A', lineHeight: 1 }}
          >
            {score}
          </motion.span>
          <span style={{ fontSize: '0.65rem', color: '#9AA69F', fontFamily: "'IBM Plex Mono', monospace" }}>/100</span>
        </div>
      </div>

      {/* Verdict badge */}
      <AnimatePresence mode="wait">
        <motion.div
          key={verdict.label}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            padding: '10px 28px',
            background: verdict.bg,
            border: `1.5px solid ${verdict.border}`,
            borderRadius: 12,
          }}
        >
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '1.2rem', fontWeight: 800,
            color: verdict.color, letterSpacing: '0.1em',
          }}>
            {verdict.label}
          </span>
        </motion.div>
      </AnimatePresence>

      <p style={{ fontSize: '0.78rem', color: '#9AA69F', textAlign: 'center', maxWidth: 180 }}>
        Health score updates live as you adjust the sliders
      </p>
    </div>
  )
}

export default function ScenarioPreview() {
  const [revenue, setRevenue] = useState(65)
  const [debt, setDebt] = useState(40)
  const [roe, setRoe] = useState(72)

  const health = computeHealth(revenue, debt, roe)

  return (
    <section style={{
      padding: '0 24px 120px',
      background: 'linear-gradient(to bottom, #FBFBF8 0%, #F0F7F4 50%, #FBFBF8 100%)',
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 64px' }}
        >
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem', color: '#0E8F5B', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
            Scenario Lab
          </p>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(2rem, 4.5vw, 3rem)',
            fontWeight: 600, lineHeight: 1.1,
            letterSpacing: '-0.025em', color: '#0F211A',
            margin: '0 0 20px',
          }}>
            Model the future.<br />
            Before you invest in it.
          </h2>
          <p style={{ fontSize: '1rem', color: '#5B6B63', lineHeight: 1.7 }}>
            Adjust key financial drivers and watch how the health score and verdict respond in real time.
          </p>
        </motion.div>

        {/* Interactive card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: '#fff',
            border: '1px solid #E5E8E2',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(15,33,26,0.07)',
          }}
        >
          {/* Header */}
          <div style={{
            background: '#F5F7F4',
            borderBottom: '1px solid #E5E8E2',
            padding: '18px 28px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Sliders size={18} color="#0E8F5B" />
            <span style={{ fontWeight: 700, color: '#0F211A', fontSize: '0.95rem' }}>Scenario Lab — Live Preview</span>
            <div style={{ marginLeft: 'auto', padding: '4px 12px', background: '#E4F5EC', borderRadius: 99, fontSize: '0.72rem', color: '#0E8F5B', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>
              Interactive
            </div>
          </div>

          {/* Body */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 280px',
            gap: 0,
          }}>
            {/* Sliders */}
            <div style={{ padding: '36px 40px', borderRight: '1px solid #F0F0EC' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 28 }}>
                <TrendingUp size={16} color="#5B6B63" />
                <span style={{ fontSize: '0.8rem', color: '#5B6B63', fontWeight: 600 }}>Adjust assumptions to model scenarios</span>
              </div>

              <Slider
                label="Revenue Growth"
                value={revenue}
                onChange={setRevenue}
                leftLabel="Declining"
                rightLabel="Accelerating"
              />
              <Slider
                label="Debt Reduction"
                value={debt}
                onChange={setDebt}
                leftLabel="High Leverage"
                rightLabel="Debt-Free"
              />
              <Slider
                label="Return on Equity"
                value={roe}
                onChange={setRoe}
                leftLabel="Poor Efficiency"
                rightLabel="Exceptional"
              />

              {/* Assumptions note */}
              <div style={{ background: '#F5F7F4', border: '1px solid #E5E8E2', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 8 }}>
                <Activity size={14} color="#9AA69F" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#9AA69F', lineHeight: 1.6 }}>
                  Health Score is computed from 12 deterministic checks across profitability, growth, and financial strength. Every check is visible and explainable.
                </p>
              </div>
            </div>

            {/* Health ring + verdict */}
            <div style={{
              padding: '36px 28px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#FAFAF8',
            }}>
              <HealthRing score={health} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
