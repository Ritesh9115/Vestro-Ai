import { useParams } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { fetchResearch } from '../services/api'
import api from '../services/api'
import toast from 'react-hot-toast'
import ResearchProgress, { STEPS } from '../components/ResearchProgress/ResearchProgress'
import CompanyHeader from '../components/Dashboard/CompanyHeader'
import FinancialMetrics from '../components/Dashboard/FinancialMetrics'
import RevenueChart from '../components/Dashboard/RevenueChart'
import VerdictPanel from '../components/Dashboard/VerdictPanel'
import ExplainableAI from '../components/Dashboard/ExplainableAI'
import NewsPanel from '../components/Dashboard/NewsPanel'
import IndustryPanel from '../components/Dashboard/IndustryPanel'
import RecommendationHub from '../components/Dashboard/RecommendationHub'
import SearchBar from '../components/SearchBar/SearchBar'
import MatchResolution from '../components/Dashboard/MatchResolution'
import { useExperience } from '../context/ExperienceContext'
import { AlertCircle, X, Check, Languages, RefreshCw } from 'lucide-react'
import { useIsMobile } from '../hooks/useIsMobile'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'explainable', label: 'Explainable AI' },
  { id: 'recommendations', label: 'Recommendations' },
  { id: 'news', label: 'News & Sentiment' },
]

