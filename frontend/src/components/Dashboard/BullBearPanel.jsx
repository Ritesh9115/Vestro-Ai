
import { SectionLabel } from '../MetricCard/MetricCard'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function BullBearPanel({ aiAnalysis }) {
  if (!aiAnalysis) return null

  const { bullPoints = [], bearPoints = [], risks = [] } = aiAnalysis

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div
          style={{
            background: '#E4F5EC',
            border: '1px solid #CDEBDB',
            borderRadius: 14,
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: '#0E8F5B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={14} color="#fff" />
            </div>
            <h4
              style={{
                margin: 0,
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#0B6E46',
              }}
            >
              Bull Case — Reasons to consider
            </h4>
          </div>
          <ul style={{ margin: 0, padding: '0 0 0 18px', color: '#0F211A' }}>
            {bullPoints.map((point, i) => (
              <li key={i} style={{ fontSize: '0.875rem', lineHeight: 1.65, marginBottom: 6 }}>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            background: '#FBEAE8',
            border: '1px solid #F3D4D0',
            borderRadius: 14,
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: '#C8443A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingDown size={14} color="#fff" />
            </div>
            <h4
              style={{
                margin: 0,
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#C8443A',
              }}
            >
              Bear Case — Reasons to be cautious
            </h4>
          </div>
          <ul style={{ margin: 0, padding: '0 0 0 18px', color: '#0F211A' }}>
            {bearPoints.map((point, i) => (
              <li key={i} style={{ fontSize: '0.875rem', lineHeight: 1.65, marginBottom: 6 }}>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {risks && risks.length > 0 && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E8E2',
            borderRadius: 14,
            padding: 20,
          }}
        >
          <SectionLabel>Key Risks</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {risks.map((risk, i) => {
              const severityColor =
                risk.severity === 'High' ? '#C8443A' : risk.severity === 'Medium' ? '#B8862E' : '#5B6B63'
              const severityBg =
                risk.severity === 'High' ? '#FBEAE8' : risk.severity === 'Medium' ? '#FBF3E2' : '#EFF1EC'
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: '#F5F7F4',
                    border: '1px solid #E5E8E2',
                    alignItems: 'flex-start',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: severityBg,
                      color: severityColor,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {risk.severity}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0F211A', marginBottom: 2 }}>
                      {risk.risk}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#5B6B63', lineHeight: 1.5 }}>
                      {risk.explanation}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
