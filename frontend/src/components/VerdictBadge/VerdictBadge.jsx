const VERDICT_CONFIG = {
  INVEST: {
    color: '#0E8F5B',
    bg: '#E4F5EC',
    border: '#CDEBDB',
    dot: '#0E8F5B',
    emoji: '🟢',
  },
  WATCH: {
    color: '#B8862E',
    bg: '#FBF3E2',
    border: '#EDD99A',
    dot: '#B8862E',
    emoji: '🟡',
  },
  SKIP: {
    color: '#C8443A',
    bg: '#FBEAE8',
    border: '#F3D4D0',
    dot: '#C8443A',
    emoji: '🔴',
  },
}

export default function VerdictBadge({ verdict, size = 'md' }) {
  const config = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.WATCH
  const isLarge = size === 'lg'

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isLarge ? 10 : 7,
        padding: isLarge ? '10px 20px' : '6px 14px',
        borderRadius: 99,
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
      }}
    >
      <span
        style={{
          fontWeight: 700,
          fontSize: isLarge ? '1rem' : '0.8rem',
          letterSpacing: '0.04em',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {verdict}
      </span>
    </div>
  )
}