// Small inline language toggle with a re-translate spinner
function LangToggle({ onRetranslate, translating }) {
  const { aiLang, setAiLang } = useExperience()

  function handleChange(lang) {
    if (lang === aiLang) return
    setAiLang(lang)
    onRetranslate(lang)
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F5F7F4', border: '1px solid #E5E8E2', borderRadius: 8, padding: '4px 6px 4px 4px' }}>
      <Languages size={14} color="#9AA69F" />
      {['en', 'hi'].map((lang) => (
        <button
          key={lang}
          onClick={() => handleChange(lang)}
          disabled={translating}
          style={{
            background: aiLang === lang ? '#fff' : 'transparent',
            border: 'none', borderRadius: 6,
            padding: '4px 10px',
            fontSize: '0.75rem', fontWeight: 700,
            color: aiLang === lang ? '#0F211A' : '#9AA69F',
            cursor: translating ? 'wait' : 'pointer',
            boxShadow: aiLang === lang ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          {lang.toUpperCase()}
        </button>
      ))}
      {translating && (
        <div style={{ width: 12, height: 12, border: '2px solid #E5E8E2', borderTopColor: '#0E8F5B', borderRadius: '50%', animation: 'dSpin 0.7s linear infinite', marginLeft: 2 }} />
      )}
    </div>
  )
}

import { createPortal } from 'react-dom'

// Small spinner overlay for re-translation (does NOT show the full pipeline)
function TranslatingOverlay() {
  return createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(251,251,248,0.75)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        background: '#fff', border: '1px solid #E5E8E2', borderRadius: 16,
        padding: '28px 36px', textAlign: 'center',
        boxShadow: '0 8px 32px rgba(15,33,26,0.08)',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ width: 22, height: 22, border: '3px solid #E5E8E2', borderTopColor: '#0E8F5B', borderRadius: '50%', animation: 'dSpin 0.7s linear infinite', flexShrink: 0 }} />
        <div style={{ textAlign: 'left' }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#0F211A' }}>Translating verdict...</p>
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#9AA69F' }}>Re-generating AI analysis in selected language</p>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function DashboardPage() {
  const { symbol } = useParams()
  const { mode, aiLang } = useExperience()
  const isMobile = useIsMobile()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [translating, setTranslating] = useState(false)   // separate loader for lang switch
  const [error, setError] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')

  const [showPortfolioPrompt, setShowPortfolioPrompt] = useState(false)
  const [portfolioForm, setPortfolioForm] = useState({ shares: '', avgBuyPrice: '' })
  const [savingPortfolio, setSavingPortfolio] = useState(false)

  // Track the lang used for the last fetch so we know if data is stale
  const fetchedLangRef = useRef(aiLang)

  useEffect(() => {
    if (symbol) {
      const decoded = decodeURIComponent(symbol)
      runResearch(decoded, aiLang)
      setActiveTab('overview')
    }
  }, [symbol])

  // Watch aiLang — if verdict is already loaded and lang changes, retranslate with small overlay
  useEffect(() => {
    if (fetchedLangRef.current === aiLang) return   // skip initial mount
    if (data && !loading) {
      retranslate(aiLang)
    }
    // always update ref so next change is detected
    fetchedLangRef.current = aiLang
  }, [aiLang])

  // ─── Parallel API + fake pipeline ──────────────────────────────────────────
  // API call starts IMMEDIATELY. The fake pipeline runs on its own timer track.
  // When the API resolves, we fast-forward the pipeline to "Complete" and show data.
  async function runResearch(sym, lang) {
    setLoading(true)
    setError(null)
    setData(null)
    setCurrentStep(0)
    setShowPortfolioPrompt(false)
    fetchedLangRef.current = lang

    const STEP_INTERVAL = 1100  // ms between each fake step advance

    // Start the real API call immediately
    const apiPromise = fetchResearch(sym, lang)

    // Start the fake pipeline animation in parallel
    let stepIdx = 0
    const advanceStep = () => {
      stepIdx = Math.min(stepIdx + 1, STEPS.length - 2)  // stop 1 before "Complete"
      setCurrentStep(stepIdx)
    }
    const stepTimer = setInterval(advanceStep, STEP_INTERVAL)

    try {
      const result = await apiPromise
      clearInterval(stepTimer)
      setCurrentStep(STEPS.length - 1)   // jump to "Completed"
      // Small delay so user sees "Completed" flash before render
      await new Promise(r => setTimeout(r, 300))
      setData(result)
    } catch (err) {
      clearInterval(stepTimer)
      const message = err.response?.data?.error || err.message || 'Research failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // ─── Language retranslate (small overlay, NOT the full pipeline) ────────────
  async function retranslate(newLang) {
    if (!symbol || !data) return
    setTranslating(true)
    fetchedLangRef.current = newLang
    try {
      const decoded = decodeURIComponent(symbol)
      const result = await fetchResearch(decoded, newLang)
      setData(result)
    } catch (err) {
      toast.error('Translation failed. Please try again.')
    } finally {
      setTranslating(false)
    }
  }

  async function handleSaveReport() {
    if (!data) return
    try {
      await api.post('/api/reports', {
        symbol: data.company.symbol,
        companyName: data.company.name,
        sector: data.company.sector,
        verdict: data.aiAnalysis.verdict,
        confidence: data.aiAnalysis.confidence,
        healthScore: data.aiAnalysis.healthScore,
        reportSnapshot: data,
      })
      toast.success('Report saved successfully!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save report')
    }
  }

  async function handleAddToWatchlist() {
    if (!data) return
    try {
      await api.post('/api/watchlist', {
        symbol: data.company.symbol,
        companyName: data.company.name,
        sector: data.company.sector,
        exchange: data.company.exchange,
      })
      toast.success('Added to watchlist!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to watchlist')
    }
  }

  async function handleAddToPortfolio(e) {
    e.preventDefault()
    if (!data) return
    setSavingPortfolio(true)
    try {
      await api.post('/api/portfolio/holdings', {
        symbol: data.company.symbol,
        companyName: data.company.name,
        sector: data.company.sector,
        exchange: data.company.exchange,
        shares: Number(portfolioForm.shares),
        avgBuyPrice: Number(portfolioForm.avgBuyPrice),
      })
      toast.success('Added to portfolio!')
      setShowPortfolioPrompt(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to portfolio')
    } finally {
      setSavingPortfolio(false)
    }
  }

  return (
    <div style={{ background: '#FBFBF8', minHeight: '100vh', position: 'relative' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: isMobile ? '16px 16px 80px' : '24px 24px 80px' }}>

        {/* Search bar + language selector side by side */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0, maxWidth: isMobile ? '100%' : 520 }}>
            <SearchBar />
          </div>
          {/* Lang toggle: visible pre-search (affects next Analyze call) */}
          <LangToggle
            translating={translating}
            onRetranslate={retranslate}
          />
        </div>

        {loading && (
          <div style={{ padding: '40px 0' }}>
            <ResearchProgress currentStep={currentStep} />
          </div>
        )}

        {error && !loading && (
          <div style={{ background: '#FBEAE8', border: '1px solid #F3D4D0', borderRadius: 14, padding: 24, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <AlertCircle size={20} color="#C8443A" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: '#C8443A', fontSize: '0.95rem' }}>Research failed</p>
              <p style={{ margin: '4px 0 0', color: '#5B6B63', fontSize: '0.85rem' }}>{error}</p>
            </div>
          </div>
        )}

        {data && !loading && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, alignItems: 'stretch', marginBottom: 4 }}>
              <CompanyHeader
                company={data.company}
                aiAnalysis={data.aiAnalysis}
                onSaveReport={handleSaveReport}
                onAddToWatchlist={handleAddToWatchlist}
                onInvestClick={() => {
                  setPortfolioForm(p => ({ ...p, avgBuyPrice: data.company.price || '' }))
                  setShowPortfolioPrompt(true)
                }}
              />
              <MatchResolution matchData={data.matchResolution} />
            </div>

            <div className="scroll-x" style={{ display: 'flex', gap: 6, borderBottom: '1px solid #E5E8E2', marginBottom: 28, marginTop: 4, flexShrink: 0 }}>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 4px',
                    marginRight: isMobile ? 12 : 20,
                    fontSize: isMobile ? '0.82rem' : '0.9rem',
                    fontWeight: 600,
                    color: activeTab === tab.id ? '#0F211A' : '#9AA69F',
                    background: 'none', border: 'none',
                    borderBottom: `2px solid ${activeTab === tab.id ? '#0E8F5B' : 'transparent'}`,
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div>
                <VerdictPanel aiAnalysis={data.aiAnalysis} />
                <FinancialMetrics financials={data.financials} aiAnalysis={data.aiAnalysis} />
                <RevenueChart historicalData={data.financials.historicalRevenue} />
                <IndustryPanel company={data.company} peers={data.peers} />
              </div>
            )}

            {activeTab === 'explainable' && (
              <ExplainableAI aiAnalysis={data.aiAnalysis} mode={mode} />
            )}

            {activeTab === 'recommendations' && (
              <RecommendationHub aiAnalysis={data.aiAnalysis} />
            )}

            {activeTab === 'news' && (
              <NewsPanel news={data.news} />
            )}
          </div>
        )}
      </div>

      {/* Small translation overlay — not the full pipeline */}
      {translating && <TranslatingOverlay />}

      {/* Portfolio Prompt Modal */}
      {showPortfolioPrompt && data && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15,33,26,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24
        }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 420, boxShadow: '0 24px 48px rgba(15,33,26,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0F211A', fontFamily: "'Fraunces', serif" }}>
                Add {data.company.symbol} to Portfolio?
              </h3>
              <button onClick={() => setShowPortfolioPrompt(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9AA69F' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ color: '#5B6B63', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.5 }}>
              Vestro AI has completed the analysis. Track this holding in your portfolio?
            </p>
            <form onSubmit={handleAddToPortfolio} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0F211A', marginBottom: 6 }}>Number of Shares</label>
                <input type="number" required min="0.01" step="0.01"
                  value={portfolioForm.shares}
                  onChange={(e) => setPortfolioForm(p => ({ ...p, shares: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E8E2', borderRadius: 8, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="e.g. 15" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0F211A', marginBottom: 6 }}>Purchase Price (₹)</label>
                <input type="number" required min="0.01" step="0.01"
                  value={portfolioForm.avgBuyPrice}
                  onChange={(e) => setPortfolioForm(p => ({ ...p, avgBuyPrice: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E8E2', borderRadius: 8, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="e.g. 150.50" />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setShowPortfolioPrompt(false)}
                  style={{ flex: 1, padding: '10px', background: '#F5F7F4', border: '1px solid #E5E8E2', borderRadius: 8, color: '#5B6B63', fontWeight: 600, cursor: 'pointer' }}>
                  Skip
                </button>
                <button type="submit" disabled={savingPortfolio}
                  style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #0E8F5B, #0B6E46)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {savingPortfolio ? 'Saving...' : <><Check size={16} /> Add to Portfolio</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
