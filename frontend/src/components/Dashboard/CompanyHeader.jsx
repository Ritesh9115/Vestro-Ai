import { useState } from 'react'
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react'
import VerdictBadge from '../VerdictBadge/VerdictBadge'

export default function CompanyHeader({ company, aiAnalysis }) {
  const [isExpanded, setIsExpanded] = useState(false)
  if (!company) return null

  const changePositive = company.changePercent >= 0
  const changeText = `${changePositive ? '▲' : '▼'} ${Math.abs(company.changePercent || 0).toFixed(2)}%`

  const initials = company.symbol?.slice(0, 3) || '?'

  const isLongDescription = company.description && company.description.length > 200

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          background: '#FFFFFF',
          border: '1px solid #E5E8E2',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 1px 2px rgba(15,33,26,0.04), 0 8px 24px rgba(15,33,26,0.05)',
          height: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, width: '100%' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #123B2C 0%, #0E8F5B 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 600,
              fontSize: '0.9rem',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#0F211A' }}>
              {company.name}
            </h2>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 4,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.75rem',
                  color: '#5B6B63',
                  background: '#EFF1EC',
                  padding: '2px 8px',
                  borderRadius: 6,
                }}
              >
                {company.symbol}
              </span>
              {company.exchange && (
                <span style={{ fontSize: '0.8rem', color: '#9AA69F' }}>{company.exchange}</span>
              )}
              {company.sector && (
                <span style={{ fontSize: '0.8rem', color: '#9AA69F' }}>· {company.sector}</span>
              )}
            </div>
          </div>
          
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '1.6rem',
                fontWeight: 600,
                color: '#0F211A',
              }}
            >
              {company.price != null ? `₹${Number(company.price).toFixed(2)}` : 'N/A'}
            </div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.8rem',
                fontWeight: 600,
                color: changePositive ? '#0E8F5B' : '#C8443A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 4,
              }}
            >
              {changePositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {changeText} today
            </div>
          </div>
        </div>

        {company.description && (
          <div
            style={{
              width: '100%',
              borderTop: '1px solid #EFF1EC',
              paddingTop: 14,
              marginTop: 4,
            }}
          >
            <div
              style={{
                margin: 0,
                fontSize: '0.85rem',
                color: '#5B6B63',
                lineHeight: 1.65,
                maxHeight: isExpanded ? 150 : 'none',
                overflowY: isExpanded ? 'auto' : 'hidden',
                paddingRight: isExpanded ? 8 : 0,
              }}
            >
              {isExpanded ? company.description : (isLongDescription ? `${company.description.slice(0, 200)}...` : company.description)}
            </div>
            {isLongDescription && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0E8F5B',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  marginTop: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                {isExpanded ? 'Read Less' : 'Read More'}
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
