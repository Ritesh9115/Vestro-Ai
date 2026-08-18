import SearchBar from '../components/SearchBar/SearchBar'
import { useExperience } from '../context/ExperienceContext'
import { Languages } from 'lucide-react'

function LangToggle() {
  const { aiLang, setAiLang } = useExperience()
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #E5E8E2', borderRadius: 99, padding: '6px 8px 6px 10px', boxShadow: '0 1px 4px rgba(15,33,26,0.06)' }}>
      <Languages size={14} color="#9AA69F" />
      <span style={{ fontSize: '0.72rem', color: '#9AA69F', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.04em' }}>
        Verdict language:
      </span>
      {[['en', '🇬🇧 English'], ['hi', '🇮🇳 हिंदी']].map(([lang, label]) => (
        <button
          key={lang}
          onClick={() => setAiLang(lang)}
          style={{
            background: aiLang === lang ? (lang === 'hi' ? '#E4F5EC' : '#0F211A') : 'transparent',
            color: aiLang === lang ? (lang === 'hi' ? '#0B6E46' : '#fff') : '#9AA69F',
            border: 'none', borderRadius: 99,
            padding: '5px 14px',
            fontSize: '0.78rem', fontWeight: 700,
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            transition: 'all 0.15s',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default function ResearchLandingPage() {
  return (
    <div style={{ background: '#FBFBF8', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      <div style={{ textAlign: 'center', maxWidth: 640, width: '100%' }}>
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.72rem', color: '#0E8F5B', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
          AI Research Engine
        </p>
        <h1 style={{
          fontFamily: "'Fraunces', serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 600, color: '#0F211A', letterSpacing: '-0.025em',
          lineHeight: 1.1, margin: '0 0 12px',
        }}>
          Which company do you want to research?
        </h1>
        <p style={{ fontSize: '1rem', color: '#5B6B63', lineHeight: 1.65, maxWidth: 420, margin: '0 auto 32px' }}>
          Type a company name or stock ticker. Vestro will run its full 9-step AI analysis.
        </p>

        {/* Language selector — pick before searching */}
        <div style={{ marginBottom: 28 }}>
          <LangToggle />
        </div>

        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <SearchBar large autoFocus />
        </div>
      </div>
    </div>
  )
}
