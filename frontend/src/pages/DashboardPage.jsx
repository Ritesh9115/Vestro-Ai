import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchResearch } from '../services/api'
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
import { AlertCircle } from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'explainable', label: 'Explainable AI' },
  { id: 'recommendations', label: 'Recommendations' },
  { id: 'news', label: 'News & Sentiment' },
]

export default function DashboardPage() {
  const { symbol } = useParams()
  const { mode, setMode } = useExperience()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')

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

  return (
    <div style={{ background: '#FBFBF8', minHeight: '100vh' }}>
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
              <CompanyHeader company={data.company} aiAnalysis={data.aiAnalysis} />
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
    </div>
  )
}
