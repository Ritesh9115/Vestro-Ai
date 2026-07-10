import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight } from 'lucide-react'

const QUICK_PICKS = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Google' },
  { symbol: 'TCS.NS', name: 'TCS' },
  { symbol: 'RELIANCE.NS', name: 'Reliance' },
]

export default function SearchBar({ large = false, onSearch }) {
  const [inputValue, setInputValue] = useState('')
  const navigate = useNavigate()

  function handleInputChange(e) {
    setInputValue(e.target.value)
  }

  function goToResearch(symbol) {
    setInputValue(symbol)
    if (onSearch) onSearch(symbol)
    navigate(`/research/${encodeURIComponent(symbol)}`)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!inputValue.trim()) return
    const symbol = inputValue.trim()
    goToResearch(symbol)
  }

  const fontSize = large ? '1rem' : '0.9rem'
  const padding = large ? '14px 18px' : '10px 14px'

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#FFFFFF',
            border: '1.5px solid #E5E8E2',
            borderRadius: 14,
            padding: large ? '8px 8px 8px 18px' : '6px 6px 6px 14px',
            boxShadow: '0 1px 2px rgba(15,33,26,0.04), 0 8px 24px rgba(15,33,26,0.05)',
          }}
        >
          <Search size={18} color="#9AA69F" style={{ flexShrink: 0 }} />
          <input
            value={inputValue}
            onChange={handleInputChange}
            placeholder={large ? 'Try "AAPL", "TCS.NS" or "Reliance"...' : 'Search company or symbol...'}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize,
              fontFamily: "'Inter', sans-serif",
              padding: '8px 0',
              background: 'transparent',
              color: '#0F211A',
            }}
          />
          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #0E8F5B 0%, #0B6E46 100%)',
              color: '#fff',
              border: 'none',
              padding,
              borderRadius: 10,
              fontWeight: 600,
              fontSize,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Analyse
            <ArrowRight size={14} />
          </button>
        </div>
      </form>



      {large && (
        <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {QUICK_PICKS.map((pick) => (
            <button
              key={pick.symbol}
              onClick={() => goToResearch(pick.symbol)}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.75rem',
                color: '#5B6B63',
                background: '#EFF1EC',
                border: '1px solid #E5E8E2',
                padding: '6px 12px',
                borderRadius: 99,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0E8F5B'
                e.currentTarget.style.color = '#0B6E46'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E8E2'
                e.currentTarget.style.color = '#5B6B63'
              }}
            >
              {pick.symbol}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes sbSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
