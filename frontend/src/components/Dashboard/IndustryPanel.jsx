
import { SectionLabel } from '../MetricCard/MetricCard'
import { Users } from 'lucide-react'

export default function IndustryPanel({ company, peers }) {
  if (!company) return null

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E8E2',
        borderRadius: 14,
        padding: 22,
        marginBottom: 20,
        boxShadow: '0 1px 2px rgba(15,33,26,0.04)',
      }}
    >
      <SectionLabel>Industry & Peers</SectionLabel>

      <div style={{ display: 'flex', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
        <InfoItem label="Sector" value={company.sector || 'N/A'} />
        <InfoItem label="Industry" value={company.industry || 'N/A'} />
        <InfoItem label="Exchange" value={company.exchange || 'N/A'} />
        {company.employees && (
          <InfoItem
            label="Employees"
            value={Number(company.employees).toLocaleString()}
          />
        )}
        {company.ceo && <InfoItem label="CEO" value={company.ceo} />}
      </div>

      {peers && peers.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Users size={13} color="#9AA69F" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9AA69F', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Peer Companies
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {peers.slice(0, 8).map((peer) => (
              <a
                key={peer}
                href={`/research/${peer}`}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.75rem',
                  color: '#5B6B63',
                  background: '#EFF1EC',
                  border: '1px solid #E5E8E2',
                  padding: '5px 12px',
                  borderRadius: 99,
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0E8F5B'
                  e.currentTarget.style.color = '#0B6E46'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E8E2'
                  e.currentTarget.style.color = '#5B6B63'
                }}
              >
                {peer}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9AA69F', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0F211A' }}>{value}</div>
    </div>
  )
}
