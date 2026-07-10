import { useNavigate } from 'react-router-dom'

import { useExperience } from '../context/ExperienceContext'
import SearchBar from '../components/SearchBar/SearchBar'

const EXPERIENCE_MODES = [
  { id: 'beginner', label: 'Beginner', description: 'Plain English explanations. No jargon.', color: '#0E8F5B' },
  { id: 'intermediate', label: 'Intermediate', description: 'Key ratios with context and benchmarks.', color: '#B8862E' },
  { id: 'expert', label: 'Expert', description: 'Full financial analysis with all metrics.', color: '#0F211A' },
]

const HOW_IT_WORKS = [
  { title: 'Real Financial Data', description: 'Every number comes directly from financial APIs. The AI never makes up figures.' },
  { title: 'AI Analysis', description: 'Gemini analyses growth, profitability, valuation and risks using real data.' },
  { title: 'Transparent Reasoning', description: 'Every verdict includes the exact checks that passed or failed — nothing is hidden.' },
  { title: 'INVEST / WATCH / SKIP', description: 'A clear research verdict with confidence score, risks, and your next step.' },
]

const EXAMPLE_SEARCHES = [
  '"AAPL" — see why Apple scores high on business quality',
  '"TSLA" — understand the risk factors behind the growth story',
  '"TCS.NS" — check if an Indian IT giant is fairly valued',
]

export default function HomePage() {
  const { mode, setMode } = useExperience()
  const navigate = useNavigate()

  function handleSearch(symbol) {
    navigate(`/research/${symbol}`)
  }

  return (
    <div style={{ background: '#FBFBF8', minHeight: '100vh' }}>
      <section style={{ padding: '72px 24px 48px', textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: '-0.015em',
            margin: '0 0 16px',
            color: '#0F211A',
          }}
        >
          Research any company{' '}
          <em style={{ fontStyle: 'italic', color: '#0B6E46' }}>before</em>
          <br />
          the market convinces you.
        </h1>

        <p
          style={{
            color: '#5B6B63',
            fontSize: '1.05rem',
            lineHeight: 1.65,
            maxWidth: 520,
            margin: '0 auto 12px',
          }}
        >
          Stop switching between 6 financial websites. Vestro collects real data, runs AI analysis,
          and tells you exactly why a company is{' '}
          <strong style={{ color: '#0E8F5B' }}>INVEST</strong>,{' '}
          <strong style={{ color: '#B8862E' }}>WATCH</strong>, or{' '}
          <strong style={{ color: '#C8443A' }}>SKIP</strong>.
        </p>

        <p style={{ color: '#9AA69F', fontSize: '0.8rem', marginBottom: 32 }}>
          All numbers come from real APIs. The AI only explains and analyses.
        </p>

        <div style={{ marginBottom: 40 }}>
          <SearchBar large onSearch={handleSearch} />
        </div>

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E8E2',
            borderRadius: 14,
            padding: 20,
            marginBottom: 40,
          }}
        >
          <p
            style={{
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#9AA69F',
              fontWeight: 700,
              margin: '0 0 14px',
            }}
          >
            Choose your experience level
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            {EXPERIENCE_MODES.map((em) => (
              <button
                key={em.id}
                onClick={() => setMode(em.id)}
                style={{
                  flex: 1,
                  padding: '12px 10px',
                  borderRadius: 10,
                  border: `2px solid ${mode === em.id ? em.color : '#E5E8E2'}`,
                  background: mode === em.id ? `${em.color}10` : '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: mode === em.id ? em.color : '#0F211A',
                    marginBottom: 4,
                  }}
                >
                  {em.label}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#9AA69F', lineHeight: 1.4 }}>
                  {em.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '1.75rem',
              fontWeight: 600,
              color: '#0F211A',
              margin: '0 0 10px',
            }}
          >
            How Vestro works
          </h2>
          <p style={{ color: '#5B6B63', fontSize: '0.95rem' }}>Transparent by design. Every step is visible.</p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 60,
          }}
        >
          {HOW_IT_WORKS.map((item) => (
            <div
              key={item.title}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E8E2',
                borderRadius: 14,
                padding: 22,
                boxShadow: '0 1px 2px rgba(15,33,26,0.04)',
              }}
            >
              <h3
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#0F211A',
                  margin: '0 0 8px',
                }}
              >
                {item.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#5B6B63', lineHeight: 1.6, margin: 0 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E8E2',
            borderRadius: 14,
            padding: 28,
          }}
        >
          <h3
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '1.2rem',
              fontWeight: 600,
              color: '#0F211A',
              margin: '0 0 6px',
            }}
          >
            Example searches to try
          </h3>
          <p style={{ color: '#5B6B63', fontSize: '0.85rem', margin: '0 0 18px' }}>
            These show you the depth of research Vestro produces.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {EXAMPLE_SEARCHES.map((example, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: '#F5F7F4',
                  border: '1px solid #E5E8E2',
                }}
              >
                <span style={{ fontSize: '0.875rem', color: '#0F211A' }}>{example}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
