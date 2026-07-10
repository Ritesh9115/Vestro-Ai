import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Link as LinkIcon, Building2 } from 'lucide-react';

function CompetitorBadge({ verdict }) {
  const colors = {
    INVEST: { bg: '#E4F5EC', color: '#0B6E46', border: '#CDEBDB' },
    WATCH: { bg: '#FBF3E2', color: '#B8862E', border: '#EDD99A' },
    SKIP: { bg: '#FBEAE8', color: '#C8443A', border: '#F3D4D0' },
  };
  const theme = colors[verdict] || colors.WATCH;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 12,
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        color: theme.color,
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {verdict === 'INVEST' && '🟢 '}
      {verdict === 'WATCH' && '🟡 '}
      {verdict === 'SKIP' && '🔴 '}
      {verdict}
    </span>
  );
}

function RelationshipBadge({ relationship }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 12,
        background: '#F0F4F8',
        border: '1px solid #D9E2EC',
        color: '#334E68',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {relationship}
    </span>
  );
}

function CompanyCard({ name, badge, summary }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E8E2',
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        boxShadow: '0 2px 8px rgba(15,33,26,0.02)',
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0F211A', fontWeight: 600, lineHeight: 1.3 }}>
            {name}
          </h3>
          {badge}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <p style={{ margin: 0, color: '#5B6B63', fontSize: '0.9rem', lineHeight: 1.4, flex: 1 }}>{summary}</p>
        
          <button
            onClick={() => navigate(`/research/${encodeURIComponent(name)}`)}
            style={{
              background: '#F5F7F4',
              color: '#0F211A',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s ease',
              marginLeft: 16,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#0F211A';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#F5F7F4';
              e.currentTarget.style.color = '#0F211A';
            }}
          >
            Research <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecommendationHub({ aiAnalysis }) {
  if (!aiAnalysis) return null;

  const { recommendationHub } = aiAnalysis;
  const competitors = recommendationHub?.competitors || [];
  const relatedCompanies = recommendationHub?.relatedCompanies || [];

  if (competitors.length === 0 && relatedCompanies.length === 0) {
    return (
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E8E2',
          borderRadius: 24,
          padding: 48,
          marginBottom: 24,
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(15,33,26,0.03)',
        }}
      >
        <h2 style={{ margin: '0 0 12px 0', fontSize: '1.4rem', color: '#0F211A', fontFamily: "'Fraunces', serif" }}>
          Recommendation Hub
        </h2>
        <p style={{ margin: 0, color: '#5B6B63', fontSize: '1rem' }}>
          No direct competitors or related companies could be identified for this asset at this time.
        </p>
      </div>
    );
  }

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
        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: '#0F211A', fontFamily: "'Fraunces', serif" }}>
          Recommendation Hub
        </h2>
        <p style={{ margin: 0, color: '#5B6B63', fontSize: '0.95rem' }}>
          Explore similar opportunities before making your final investment decision.
        </p>
      </div>

      {competitors.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={20} color="#0E8F5B" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0F211A', fontWeight: 600 }}>Competitors</h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#5B6B63', fontWeight: 500, background: '#F5F7F4', padding: '4px 10px', borderRadius: 12 }}>
              Source: Financial APIs
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {competitors.slice(0, 6).map((comp, idx) => (
              <CompanyCard
                key={`comp-${idx}`}
                name={comp.name}
                badge={<CompetitorBadge verdict={comp.verdict} />}
                summary={comp.summary}
              />
            ))}
          </div>
        </div>
      )}

      {relatedCompanies.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LinkIcon size={20} color="#0E8F5B" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0F211A', fontWeight: 600 }}>Related Companies</h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#5B6B63', fontWeight: 500, background: '#F5F7F4', padding: '4px 10px', borderRadius: 12 }}>
              Source: AI + Verification
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {relatedCompanies.slice(0, 6).map((rel, idx) => (
              <CompanyCard
                key={`rel-${idx}`}
                name={rel.name}
                badge={<RelationshipBadge relationship={rel.relationship} />}
                summary={rel.summary}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
