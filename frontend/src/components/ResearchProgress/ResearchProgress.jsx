import { CheckCircle, Circle } from 'lucide-react'

const STEPS = [
  { id: 'start', label: 'Research Started', detail: 'Initialising AI research pipeline...' },
  { id: 'financial', label: 'Collecting Financial Data', detail: 'Fetching income statements, balance sheets and cash flows...' },
  { id: 'news', label: 'Reading News', detail: 'Scanning recent news and market sentiment...' },
  { id: 'industry', label: 'Comparing Industry', detail: 'Benchmarking against sector peers...' },
  { id: 'risks', label: 'Analysing Risks', detail: 'Identifying bull and bear signals...' },
  { id: 'verdict', label: 'Generating Verdict', detail: 'Running explainable AI analysis...' },
  { id: 'complete', label: 'Completed', detail: 'Research complete.' },
]

export { STEPS }

export default function ResearchProgress({ currentStep }) {
  const activeStep = STEPS[currentStep] || STEPS[0]

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E8E2',
        borderRadius: 16,
        padding: 28,
        maxWidth: 560,
        margin: '0 auto',
        boxShadow: '0 1px 2px rgba(15,33,26,0.04), 0 8px 24px rgba(15,33,26,0.05)',
      }}
    >
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.75rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#0B6E46',
            background: '#E4F5EC',
            padding: '6px 12px',
            borderRadius: 99,
            marginBottom: 12,
          }}
        >
          AI Research Pipeline
        </div>
        <h3
          style={{
            margin: 0,
            fontFamily: "'Fraunces', serif",
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#0F211A',
          }}
        >
          {activeStep.label}
        </h3>
        <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#5B6B63' }}>
          {activeStep.detail}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {STEPS.map((step, index) => {
          const isDone = index < currentStep
          const isActive = index === currentStep
          const isPending = index > currentStep

          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 10,
                background: isActive ? '#E4F5EC' : isDone ? '#F5F7F4' : 'transparent',
                border: `1px solid ${isActive ? '#CDEBDB' : isDone ? '#E5E8E2' : 'transparent'}`,
              }}
            >
              {isDone ? (
                <CheckCircle size={16} color="#0E8F5B" style={{ flexShrink: 0 }} />
              ) : isActive ? (
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: '2px solid #0E8F5B',
                    borderTopColor: 'transparent',
                    animation: 'rpSpin 0.8s linear infinite',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <Circle size={16} color="#C5CBC3" style={{ flexShrink: 0 }} />
              )}

              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#0B6E46' : isDone ? '#0F211A' : '#9AA69F',
                }}
              >
                {step.label}
              </span>

              {isActive && (
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: '#0E8F5B',
                        animation: 'rpPulse 1s infinite',
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes rpSpin { to { transform: rotate(360deg); } }
        @keyframes rpBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes rpPulse { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }
      `}</style>
    </div>
  )
}
