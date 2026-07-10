import React from 'react'
import { SectionLabel } from '../MetricCard/MetricCard'
import { CheckCircle, XCircle, MinusCircle, Info } from 'lucide-react'
import { useExperience } from '../../context/ExperienceContext'

function CheckIcon({ passed }) {
  if (passed === true) return <CheckCircle size={18} color="#0E8F5B" style={{ flexShrink: 0 }} />
  if (passed === false) return <XCircle size={18} color="#C8443A" style={{ flexShrink: 0 }} />
  return <MinusCircle size={18} color="#B8862E" style={{ flexShrink: 0 }} />
}

export default function ExplainableAI({ aiAnalysis }) {
  const { mode, setMode } = useExperience()
  if (!aiAnalysis) return null

  const { explainableChecks = [], missingInformation = [] } = aiAnalysis

  return (
    <div>
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E8E2',
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
          boxShadow: '0 2px 8px rgba(15,33,26,0.03)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <SectionLabel>Explainable AI Metrics</SectionLabel>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.75rem', color: '#9AA69F', fontWeight: 600 }}>Mode:</span>
            {['beginner', 'intermediate', 'expert'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 99,
                  border: `1px solid ${mode === m ? '#0E8F5B' : '#E5E8E2'}`,
                  background: mode === m ? '#E4F5EC' : 'transparent',
                  color: mode === m ? '#0B6E46' : '#9AA69F',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {explainableChecks.map((check, index) => (
            <div
              key={index}
              style={{
                borderRadius: 12,
                border: '1px solid #E5E8E2',
                background: check.passed === true ? '#F9FEFC' : check.passed === false ? '#FEF9F9' : '#FDFBF6',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E8E2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckIcon passed={check.passed} />
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0F211A' }}>
                    {check.checkName}
                  </span>
                </div>
                {check.value && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.75rem', color: '#9AA69F', textTransform: 'uppercase', fontWeight: 600 }}>Value</span>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#0F211A',
                        background: '#EFF1EC',
                        padding: '4px 8px',
                        borderRadius: 6,
                      }}
                    >
                      {check.value}
                    </span>
                  </div>
                )}
              </div>
              
              <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#5B6B63', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Info size={14} /> Why It Matters
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#0F211A', lineHeight: 1.6 }}>
                    {check.whyItMatters}
                  </p>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#5B6B63', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Info size={14} /> How it Affected Verdict
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#0F211A', lineHeight: 1.6 }}>
                    {check.howItAffectedVerdict}
                  </p>
                </div>
              </div>

              <div style={{ padding: '12px 20px', background: '#F5F7F4', borderTop: '1px solid #E5E8E2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', color: '#9AA69F', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
                    AI Explanation ({mode} mode)
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#5B6B63', lineHeight: 1.5 }}>
                    {check.explanation?.[mode] || check.explanation?.beginner || 'No explanation provided.'}
                  </div>
                </div>
                {check.source && (
                  <div style={{ marginLeft: 20, textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: '#9AA69F', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Source</div>
                    <div style={{ fontSize: '0.8rem', color: '#0F211A', fontWeight: 500 }}>{check.source}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {missingInformation && missingInformation.length > 0 && (
        <div
          style={{
            background: '#FBF3E2',
            border: '1px solid #EDD99A',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 2px 8px rgba(15,33,26,0.03)',
          }}
        >
          <SectionLabel>Missing Information</SectionLabel>
          <p style={{ margin: '0 0 16px', fontSize: '0.9rem', color: '#5B6B63', lineHeight: 1.6 }}>
            The following data was not available, which may reduce the AI's confidence in its verdict:
          </p>
          <ul style={{ margin: 0, padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {missingInformation.map((item, i) => (
              <li key={i} style={{ fontSize: '0.85rem', color: '#0F211A', lineHeight: 1.5 }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
