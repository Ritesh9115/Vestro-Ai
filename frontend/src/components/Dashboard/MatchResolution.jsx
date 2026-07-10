import React from 'react'
import { CheckCircle2 } from 'lucide-react'

export default function MatchResolution({ matchData }) {
  if (!matchData) return null

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E8E2',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 1px 2px rgba(15,33,26,0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <CheckCircle2 size={18} color="#0E8F5B" />
        <h4 style={{ margin: 0, fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.85rem', textTransform: 'uppercase', color: '#0B6E46', letterSpacing: '0.04em' }}>
          Match Resolved
        </h4>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#9AA69F', marginBottom: 4 }}>Searching For</div>
          <div style={{ fontSize: '0.9rem', color: '#0F211A', fontWeight: 500 }}>{matchData.query}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#9AA69F', marginBottom: 4 }}>Matched Company</div>
          <div style={{ fontSize: '0.9rem', color: '#0F211A', fontWeight: 600 }}>{matchData.name}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#9AA69F', marginBottom: 4 }}>Ticker</div>
          <div style={{ fontSize: '0.9rem', color: '#0F211A', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>{matchData.symbol}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#9AA69F', marginBottom: 4 }}>Confidence</div>
          <div style={{ fontSize: '0.9rem', color: matchData.confidenceScore > 80 ? '#0E8F5B' : '#B8862E', fontWeight: 600 }}>{matchData.confidenceScore}%</div>
        </div>
      </div>

      <div style={{ background: '#F5F7F4', borderRadius: 8, padding: 12, marginTop: 'auto' }}>
        <div style={{ fontSize: '0.7rem', color: '#5B6B63', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase' }}>Reason</div>
        <div style={{ fontSize: '0.85rem', color: '#0F211A', lineHeight: 1.5 }}>{matchData.matchReason}</div>
      </div>
    </div>
  )
}
