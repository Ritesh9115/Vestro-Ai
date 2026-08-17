import { motion } from 'framer-motion'

const TECH = [
  'React 19', 'Node.js', 'MongoDB', 'Redis', 'Docker',
  'Gemini AI', 'Yahoo Finance API', 'Financial Modeling Prep',
  'GitHub Actions', 'AWS', 'Vite', 'Framer Motion',
]

const TECH2 = [
  'Tailwind CSS', 'Express.js', 'JWT Auth', 'REST APIs',
  'Recharts', 'Lenis', 'MUI', 'Lucide Icons',
  'React Hot Toast', 'Axios', 'CI/CD Pipeline', 'Docker Compose',
]

function MarqueeTrack({ items, direction = 1, speed = 40 }) {
  const repeated = [...items, ...items, ...items]

  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
      <motion.div
        animate={{ x: direction > 0 ? [0, -(items.length * 160)] : [-(items.length * 160), 0] }}
        transition={{ repeat: Infinity, duration: items.length * speed / 10, ease: 'linear' }}
        style={{ display: 'flex', gap: 12, width: 'max-content' }}
      >
        {repeated.map((tech, i) => (
          <div
            key={i}
            style={{
              padding: '10px 20px',
              background: '#fff',
              border: '1px solid #E5E8E2',
              borderRadius: 99,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.8rem', fontWeight: 600,
              color: '#0F211A',
            }}>
              {tech}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default function TechMarquee() {
  return (
    <section style={{
      padding: '0 0 120px',
      background: 'linear-gradient(to bottom, #FBFBF8 0%, #F5F7F4 50%, #FBFBF8 100%)',
      overflow: 'hidden',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', padding: '0 24px 48px' }}
      >
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem', color: '#9AA69F', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
          Powered by
        </p>
        <h2 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
          fontWeight: 600, lineHeight: 1.1,
          letterSpacing: '-0.025em', color: '#0F211A',
          margin: 0,
        }}>
          Production-grade technology stack.
        </h2>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Left-to-right */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to right, #FBFBF8, transparent)', zIndex: 2 }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to left, #FBFBF8, transparent)', zIndex: 2 }} />
          <MarqueeTrack items={TECH} direction={1} speed={4.5} />
        </div>

        {/* Right-to-left */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to right, #FBFBF8, transparent)', zIndex: 2 }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to left, #FBFBF8, transparent)', zIndex: 2 }} />
          <MarqueeTrack items={TECH2} direction={-1} speed={5} />
        </div>
      </div>
    </section>
  )
}
