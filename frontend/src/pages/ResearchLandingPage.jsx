import SearchBar from '../components/SearchBar/SearchBar'

// A dedicated landing point for "Start Research" button clicks
// Shows the search bar centered with quick-pick tickers below
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
        <p style={{ fontSize: '1rem', color: '#5B6B63', lineHeight: 1.65, maxWidth: 420, margin: '0 auto 40px' }}>
          Type a company name or stock ticker. Vestro will run its full 9-step AI analysis.
        </p>

        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <SearchBar large autoFocus />
        </div>
      </div>
    </div>
  )
}
