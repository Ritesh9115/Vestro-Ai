import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, ArrowRight, X, TrendingUp } from 'lucide-react'
import { searchCompanies } from '../../services/api'
import { useIsMobile } from '../../hooks/useIsMobile'

const QUICK_PICKS = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Google' },
  { symbol: 'TCS.NS', name: 'TCS' },
  { symbol: 'RELIANCE.NS', name: 'Reliance' },
]

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function SearchBar({ large = false, onSearch, autoFocus = false }) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const debouncedQuery = useDebounce(inputValue, 280)

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus()
  }, [autoFocus])

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }
    let cancelled = false
    setLoading(true)
    searchCompanies(debouncedQuery.trim())
      .then(data => {
        if (!cancelled) {
          setSuggestions(data?.slice(0, 7) || [])
          setShowDropdown(true)
          setActiveIdx(-1)
        }
      })
      .catch(() => { if (!cancelled) setSuggestions([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [debouncedQuery])

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function goToResearch(symbol) {
    setInputValue(symbol)
    setShowDropdown(false)
    setSuggestions([])
    if (onSearch) onSearch(symbol)
    navigate(`/research/${encodeURIComponent(symbol)}`)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (activeIdx >= 0 && suggestions[activeIdx]) {
      goToResearch(suggestions[activeIdx].symbol)
    } else if (inputValue.trim()) {
      goToResearch(inputValue.trim().toUpperCase())
    }
  }

  function handleKeyDown(e) {
    if (!showDropdown || suggestions.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)) }
    if (e.key === 'Escape') { setShowDropdown(false); setActiveIdx(-1) }
  }

  const btnPadding = large ? '10px 18px' : '8px 14px'
  const btnFontSize = large ? '1rem' : '0.85rem'

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        {/* Input row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          background: '#FFFFFF',
          border: `1.5px solid ${showDropdown && suggestions.length > 0 ? '#0E8F5B' : '#E5E8E2'}`,
          borderRadius: showDropdown && suggestions.length > 0 ? '16px 16px 0 0' : 16,
          padding: '4px 4px 4px 16px',
          boxShadow: '0 4px 12px rgba(15,33,26,0.05)',
          transition: 'border-color 0.2s, border-radius 0.2s',
        }}>
          {/* Loading spinner or search icon */}
          {loading
            ? <div style={{ width: 18, height: 18, border: '2px solid #E5E8E2', borderTopColor: '#0E8F5B', borderRadius: '50%', animation: 'sbSpin 0.7s linear infinite', flexShrink: 0 }} />
            : <SearchIcon size={18} color="#9AA69F" style={{ flexShrink: 0 }} />
          }

          <input
            ref={inputRef}
            value={inputValue}
            onChange={e => {
              setInputValue(e.target.value)
              if (!e.target.value) { setSuggestions([]); setShowDropdown(false) }
            }}
            onKeyDown={handleKeyDown}
            placeholder={isMobile ? 'Search stocks...' : (large ? 'Try "TCS", "RELIANCE" or "AAPL"...' : 'Search company or symbol...')}
            autoComplete="off"
            style={{
              flex: 1, border: 'none', outline: 'none',
              padding: isMobile
                ? '14px 8px'
                : large ? '10px 130px 10px 12px' : '10px 100px 10px 12px',
              fontSize: large ? '1rem' : '0.9rem',
              background: 'transparent', color: '#0F211A',
              fontFamily: "'Inter', sans-serif",
            }}
          />

          {/* Clear button */}
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue('')
                setSuggestions([])
                setShowDropdown(false)
                inputRef.current?.focus()
              }}
              style={{
                position: 'absolute',
                right: isMobile ? 12 : large ? 128 : 98,
                top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                cursor: 'pointer', color: '#9AA69F', padding: 4,
                display: 'flex', alignItems: 'center',
              }}
            >
              <X size={14} />
            </button>
          )}

          {/* Desktop Analyse button — inside the input row */}
          {!isMobile && (
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #0E8F5B 0%, #0B6E46 100%)',
                color: '#fff', border: 'none',
                padding: btnPadding, borderRadius: 10,
                fontWeight: 600, fontSize: btnFontSize, whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 6,
                cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                flexShrink: 0,
              }}
            >
              Analyse <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* Mobile: Analyse button below the input */}
        {isMobile && (
          <button
            type="submit"
            style={{
              width: '100%', marginTop: 10,
              background: 'linear-gradient(135deg, #0E8F5B 0%, #0B6E46 100%)',
              color: '#fff', border: 'none',
              padding: large ? '14px' : '12px',
              borderRadius: 12, fontWeight: 700, fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              boxShadow: '0 4px 16px rgba(14,143,91,0.25)',
            }}
          >
            Analyse <ArrowRight size={16} />
          </button>
        )}
      </form>

      {/* Live suggestions dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: isMobile ? 'calc(100% - 2px)' : 'calc(100% - 2px)',
          left: 0, right: 0, zIndex: 200,
          background: '#fff',
          border: '1.5px solid #0E8F5B', borderTop: 'none',
          borderRadius: '0 0 14px 14px',
          boxShadow: '0 12px 40px rgba(15,33,26,0.12)',
          overflow: 'hidden',
        }}>
          {suggestions.map((s, i) => (
            <button
              key={s.symbol}
              onMouseDown={() => goToResearch(s.symbol)}
              onMouseEnter={() => setActiveIdx(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '11px 18px',
                border: 'none',
                background: i === activeIdx ? '#F0FAF5' : 'transparent',
                cursor: 'pointer', textAlign: 'left',
                borderBottom: i < suggestions.length - 1 ? '1px solid #F5F7F4' : 'none',
                transition: 'background 0.15s',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: '#E4F5EC',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <TrendingUp size={15} color="#0E8F5B" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F211A', fontFamily: "'IBM Plex Mono', monospace" }}>
                  {s.symbol}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9AA69F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.name}
                </div>
              </div>
              <span style={{
                fontSize: '0.68rem', padding: '3px 8px', borderRadius: 6,
                background: '#F5F7F4', color: '#9AA69F', fontWeight: 600, letterSpacing: '0.04em',
              }}>
                {s.exchange || s.type || 'EQUITY'}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Quick picks (large mode only) */}
      {large && (
        <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {QUICK_PICKS.map((pick) => (
            <button
              key={pick.symbol}
              onClick={() => goToResearch(pick.symbol)}
              style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem',
                color: '#5B6B63', background: '#EFF1EC', border: '1px solid #E5E8E2',
                padding: '6px 12px', borderRadius: 99, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#0E8F5B'; e.currentTarget.style.color = '#0B6E46' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E8E2'; e.currentTarget.style.color = '#5B6B63' }}
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
