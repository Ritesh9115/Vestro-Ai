import { SectionLabel } from '../MetricCard/MetricCard'
import { ExternalLink, Clock } from 'lucide-react'

export default function NewsPanel({ news }) {
  if (!news || news.length === 0) {
    return (
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E8E2',
          borderRadius: 14,
          padding: 28,
          textAlign: 'center',
          color: '#9AA69F',
          fontSize: '0.875rem',
        }}
      >
        No recent news available. News API key may not be configured.
      </div>
    )
  }

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E8E2',
        borderRadius: 14,
        padding: 22,
        boxShadow: '0 1px 2px rgba(15,33,26,0.04)',
      }}
    >
      <SectionLabel>Recent News & Developments</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {news.map((article, index) => (
          <a
            key={index}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              gap: 14,
              padding: '14px 16px',
              borderRadius: 12,
              border: '1px solid #E5E8E2',
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0E8F5B'
              e.currentTarget.style.background = '#F5F7F4'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E8E2'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: '#0F211A',
                  lineHeight: 1.4,
                  marginBottom: 6,
                }}
              >
                {article.title}
              </div>
              {article.description && (
                <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#5B6B63', lineHeight: 1.55 }}>
                  {article.description?.slice(0, 160)}
                  {article.description?.length > 160 ? '...' : ''}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '0.7rem',
                    color: '#9AA69F',
                  }}
                >
                  {article.source}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: '#9AA69F' }}>
                  <Clock size={11} />
                  {article.publishedAt?.slice(0, 10)}
                </span>
              </div>
            </div>
            <ExternalLink size={14} color="#9AA69F" style={{ flexShrink: 0, marginTop: 4 }} />
          </a>
        ))}
      </div>
    </div>
  )
}
