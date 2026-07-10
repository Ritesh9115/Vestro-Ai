export function flagColor(signal) {
  const goodSignals = ['Strong', 'Low', 'Positive', 'Accelerating', 'Undervalued', 'Excellent', 'Good', 'Healthy', 'Fair']
  const badSignals = ['Weak', 'High', 'Negative', 'Declining', 'Overvalued', 'Poor']
  const warnSignals = ['Moderate', 'Neutral', 'Decelerating', 'Slowing', 'Average']

  if (goodSignals.some((s) => signal?.includes(s))) {
    return { bg: '#E4F5EC', color: '#0B6E46', border: '#CDEBDB' }
  }
  if (badSignals.some((s) => signal?.includes(s))) {
    return { bg: '#FBEAE8', color: '#C8443A', border: '#F3D4D0' }
  }
  if (warnSignals.some((s) => signal?.includes(s))) {
    return { bg: '#FBF3E2', color: '#B8862E', border: '#EDD99A' }
  }
  return { bg: '#EFF1EC', color: '#5B6B63', border: '#E5E8E2' }
}

export function MetricFlag({ label }) {
  const colors = flagColor(label)
  return (
    <span
      style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 6,
        background: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`,
      }}
    >
      {label}
    </span>
  )
}

export function MetricCard({ name, value, benchmark, signal }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E8E2',
        borderRadius: 12,
        padding: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '0.75rem', color: '#5B6B63', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {name}
        </span>
        {signal && <MetricFlag label={signal} />}
      </div>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '1.3rem',
          fontWeight: 600,
          color: '#0F211A',
          marginTop: 6,
        }}
      >
        {value ?? 'N/A'}
      </div>
      {benchmark && (
        <div style={{ fontSize: '0.7rem', color: '#9AA69F', marginTop: 4 }}>{benchmark}</div>
      )}
    </div>
  )
}

export function SectionLabel({ children }) {
  return (
    <h3
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: '#9AA69F',
        fontWeight: 700,
        margin: '0 0 14px',
      }}
    >
      {children}
    </h3>
  )
}
