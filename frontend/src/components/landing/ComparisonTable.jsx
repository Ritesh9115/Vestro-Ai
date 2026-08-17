import { motion } from 'framer-motion'
import { Check, X, Minus } from 'lucide-react'

const FEATURES_COMPARE = [
  'Real financial data',
  'AI-powered analysis',
  'Explainable reasoning',
  'Health score (0–100)',
  'Bull & bear thesis',
  'Portfolio tracking',
  'Scenario modeling',
  'AI chat (data-grounded)',
  'Global coverage',
  'No hallucinations',
]

const TOOLS = [
  { name: 'Yahoo Finance', key: 'yahoo' },
  { name: 'Tickertape', key: 'tickertape' },
  { name: 'Moneycontrol', key: 'moneycontrol' },
  { name: 'ChatGPT', key: 'chatgpt' },
  { name: 'Vestro AI', key: 'vestro', highlight: true },
]

const MATRIX = {
  'Real financial data':        { yahoo: true,  tickertape: true,  moneycontrol: true,  chatgpt: false,  vestro: true  },
  'AI-powered analysis':        { yahoo: false, tickertape: false, moneycontrol: false, chatgpt: true,   vestro: true  },
  'Explainable reasoning':      { yahoo: false, tickertape: false, moneycontrol: false, chatgpt: null,   vestro: true  },
  'Health score (0–100)':       { yahoo: false, tickertape: true,  moneycontrol: false, chatgpt: false,  vestro: true  },
  'Bull & bear thesis':         { yahoo: false, tickertape: false, moneycontrol: false, chatgpt: null,   vestro: true  },
  'Portfolio tracking':         { yahoo: true,  tickertape: true,  moneycontrol: true,  chatgpt: false,  vestro: true  },
  'Scenario modeling':          { yahoo: false, tickertape: false, moneycontrol: false, chatgpt: false,  vestro: true  },
  'AI chat (data-grounded)':    { yahoo: false, tickertape: false, moneycontrol: false, chatgpt: null,   vestro: true  },
  'Global coverage':            { yahoo: true,  tickertape: false, moneycontrol: false, chatgpt: null,   vestro: true  },
  'No hallucinations':          { yahoo: true,  tickertape: true,  moneycontrol: true,  chatgpt: false,  vestro: true  },
}

function Cell({ value, vestro }) {
  if (value === true) return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%',
        background: vestro ? 'linear-gradient(135deg, #0E8F5B, #0B6E46)' : '#E4F5EC',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Check size={13} color={vestro ? '#fff' : '#0E8F5B'} strokeWidth={2.5} />
      </div>
    </div>
  )
  if (value === false) return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#F5F7F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <X size={12} color="#C8443A" strokeWidth={2.5} />
      </div>
    </div>
  )
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#F5F7F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Minus size={12} color="#9AA69F" strokeWidth={2.5} />
      </div>
    </div>
  )
}

export default function ComparisonTable() {
  return (
    <section style={{ padding: '0 24px 120px', background: '#FBFBF8' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto 56px' }}
        >
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem', color: '#0E8F5B', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
            How we compare
          </p>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: 600, lineHeight: 1.1,
            letterSpacing: '-0.025em', color: '#0F211A',
            margin: '0 0 16px',
          }}>
            One honest comparison.
          </h2>
          <p style={{ fontSize: '1rem', color: '#5B6B63', lineHeight: 1.7 }}>
            We don't cherry-pick. Here's exactly what each tool offers.
          </p>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: '#fff',
            border: '1px solid #E5E8E2',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(15,33,26,0.06)',
          }}
        >
          {/* Header row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `2fr ${TOOLS.map(() => '1fr').join(' ')}`,
            background: '#F5F7F4',
            borderBottom: '1px solid #E5E8E2',
            padding: '0',
          }}>
            <div style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#9AA69F', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Feature
            </div>
            {TOOLS.map(tool => (
              <div
                key={tool.key}
                style={{
                  padding: '16px 0',
                  textAlign: 'center',
                  background: tool.highlight ? 'rgba(14,143,91,0.05)' : 'transparent',
                  borderLeft: tool.highlight ? '1px solid rgba(14,143,91,0.15)' : '1px solid #E5E8E2',
                  borderRight: tool.highlight ? '1px solid rgba(14,143,91,0.15)' : 'none',
                }}
              >
                <div style={{
                  fontSize: tool.highlight ? '0.82rem' : '0.78rem',
                  fontWeight: tool.highlight ? 800 : 600,
                  color: tool.highlight ? '#0E8F5B' : '#5B6B63',
                  fontFamily: tool.highlight ? "'IBM Plex Mono', monospace" : 'inherit',
                }}>
                  {tool.name}
                </div>
              </div>
            ))}
          </div>

          {/* Feature rows */}
          {FEATURES_COMPARE.map((feature, i) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              style={{
                display: 'grid',
                gridTemplateColumns: `2fr ${TOOLS.map(() => '1fr').join(' ')}`,
                borderBottom: i < FEATURES_COMPARE.length - 1 ? '1px solid #F5F7F4' : 'none',
                background: i % 2 === 0 ? '#fff' : '#FDFDF9',
              }}
            >
              <div style={{ padding: '14px 24px', fontSize: '0.875rem', color: '#0F211A', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                {feature}
              </div>
              {TOOLS.map(tool => (
                <div
                  key={tool.key}
                  style={{
                    padding: '14px 0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: tool.highlight ? 'rgba(14,143,91,0.04)' : 'transparent',
                    borderLeft: tool.highlight ? '1px solid rgba(14,143,91,0.1)' : '1px solid #F5F7F4',
                    borderRight: tool.highlight ? '1px solid rgba(14,143,91,0.1)' : 'none',
                  }}
                >
                  <Cell value={MATRIX[feature]?.[tool.key]} vestro={tool.highlight} />
                </div>
              ))}
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9AA69F', marginTop: 16 }}
        >
          ✓ = Supported · ✗ = Not supported · – = Partially / requires workaround
        </motion.p>
      </div>
    </section>
  )
}
