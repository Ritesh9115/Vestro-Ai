import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Zap, ChevronRight, Activity, Target, Calendar, IndianRupee, ArrowRight, Search, AlertTriangle, HelpCircle, Shield, Info, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import api, { searchCompanies } from '../services/api'
import toast from 'react-hot-toast'
import { useIsMobile } from '../hooks/useIsMobile'
import AILangSelector from '../components/common/AILangSelector'

const MODULES = [
  { id: 'scenario', label: '📊 Scenario Analysis', desc: 'Adjust financial levers live and see AI verdict change in real-time' },
  { id: 'stresstest', label: '⚡ Stress Test', desc: 'Apply market crash or macro shocks and watch health score shift' },
  { id: 'whatif', label: '🔮 What-If Analysis', desc: 'Ask "What if revenue grows 15%?" and get instant AI recalculation' },
  { id: 'quarterly', label: '📅 Quarterly Impact', desc: 'Simulate the impact of quarterly metric changes on verdict' },
  { id: 'general', label: '🚀 General Simulator', desc: 'Simulate generic investment with risk tolerance and horizon' },
]

const STRESS_SCENARIOS = [
  { id: 'crash', label: '📉 Market Crash', desc: 'Revenue -20%, Margin -5%, Debt+30%' },
  { id: 'inflation', label: '🔥 High Inflation', desc: 'Margins compressed -8%, FCF -15%' },
  { id: 'rate_hike', label: '📈 Rate Hike', desc: 'Debt costs +40%, current ratio -0.3' },
  { id: 'excellent', label: '🌟 Excellent Earnings', desc: 'Revenue +25%, Margin +5%, ROE+5' },
  { id: 'weak', label: '😟 Weak Earnings', desc: 'Revenue -10%, EPS miss, FCF negative' },
]

const RISK_PROFILES = [
  { id: 'conservative', label: 'Conservative', emoji: '🛡️', color: '#4A90D9' },
  { id: 'moderate', label: 'Moderate', emoji: '⚖️', color: '#B8862E' },
  { id: 'aggressive', label: 'Aggressive', emoji: '🚀', color: '#C8443A' },
]

const card = { background: '#fff', border: '1px solid #E5E8E2', borderRadius: 14, padding: 20 }
const spinStyle = { width: 24, height: 24, border: '3px solid #E5E8E2', borderTopColor: '#0E8F5B', borderRadius: '50%', animation: 'vspin 0.8s linear infinite', margin: '0 auto 12px' }

function VerdictBadge({ verdict }) {
  const cfg = {
    INVEST: { bg: '#E4F5EC', color: '#0B6E46', border: '#CDEBDB' },
    WATCH: { bg: '#FBF3E2', color: '#B8862E', border: '#EDD99A' },
    SKIP: { bg: '#FBEAE8', color: '#C8443A', border: '#F3D4D0' },
  }
  const t = cfg[verdict] || cfg.WATCH
  return (
    <span style={{ background: t.bg, color: t.color, border: `1px solid ${t.border}`, borderRadius: 20, padding: '4px 14px', fontWeight: 700, fontSize: '0.9rem' }}>
      {verdict}
    </span>
  )
}

