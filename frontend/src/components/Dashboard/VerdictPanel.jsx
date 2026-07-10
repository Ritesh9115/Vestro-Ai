import React from 'react'
import { AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, ShieldAlert, Activity, BookOpen, UserCheck, Crosshair } from 'lucide-react'

function VerdictBadgeLarge({ verdict }) {
  const colors = {
    INVEST: { bg: '#E4F5EC', color: '#0B6E46', border: '#CDEBDB' },
    WATCH: { bg: '#FBF3E2', color: '#B8862E', border: '#EDD99A' },
    SKIP: { bg: '#FBEAE8', color: '#C8443A', border: '#F3D4D0' },
  }
  const theme = colors[verdict] || colors.WATCH

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 48px',
        borderRadius: 16,
        background: theme.bg,
        border: `2px solid ${theme.border}`,
        color: theme.color,
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '2rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}
    >
      {verdict}
    </div>
  )
}

function SectionCard({ title, icon: Icon, children, theme = 'default' }) {
  const themes = {
    default: { bg: '#F5F7F4', border: '#E5E8E2', titleColor: '#5B6B63' },
    success: { bg: '#E4F5EC', border: '#CDEBDB', titleColor: '#0B6E46' },
    warning: { bg: '#FBF3E2', border: '#EDD99A', titleColor: '#B8862E' },
    danger: { bg: '#FBEAE8', border: '#F3D4D0', titleColor: '#C8443A' },
  }
  const active = themes[theme]

  return (
    <div style={{ background: active.bg, border: `1px solid ${active.border}`, borderRadius: 12, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon size={18} color={active.titleColor} />
        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: active.titleColor, letterSpacing: '0.04em' }}>
          {title}
        </span>
      </div>
      <div style={{ fontSize: '0.9rem', color: '#0F211A', lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  )
}

function ListContent({ items }) {
  if (!items || items.length === 0) return <span style={{ color: '#9AA69F' }}>None identified.</span>
  return (
    <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  )
}

export default function VerdictPanel({ aiAnalysis }) {
  if (!aiAnalysis) return null

  const {
    verdict,
    decisionStrength,
    healthScore,
    confidence,
    investmentThesis,
    recommendedAction,
    topReasons = [],
    keyRisks = [],
    businessQuality,
    valuationSignal,
    riskLevel,
    futureOutlook,
    nextResearchStep,
    missingInformation = [],
    suitableInvestor
  } = aiAnalysis

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E8E2',
        borderRadius: 24,
        padding: 32,
        marginBottom: 24,
        boxShadow: '0 4px 12px rgba(15,33,26,0.03)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '0.85rem', color: '#9AA69F', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          AI Research Verdict
        </h2>
        <VerdictBadgeLarge verdict={verdict} />
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 32 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", color: '#0F211A' }}>{decisionStrength}<span style={{ fontSize: '1rem', color: '#9AA69F' }}>/10</span></div>
            <div style={{ fontSize: '0.75rem', color: '#5B6B63', textTransform: 'uppercase', marginTop: 4, letterSpacing: '0.04em' }}>Decision Strength</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", color: '#0F211A' }}>{healthScore}<span style={{ fontSize: '1rem', color: '#9AA69F' }}>/100</span></div>
            <div style={{ fontSize: '0.75rem', color: '#5B6B63', textTransform: 'uppercase', marginTop: 4, letterSpacing: '0.04em' }}>Health Score</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", color: '#0F211A' }}>{confidence}%</div>
            <div style={{ fontSize: '0.75rem', color: '#5B6B63', textTransform: 'uppercase', marginTop: 4, letterSpacing: '0.04em' }}>AI Confidence</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: 1.7, color: '#0F211A', textAlign: 'center', maxWidth: 800, marginInline: 'auto', fontWeight: 500 }}>
          {investmentThesis}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 32 }}>
        {verdict === 'INVEST' && (
          <>
            <SectionCard title="Why Invest & Top Strengths" icon={TrendingUp} theme="success">
              <ListContent items={topReasons} />
            </SectionCard>
            <SectionCard title="Main Risks" icon={AlertTriangle} theme="warning">
              <ListContent items={keyRisks} />
            </SectionCard>
            <SectionCard title="Recommended Action" icon={CheckCircle} theme="default">
              {recommendedAction}
            </SectionCard>
            <SectionCard title="Next Event to Watch" icon={Clock} theme="default">
              {futureOutlook}
            </SectionCard>
          </>
        )}

        {verdict === 'WATCH' && (
          <>
            <SectionCard title="Why Wait" icon={Clock} theme="warning">
              <ListContent items={topReasons} />
            </SectionCard>
            <SectionCard title="What Should Improve" icon={TrendingUp} theme="default">
              {futureOutlook}
            </SectionCard>
            <SectionCard title="Missing Information" icon={AlertTriangle} theme="danger">
              <ListContent items={missingInformation} />
            </SectionCard>
            <SectionCard title="Next Research Step & Trigger" icon={Crosshair} theme="default">
              {nextResearchStep}
            </SectionCard>
          </>
        )}

        {verdict === 'SKIP' && (
          <>
            <SectionCard title="Why Avoid" icon={ShieldAlert} theme="danger">
              <ListContent items={topReasons} />
            </SectionCard>
            <SectionCard title="Major Red Flags" icon={AlertTriangle} theme="danger">
              <ListContent items={keyRisks} />
            </SectionCard>
            <SectionCard title="What Needs to Improve" icon={TrendingUp} theme="warning">
              {futureOutlook}
            </SectionCard>
            <SectionCard title="Future Reconsideration" icon={Clock} theme="default">
              {nextResearchStep}
            </SectionCard>
          </>
        )}
      </div>

      <div style={{ borderTop: '1px solid #E5E8E2', paddingTop: 24, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#9AA69F', textTransform: 'uppercase', marginBottom: 4 }}>Business Quality</div>
          <div style={{ fontSize: '0.9rem', color: '#0F211A', fontWeight: 500 }}>{businessQuality}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#9AA69F', textTransform: 'uppercase', marginBottom: 4 }}>Valuation Signal</div>
          <div style={{ fontSize: '0.9rem', color: '#0F211A', fontWeight: 500 }}>{valuationSignal}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#9AA69F', textTransform: 'uppercase', marginBottom: 4 }}>Risk Level</div>
          <div style={{ fontSize: '0.9rem', color: '#0F211A', fontWeight: 500 }}>{riskLevel}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#9AA69F', textTransform: 'uppercase', marginBottom: 4 }}>Suitable Investor</div>
          <div style={{ fontSize: '0.9rem', color: '#0F211A', fontWeight: 500 }}>{suitableInvestor}</div>
        </div>
      </div>
    </div>
  )
}
