import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
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
import { AlertCircle, X, Check } from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'explainable', label: 'Explainable AI' },
  { id: 'recommendations', label: 'Recommendations' },
  { id: 'news', label: 'News & Sentiment' },
]

export default function DashboardPage() {
  const { symbol } = useParams()
  const { mode } = useExperience()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')

  // Portfolio Prompt Modal State
  const [showPortfolioPrompt, setShowPortfolioPrompt] = useState(false)
  const [portfolioForm, setPortfolioForm] = useState({ shares: '', avgBuyPrice: '' })
  const [savingPortfolio, setSavingPortfolio] = useState(false)

  useEffect(() => {
    if (symbol) {
      const decoded = decodeURIComponent(symbol)
      runResearch(decoded)
      setActiveTab('overview')
    }
  }, [symbol])

  async function runResearch(sym) {
    setLoading(true)
    setError(null)
    setData(null)
    setCurrentStep(0)
    setShowPortfolioPrompt(false)

    const stepDelay = (index) => new Promise((resolve) => setTimeout(resolve, index === 0 ? 400 : 1200))

    try {
      for (let i = 0; i < STEPS.length - 1; i++) {
        await stepDelay(i)
        setCurrentStep(i)
      }
      const result = await fetchResearch(sym)
      setCurrentStep(STEPS.length - 1)
      setData(result)
      
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Research failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveReport() {
    if (!data) return
    try {
      const payload = {
        symbol: data.company.symbol,
        companyName: data.company.name,
        sector: data.company.sector,
        verdict: data.aiAnalysis.verdict,
        confidence: data.aiAnalysis.confidence,
        healthScore: data.aiAnalysis.healthScore,
        reportSnapshot: data,
      }
      await api.post('/api/reports', payload)
      toast.success('Report saved successfully!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save report')
    }
  }

  async function handleAddToWatchlist() {
    if (!data) return
    try {
      const payload = {
        symbol: data.company.symbol,
        companyName: data.company.name,
        sector: data.company.sector,
        exchange: data.company.exchange,
      }
      await api.post('/api/watchlist', payload)
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
      const payload = {
        symbol: data.company.symbol,
        companyName: data.company.name,
        sector: data.company.sector,
        exchange: data.company.exchange,
        shares: Number(portfolioForm.shares),
        avgBuyPrice: Number(portfolioForm.avgBuyPrice),
      }
      await api.post('/api/portfolio/holdings', payload)
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
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 24px 80px' }}>
        <div style={{ marginBottom: 28, maxWidth: 520 }}>
          <SearchBar />
        </div>

        {loading && (
          <div style={{ padding: '40px 0' }}>
            <ResearchProgress currentStep={currentStep} />
          </div>
        )}

        {error && !loading && (
          <div
            style={{
              background: '#FBEAE8',
              border: '1px solid #F3D4D0',
              borderRadius: 14,
              padding: 24,
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle size={20} color="#C8443A" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: '#C8443A', fontSize: '0.95rem' }}>
                Research failed
              </p>
              <p style={{ margin: '4px 0 0', color: '#5B6B63', fontSize: '0.85rem' }}>{error}</p>
            </div>
          </div>
        )}

        {data && !loading && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'stretch' }}>
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

            <div
              style={{
                display: 'flex',
                gap: 6,
                borderBottom: '1px solid #E5E8E2',
                marginBottom: 28,
                marginTop: 4,
              }}
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 4px',
                    marginRight: 20,
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: activeTab === tab.id ? '#0F211A' : '#9AA69F',
                    background: 'none',
                    border: 'none',
                    borderBottom: `2px solid ${activeTab === tab.id ? '#0E8F5B' : 'transparent'}`,
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
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

      {/* Post-Research Investment Prompt Modal */}
      {showPortfolioPrompt && data && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15,33,26,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
          padding: 24
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 420,
            boxShadow: '0 24px 48px rgba(15,33,26,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0F211A', fontFamily: "'Fraunces', serif" }}>
                Would you like to invest in {data.company.symbol}?
              </h3>
              <button onClick={() => setShowPortfolioPrompt(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9AA69F' }}>
                <X size={20} />
              </button>
            </div>
            
            <p style={{ color: '#5B6B63', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.5 }}>
              Vestro AI has completed the analysis. Do you want to add this to your portfolio tracking?
            </p>

            <form onSubmit={handleAddToPortfolio} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0F211A', marginBottom: 6 }}>Number of Shares</label>
                <input
                  type="number" required min="0.01" step="0.01"
                  value={portfolioForm.shares} onChange={(e) => setPortfolioForm(p => ({ ...p, shares: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E8E2', borderRadius: 8, fontSize: '0.9rem', outline: 'none' }}
                  placeholder="e.g. 15"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0F211A', marginBottom: 6 }}>Purchase Price (₹)</label>
                <input
                  type="number" required min="0.01" step="0.01"
                  value={portfolioForm.avgBuyPrice} onChange={(e) => setPortfolioForm(p => ({ ...p, avgBuyPrice: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E8E2', borderRadius: 8, fontSize: '0.9rem', outline: 'none' }}
                  placeholder="e.g. 150.50"
                />
              </div>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setShowPortfolioPrompt(false)}
                  style={{ flex: 1, padding: '10px', background: '#F5F7F4', border: '1px solid #E5E8E2', borderRadius: 8, color: '#5B6B63', fontWeight: 600, cursor: 'pointer' }}>
                  No, Skip
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
    </div>
  )
}