function HealthBar({ score, prev }) {
  const color = score >= 70 ? '#0E8F5B' : score >= 45 ? '#B8862E' : '#C8443A'
  const diff = prev != null ? Math.round(score - prev) : 0
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontWeight: 700, fontSize: '1.4rem', color, fontFamily: "'IBM Plex Mono',monospace" }}>{score}<span style={{ fontSize: '0.8rem', color: '#9AA69F' }}>/100</span></span>
        {diff !== 0 && <span style={{ fontSize: '0.85rem', fontWeight: 700, color: diff > 0 ? '#0E8F5B' : '#C8443A' }}>{diff > 0 ? `▲ +${diff}` : `▼ ${diff}`}</span>}
      </div>
      <div style={{ height: 8, background: '#F0F2F0', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, score))}%`, background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )
}

function CompanySearch({ onSelect, label }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState(null)
  const debounceRef = useState(null)

  function handleChange(e) {
    const q = e.target.value
    setQuery(q)
    setSelected(null)
    if (debounceRef[0]) clearTimeout(debounceRef[0])
    if (q.length < 2) { setResults([]); return }
    setSearching(true)
    debounceRef[0] = setTimeout(async () => {
      try {
        const res = await searchCompanies(q)
        setResults((Array.isArray(res) ? res : res.results || []).slice(0, 7))
      } catch { setResults([]) }
      finally { setSearching(false) }
    }, 350)
  }

  function selectCompany(r) {
    setSelected(r)
    setQuery(`${r.name} (${r.symbol})`)
    setResults([])
  }

  function handleLoad() {
    if (selected) onSelect(selected)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9AA69F', pointerEvents: 'none' }} />
          <input
            value={query}
            onChange={handleChange}
            placeholder={label || 'Type company name or symbol (e.g. AAPL, Reliance)...'}
            style={{ width: '100%', padding: '12px 40px 12px 36px', border: '1.5px solid #E5E8E2', borderRadius: 10, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
          />
          {searching && (
            <div style={{ width: 14, height: 14, border: '2px solid #E5E8E2', borderTopColor: '#0E8F5B', borderRadius: '50%', animation: 'vspin 0.7s linear infinite', position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} />
          )}
          {results.length > 0 && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1px solid #E5E8E2', borderRadius: 10, boxShadow: '0 8px 32px rgba(15,33,26,0.12)', zIndex: 100, overflow: 'hidden' }}>
              {results.map((r) => (
                <button key={r.symbol} onClick={() => selectCompany(r)}
                  style={{ display: 'flex', width: '100%', padding: '11px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #F5F7F4', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0E8F5B', fontFamily: "'IBM Plex Mono',monospace", minWidth: 80 }}>{r.symbol}</span>
                  <span style={{ fontSize: '0.85rem', color: '#0F211A' }}>{r.name}</span>
                  {r.exchange && <span style={{ fontSize: '0.72rem', color: '#9AA69F', marginLeft: 'auto' }}>{r.exchange}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleLoad}
          disabled={!selected}
          style={{ padding: '12px 22px', background: selected ? 'linear-gradient(135deg,#0E8F5B,#0B6E46)' : '#E5E8E2', color: selected ? '#fff' : '#9AA69F', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem', cursor: selected ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}>
          <TrendingUp size={16} /> Load Company
        </button>
      </div>
      {selected && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, padding: '6px 12px', background: '#E4F5EC', borderRadius: 8, width: 'fit-content' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0B6E46' }}>✓ {selected.symbol}</span>
          <span style={{ fontSize: '0.8rem', color: '#5B6B63' }}>{selected.name}</span>
          <button onClick={() => { setSelected(null); setQuery('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9AA69F', padding: '0 2px', fontSize: '0.85rem', lineHeight: 1 }}>×</button>
        </div>
      )}
    </div>
  )
}

function Loader({ label }) {
  return (
    <div style={{ ...card, textAlign: 'center', padding: 40, marginTop: 20 }}>
      <div style={spinStyle} />
      <p style={{ color: '#9AA69F', fontSize: '0.875rem' }}>{label || 'Loading...'}</p>
    </div>
  )
}

function ModuleEmptyState({ title, description, icon: Icon }) {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', background: '#F9FAF9', borderRadius: 12, border: '1px dashed #D0D5D2', marginTop: 20 }}>
      <div style={{ width: 48, height: 48, background: '#E4F5EC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <Icon size={24} color="#0E8F5B" />
      </div>
      <h3 style={{ fontSize: '1.1rem', color: '#0F211A', marginBottom: 8, fontWeight: 700 }}>{title}</h3>
      <p style={{ color: '#5B6B63', fontSize: '0.9rem', maxWidth: 450, margin: '0 auto', lineHeight: 1.5 }}>{description}</p>
    </div>
  )
}

function ModuleErrorState({ error }) {
  const errMsg = typeof error === 'string' ? error : (error?.message || JSON.stringify(error) || 'An unknown error occurred')
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', background: '#FEF4F4', borderRadius: 12, border: '1px dashed #F3D2D1', marginTop: 20 }}>
      <div style={{ width: 48, height: 48, background: '#FDECEC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <AlertTriangle size={24} color="#C8443A" />
      </div>
      <h3 style={{ fontSize: '1.1rem', color: '#681B16', marginBottom: 8, fontWeight: 700 }}>Analysis Failed</h3>
      <p style={{ color: '#A03831', fontSize: '0.9rem', maxWidth: 450, margin: '0 auto', lineHeight: 1.5 }}>{errMsg}</p>
    </div>
  )
}

function SliderField({ label, field, min, max, step, unit, value, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.8rem', color: '#5B6B63', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0E8F5B', fontFamily: "'IBM Plex Mono',monospace" }}>{Number(value).toFixed(step < 1 ? 1 : 0)}{unit || '%'}</span>
      </div>
      <input type="range" min={min} max={max} step={step || 0.5} value={value}
        onChange={(e) => onChange(field, parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#0E8F5B', cursor: 'pointer' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#9AA69F' }}>
        <span>{min}{unit || '%'}</span><span>{max}{unit || '%'}</span>
      </div>
    </div>
  )
}

// ── Scenario Analysis ──────────────────────────────────────────────────────────
function ScenarioModule() {
  const isMobile = useIsMobile()
  const [company, setCompany] = useState(null)
  const [researching, setResearching] = useState(false)
  const [baseData, setBaseData] = useState(null)
  const [error, setError] = useState(null)
  const [sliders, setSliders] = useState({})
  const [simResult, setSimResult] = useState(null)
  const [simulating, setSimulating] = useState(false)

  async function loadCompany(sel) {
    setCompany(sel); setBaseData(null); setSimResult(null); setError(null); setResearching(true)
    try {
      const res = await api.get(`/api/research/${sel.symbol}`)
      const f = res.data.financials
      setBaseData(res.data)
      setSliders({ revenueGrowth: +(f.revenueGrowth ?? 8).toFixed(1), netMargin: +(f.netMargin ?? 10).toFixed(1), roe: +(f.roe ?? 12).toFixed(1), debtToEquity: +(f.debtToEquity ?? 0.5).toFixed(2), currentRatio: +(f.currentRatio ?? 1.5).toFixed(2) })
    } catch (err) { 
      setError(err.response?.data?.error || 'Failed to load company financials. It may be unsupported.')
    }
    finally { setResearching(false) }
  }

  function updateSlider(field, val) { setSliders(s => ({ ...s, [field]: val })); setSimResult(null) }

  async function runScenario() {
    if (!baseData) return
    setSimulating(true); setSimResult(null)
    try {
      const res = await api.post('/api/simulator/scenario', { symbol: company.symbol, companyName: company.name, baseFinancials: baseData.financials, adjustedMetrics: sliders })
      setSimResult(res.data)
    } catch (err) { toast.error(err.response?.data?.error || 'Simulation failed') }
    finally { setSimulating(false) }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}><CompanySearch label="Search company to simulate..." onSelect={loadCompany} /></div>
      {researching && <Loader label="Loading company financials..." />}
      {error && !researching && <ModuleErrorState error={error} />}
      {!baseData && !researching && !error && (
        <ModuleEmptyState 
          title="Scenario Analysis"
          description="Adjust key financial metrics like Revenue Growth and Net Margin using sliders to see how the AI adjusts the investment verdict."
          icon={Zap}
        />
      )}
      {baseData && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
          <div style={card}>
            <p style={{ fontWeight: 700, color: '#0F211A', marginBottom: 16 }}>🎛️ Adjust Financial Levers</p>
            <SliderField label="Revenue Growth" field="revenueGrowth" min={-30} max={50} value={sliders.revenueGrowth} onChange={updateSlider} />
            <SliderField label="Net Margin" field="netMargin" min={-20} max={40} value={sliders.netMargin} onChange={updateSlider} />
            <SliderField label="Return on Equity (ROE)" field="roe" min={-10} max={50} value={sliders.roe} onChange={updateSlider} />
            <SliderField label="Debt/Equity" field="debtToEquity" min={0} max={5} step={0.05} unit="x" value={sliders.debtToEquity} onChange={updateSlider} />
            <SliderField label="Current Ratio" field="currentRatio" min={0.1} max={5} step={0.1} unit="x" value={sliders.currentRatio} onChange={updateSlider} />
            <button onClick={runScenario} disabled={simulating} style={{ width: '100%', padding: '10px', background: simulating ? '#9AA69F' : 'linear-gradient(135deg,#0E8F5B,#0B6E46)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: simulating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {simulating ? <><div style={{ ...spinStyle, width: 16, height: 16, border: '2px solid #fff4', borderTopColor: '#fff', margin: 0 }} /> Simulating...</> : <><Zap size={15} /> Simulate Scenario</>}
            </button>
          </div>
          <div style={card}>
            <p style={{ fontWeight: 700, color: '#0F211A', marginBottom: 16 }}>📈 Simulation Results</p>
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: '0.72rem', color: '#9AA69F', textTransform: 'uppercase', marginBottom: 6 }}>Base Verdict</p>
              <VerdictBadge verdict={baseData.aiAnalysis?.verdict || 'WATCH'} />
            </div>
            {simResult ? (
              <>
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: '0.72rem', color: '#9AA69F', textTransform: 'uppercase', marginBottom: 6 }}>Simulated Verdict</p>
                  <VerdictBadge verdict={simResult.verdict} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: '0.72rem', color: '#9AA69F', textTransform: 'uppercase', marginBottom: 6 }}>Health Score</p>
                  <HealthBar score={simResult.healthScore} prev={baseData.aiAnalysis?.healthScore} />
                </div>
                <div style={{ background: '#F5F7F4', borderRadius: 10, padding: 12 }}>
                  <p style={{ fontSize: '0.8rem', color: '#5B6B63', lineHeight: 1.6 }}>{simResult.analysis}</p>
                </div>
              </>
            ) : (
              <p style={{ color: '#9AA69F', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>Adjust the sliders and click Simulate to see verdict changes.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Stress Test ────────────────────────────────────────────────────────────────
function StressTestModule() {
  const isMobile = useIsMobile()
  const [company, setCompany] = useState(null)
  const [researching, setResearching] = useState(false)
  const [baseData, setBaseData] = useState(null)
  const [error, setError] = useState(null)
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [result, setResult] = useState(null)
  const [testing, setTesting] = useState(false)

  async function loadCompany(sel) {
    setCompany(sel); setBaseData(null); setResult(null); setError(null); setResearching(true)
    try {
      const res = await api.get(`/api/research/${sel.symbol}`)
      setBaseData(res.data)
    } catch (err) { 
      setError(err.response?.data?.error || 'Failed to load company data. It may be unsupported.')
    }
    finally { setResearching(false) }
  }

  async function runTest() {
    if (!baseData || !selectedScenario) return
    setTesting(true); setResult(null)
    try {
      const res = await api.post('/api/simulator/stress', { symbol: company.symbol, companyName: company.name, baseFinancials: baseData.financials, scenario: selectedScenario })
      setResult(res.data)
    } catch (err) { toast.error(err.response?.data?.error || 'Stress test failed') }
    finally { setTesting(false) }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}><CompanySearch label="Search company to stress test..." onSelect={loadCompany} /></div>
      {researching && <Loader label="Loading company data..." />}
      {error && !researching && <ModuleErrorState error={error} />}
      {!baseData && !researching && !error && (
        <ModuleEmptyState 
          title="Stress Testing"
          description="Subject the company to macroeconomic shocks like a Market Crash or High Inflation to evaluate its resilience and updated health score."
          icon={Activity}
        />
      )}
      {baseData && (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            {STRESS_SCENARIOS.map(s => (
              <button key={s.id} onClick={() => setSelectedScenario(s.id)}
                style={{ padding: '10px 16px', border: `2px solid ${selectedScenario === s.id ? '#0E8F5B' : '#E5E8E2'}`, borderRadius: 10, background: selectedScenario === s.id ? '#E4F5EC' : '#fff', cursor: 'pointer', textAlign: 'left', minWidth: 160 }}>
                <p style={{ fontWeight: 700, fontSize: '0.85rem', color: selectedScenario === s.id ? '#0E8F5B' : '#0F211A', marginBottom: 2 }}>{s.label}</p>
                <p style={{ fontSize: '0.7rem', color: '#9AA69F' }}>{s.desc}</p>
              </button>
            ))}
          </div>
          <button onClick={runTest} disabled={!selectedScenario || testing}
            style={{ padding: '10px 24px', background: selectedScenario && !testing ? 'linear-gradient(135deg,#0E8F5B,#0B6E46)' : '#9AA69F', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: selectedScenario && !testing ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            {testing ? <><div style={{ ...spinStyle, width: 16, height: 16, border: '2px solid #fff4', borderTopColor: '#fff', margin: 0 }} /> Running...</> : <><Activity size={15} /> Run Stress Test</>}
          </button>
          {result && (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
              <div style={card}>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F211A', marginBottom: 12 }}>Before Stress</p>
                <div style={{ marginBottom: 8 }}><VerdictBadge verdict={baseData.aiAnalysis?.verdict || 'WATCH'} /></div>
                <div style={{ marginTop: 12 }}><HealthBar score={baseData.aiAnalysis?.healthScore || 50} /></div>
              </div>
              <div style={card}>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F211A', marginBottom: 12 }}>After Stress</p>
                <div style={{ marginBottom: 8 }}><VerdictBadge verdict={result.verdict} /></div>
                <div style={{ marginTop: 12 }}><HealthBar score={result.healthScore} prev={baseData.aiAnalysis?.healthScore} /></div>
              </div>
              <div style={{ ...card, gridColumn: '1/-1' }}>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F211A', marginBottom: 8 }}>AI Analysis</p>
                <p style={{ color: '#5B6B63', fontSize: '0.875rem', lineHeight: 1.6 }}>{result.analysis}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── What-If ────────────────────────────────────────────────────────────────────
function WhatIfModule() {
  const isMobile = useIsMobile()
  const [company, setCompany] = useState(null)
  const [baseData, setBaseData] = useState(null)
  const [error, setError] = useState(null)
  const [researching, setResearching] = useState(false)
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState(null)
  const [asking, setAsking] = useState(false)
  const EXAMPLES = ['What if revenue grows by 20% next year?', 'What if debt becomes zero?', 'What if net margin doubles?']

  async function loadCompany(sel) {
    setCompany(sel); setBaseData(null); setResult(null); setError(null); setResearching(true)
    try {
      const res = await api.get(`/api/research/${sel.symbol}`)
      setBaseData(res.data)
    } catch (err) { 
      setError(err.response?.data?.error || 'Failed to load company data. It may be unsupported.')
    }
    finally { setResearching(false) }
  }

  async function ask() {
    if (!baseData || !question.trim()) return
    setAsking(true); setResult(null)
    try {
      const res = await api.post('/api/simulator/whatif', { symbol: company.symbol, companyName: company.name, baseFinancials: baseData.financials, question: question.trim() })
      setResult(res.data)
    } catch (err) { toast.error(err.response?.data?.error || 'Analysis failed') }
    finally { setAsking(false) }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}><CompanySearch label="Select a company first..." onSelect={loadCompany} /></div>
      {researching && <Loader label="Loading company data..." />}
      {error && !researching && <ModuleErrorState error={error} />}
      {!baseData && !researching && !error && (
        <ModuleEmptyState 
          title="What-If Analysis"
          description="Ask open-ended questions like 'What if revenue drops 20% due to competition?' and let AI simulate the financial impact."
          icon={Target}
        />
      )}
      {baseData && (
        <>
          <div style={{ ...card, marginBottom: 16 }}>
            <p style={{ fontWeight: 700, color: '#0F211A', marginBottom: 10 }}>💬 Ask a What-If Question</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {EXAMPLES.map(ex => (
                <button key={ex} onClick={() => setQuestion(ex)} style={{ padding: '5px 12px', border: '1px solid #E5E8E2', borderRadius: 20, background: question === ex ? '#E4F5EC' : '#fff', color: question === ex ? '#0E8F5B' : '#5B6B63', cursor: 'pointer', fontSize: '0.75rem' }}>{ex}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Type your what-if..." onKeyDown={e => e.key === 'Enter' && ask()}
                style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #E5E8E2', borderRadius: 10, fontSize: '0.9rem', outline: 'none' }} />
              <button onClick={ask} disabled={asking || !question.trim()}
                style={{ padding: '10px 20px', background: asking ? '#9AA69F' : 'linear-gradient(135deg,#0E8F5B,#0B6E46)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: asking ? 'not-allowed' : 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
                {asking ? <div style={{ ...spinStyle, width: 16, height: 16, border: '2px solid #fff4', borderTopColor: '#fff', margin: 0 }} /> : <><Target size={15} /> Analyse</>}
              </button>
            </div>
          </div>
          {result && (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
              <div style={card}>
                <p style={{ fontSize: '0.72rem', color: '#9AA69F', textTransform: 'uppercase', marginBottom: 8 }}>Before</p>
                <div style={{ marginBottom: 8 }}><VerdictBadge verdict={baseData.aiAnalysis?.verdict || 'WATCH'} /></div>
                <div style={{ marginTop: 10 }}><HealthBar score={baseData.aiAnalysis?.healthScore || 50} /></div>
              </div>
              <div style={card}>
                <p style={{ fontSize: '0.72rem', color: '#9AA69F', textTransform: 'uppercase', marginBottom: 8 }}>After "{question.slice(0, 40)}{question.length > 40 ? '...' : ''}"</p>
                <div style={{ marginBottom: 8 }}><VerdictBadge verdict={result.verdict} /></div>
                <div style={{ marginTop: 10 }}><HealthBar score={result.healthScore} prev={baseData.aiAnalysis?.healthScore} /></div>
              </div>
              <div style={{ ...card, gridColumn: '1/-1' }}>
                <p style={{ fontWeight: 700, color: '#0F211A', marginBottom: 8 }}>📊 Analysis (Confidence: {result.confidence}%)</p>
                <p style={{ color: '#5B6B63', fontSize: '0.875rem', lineHeight: 1.6 }}>{result.analysis}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Quarterly Impact ───────────────────────────────────────────────────────────
function QuarterlyModule() {
  const isMobile = useIsMobile()
  const [company, setCompany] = useState(null)
  const [baseData, setBaseData] = useState(null)
  const [error, setError] = useState(null)
  const [researching, setResearching] = useState(false)
  const [metrics, setMetrics] = useState({ revenueGrowth: 8, netMargin: 10, epsGrowth: 5 })
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)

  function update(field, val) { setMetrics(m => ({ ...m, [field]: val })); setResult(null) }

  async function loadCompany(sel) {
    setCompany(sel); setBaseData(null); setResult(null); setError(null); setResearching(true)
    try {
      const res = await api.get(`/api/research/${sel.symbol}`)
      const f = res.data.financials
      setBaseData(res.data)
      setMetrics({ revenueGrowth: +(f.revenueGrowth ?? 8).toFixed(1), netMargin: +(f.netMargin ?? 10).toFixed(1), epsGrowth: +(f.epsGrowth ?? 5).toFixed(1) })
    } catch (err) { 
      setError(err.response?.data?.error || 'Failed to load company financials. It may be unsupported.')
    }
    finally { setResearching(false) }
  }

  async function simulate() {
    setRunning(true); setResult(null)
    try {
      const res = await api.post('/api/simulator/quarterly', { symbol: company.symbol, companyName: company.name, baseFinancials: baseData.financials, quarterlyMetrics: metrics })
      setResult(res.data)
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setRunning(false) }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}><CompanySearch label="Select company..." onSelect={loadCompany} /></div>
      {researching && <Loader label="Loading company data..." />}
      {error && !researching && <ModuleErrorState error={error} />}
      {!baseData && !researching && !error && (
        <ModuleEmptyState 
          title="Quarterly Impact"
          description="Simulate upcoming quarterly earnings results to see how beats or misses affect the overall health score and verdict."
          icon={Calendar}
        />
      )}
      {baseData && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
          <div style={card}>
            <p style={{ fontWeight: 700, color: '#0F211A', marginBottom: 16 }}>📅 Quarterly Metrics</p>
            <SliderField label="Revenue Growth (%)" field="revenueGrowth" min={-30} max={60} value={metrics.revenueGrowth} onChange={update} />
            <SliderField label="Net Margin (%)" field="netMargin" min={-20} max={40} value={metrics.netMargin} onChange={update} />
            <SliderField label="EPS Growth (%)" field="epsGrowth" min={-50} max={100} value={metrics.epsGrowth} onChange={update} />
            <button onClick={simulate} disabled={running}
              style={{ width: '100%', padding: '10px', background: running ? '#9AA69F' : 'linear-gradient(135deg,#0E8F5B,#0B6E46)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {running ? <><div style={{ ...spinStyle, width: 16, height: 16, border: '2px solid #fff4', borderTopColor: '#fff', margin: 0 }} /> Computing...</> : <><Calendar size={15} /> Simulate Quarter</>}
            </button>
          </div>
          <div style={card}>
            <p style={{ fontWeight: 700, color: '#0F211A', marginBottom: 16 }}>📊 Impact</p>
            {result ? (
              <>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                  <div><p style={{ fontSize: '0.7rem', color: '#9AA69F', marginBottom: 4 }}>CURRENT</p><VerdictBadge verdict={baseData.aiAnalysis?.verdict || 'WATCH'} /></div>
                  <ArrowRight size={20} color="#9AA69F" />
                  <div><p style={{ fontSize: '0.7rem', color: '#9AA69F', marginBottom: 4 }}>PROJECTED</p><VerdictBadge verdict={result.verdict} /></div>
                </div>
                <div style={{ marginBottom: 12 }}><HealthBar score={result.healthScore} prev={baseData.aiAnalysis?.healthScore} /></div>
                <div style={{ background: '#F5F7F4', borderRadius: 10, padding: 12 }}>
                  <p style={{ fontSize: '0.8rem', color: '#5B6B63', lineHeight: 1.6 }}>{result.reason}</p>
                </div>
              </>
            ) : (
              <p style={{ color: '#9AA69F', fontSize: '0.85rem', textAlign: 'center', padding: '30px 0' }}>Adjust metrics and click Simulate Quarter.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── General Simulator ──────────────────────────────────────────────────────────
function GeneralModule() {
  const [amount, setAmount] = useState('')
  const [horizon, setHorizon] = useState(5)
  const [riskTolerance, setRiskTolerance] = useState('moderate')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const formatINR = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v)
  const sel = RISK_PROFILES.find(p => p.id === riskTolerance)

  async function run() {
    if (!amount || amount < 1000) { toast.error('Minimum ₹1,000'); return }
    setLoading(true); setResult(null)
    try {
      const res = await api.post('/api/simulator', { amount: parseFloat(amount), horizon, riskTolerance })
      setResult(res.data)
    } catch (err) { toast.error(err.response?.data?.error || 'Simulation failed') }
    finally { setLoading(false) }
  }

  if (result) return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 16, marginBottom: 24 }}>
        {[{ l: 'Investment', v: formatINR(result.input.amount) }, { l: 'Horizon', v: `${result.input.horizon}Y` }, { l: 'Risk Profile', v: sel?.label }, { l: 'Base CAGR', v: result.simulation?.projections?.base?.cagr }].map(i => (
          <div key={i.l} style={card}><p style={{ fontSize: '0.72rem', color: '#9AA69F', textTransform: 'uppercase', marginBottom: 6 }}>{i.l}</p><p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F211A', fontFamily: "'IBM Plex Mono',monospace" }}>{i.v}</p></div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginBottom: 24 }}>
        {[{ sc: result.simulation?.projections?.bestCase, l: 'Best', e: '🌟', c: '#0E8F5B' }, { sc: result.simulation?.projections?.bull, l: 'Bull', e: '🐂', c: '#4A90D9' }, { sc: result.simulation?.projections?.base, l: 'Base', e: '📊', c: '#B8862E' }, { sc: result.simulation?.projections?.bear, l: 'Bear', e: '🐻', c: '#C8443A' }].map(({ sc, l, e, c }) => sc && (
          <motion.div key={l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...card, borderColor: `${c}40` }}>
            <p style={{ fontWeight: 700, color: c, marginBottom: 6 }}>{e} {l}</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F211A', fontFamily: "'IBM Plex Mono',monospace" }}>{sc.finalAmount}</p>
            <p style={{ fontSize: '0.75rem', color: '#9AA69F' }}>CAGR: <span style={{ color: c, fontWeight: 600 }}>{sc.cagr}</span></p>
          </motion.div>
        ))}
      </div>
      {result.simulation?.aiNarrative && <div style={{ ...card, marginBottom: 16 }}><p style={{ fontWeight: 700, color: '#0F211A', marginBottom: 8 }}>🤖 AI Narrative</p><p style={{ color: '#5B6B63', lineHeight: 1.7, fontSize: '0.9rem' }}>{result.simulation.aiNarrative}</p></div>}
      <button onClick={() => setResult(null)} style={{ padding: '10px 28px', background: 'none', border: '1px solid #E5E8E2', borderRadius: 10, cursor: 'pointer', color: '#5B6B63', fontWeight: 600 }}>← New Simulation</button>
    </div>
  )

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <ModuleEmptyState 
        title="Portfolio Simulator"
        description="Forecast your long-term wealth accumulation by setting your investment amount, time horizon, and risk tolerance."
        icon={TrendingUp}
      />
      <div style={{ ...card, marginBottom: 16 }}>
        <label style={{ display: 'block', fontWeight: 700, color: '#0F211A', marginBottom: 10 }}>💰 Investment Amount</label>
        <div style={{ position: 'relative' }}>
          <IndianRupee size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#0E8F5B' }} />
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="500000" min="1000"
            style={{ width: '100%', padding: '12px 12px 12px 36px', border: '2px solid #E5E8E2', borderRadius: 10, fontSize: '1.2rem', fontWeight: 700, outline: 'none', fontFamily: "'IBM Plex Mono',monospace", boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {[100000, 500000, 1000000, 5000000].map(v => (
            <button key={v} onClick={() => setAmount(v)} style={{ padding: '5px 12px', border: '1px solid #E5E8E2', borderRadius: 20, background: amount == v ? '#0E8F5B' : '#fff', color: amount == v ? '#fff' : '#5B6B63', cursor: 'pointer', fontSize: '0.8rem' }}>{formatINR(v)}</button>
          ))}
        </div>
      </div>
      <div style={{ ...card, marginBottom: 16 }}>
        <label style={{ display: 'block', fontWeight: 700, color: '#0F211A', marginBottom: 10 }}>📅 Horizon: <span style={{ color: '#0E8F5B' }}>{horizon} Year{horizon !== 1 ? 's' : ''}</span></label>
        <input type="range" min={1} max={20} value={horizon} onChange={e => setHorizon(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#0E8F5B', cursor: 'pointer' }} />
      </div>
      <div style={{ ...card, marginBottom: 20 }}>
        <label style={{ display: 'block', fontWeight: 700, color: '#0F211A', marginBottom: 10 }}>🎯 Risk Tolerance</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {RISK_PROFILES.map(p => (
            <button key={p.id} onClick={() => setRiskTolerance(p.id)}
              style={{ padding: '12px 8px', border: `2px solid ${riskTolerance === p.id ? p.color : '#E5E8E2'}`, borderRadius: 10, background: riskTolerance === p.id ? `${p.color}15` : '#fff', cursor: 'pointer', textAlign: 'center' }}>
              <p style={{ fontSize: '1.3rem', marginBottom: 4 }}>{p.emoji}</p>
              <p style={{ fontWeight: 700, fontSize: '0.8rem', color: riskTolerance === p.id ? p.color : '#0F211A' }}>{p.label}</p>
            </button>
          ))}
        </div>
      </div>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={run} disabled={loading || !amount}
        style={{ width: '100%', padding: '14px', background: loading ? '#9AA69F' : 'linear-gradient(135deg,#0E8F5B,#0B6E46)', color: '#fff', border: 'none', borderRadius: 12, fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        {loading ? <><div style={{ ...spinStyle, width: 18, height: 18, border: '2px solid #fff4', borderTopColor: '#fff', margin: 0 }} /> Calculating...</> : <><Zap size={16} /> Run Simulation <ChevronRight size={16} /></>}
      </motion.button>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function SimulatorPage() {
  const isMobile = useIsMobile()
  const [activeModule, setActiveModule] = useState('scenario')

  return (
    <div style={{ background: '#FBFBF8', minHeight: '100vh', padding: isMobile ? '20px 16px 80px' : '32px 24px 80px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E4F5EC', borderRadius: 20, padding: '6px 14px', marginBottom: 10 }}>
            <Zap size={13} color="#0E8F5B" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0E8F5B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Scenario Lab</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: isMobile ? '1.6rem' : '2rem', fontWeight: 700, color: '#0F211A', margin: '0 0 6px' }}>Investment Simulator</h1>
              {!isMobile && <p style={{ color: '#5B6B63', fontSize: '0.9rem', margin: 0 }}>Company-specific scenario analysis, stress tests, and what-if modelling powered by AI.</p>}
            </div>
            <AILangSelector />
          </div>
        </div>

        {/* Module selector — scrollable on mobile */}
        <div className="scroll-x" style={{ display: 'flex', gap: 10, marginBottom: 20, paddingBottom: 2 }}>
          {MODULES.map(m => (
            <button key={m.id} onClick={() => setActiveModule(m.id)}
              style={{ padding: '10px 14px', border: `2px solid ${activeModule === m.id ? '#0E8F5B' : '#E5E8E2'}`, borderRadius: 10, background: activeModule === m.id ? '#E4F5EC' : '#fff', cursor: 'pointer', flexShrink: 0 }}>
              <p style={{ fontWeight: 700, fontSize: '0.82rem', color: activeModule === m.id ? '#0E8F5B' : '#0F211A', margin: 0, whiteSpace: 'nowrap' }}>{m.label}</p>
            </button>
          ))}
        </div>

        <div style={{ background: '#F5F7F4', border: '1px solid #E5E8E2', borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
          <p style={{ fontSize: '0.85rem', color: '#5B6B63', margin: 0 }}>{MODULES.find(m => m.id === activeModule)?.desc}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeModule} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {activeModule === 'scenario' && <ScenarioModule />}
            {activeModule === 'stresstest' && <StressTestModule />}
            {activeModule === 'whatif' && <WhatIfModule />}
            {activeModule === 'quarterly' && <QuarterlyModule />}
            {activeModule === 'general' && <GeneralModule />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
