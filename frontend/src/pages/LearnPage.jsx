import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

const LEARN_SECTIONS = [
  {
    id: 'profitability',
    title: 'Profitability Metrics',
    color: '#0E8F5B',
    metrics: [
      {
        name: 'Revenue',
        beginner: 'The total money a company earns from selling its products or services. Think of it as the top-line number — the total sales before any costs.',
        intermediate: 'Total sales income before deducting any expenses. Revenue growth indicates whether a company is expanding its market presence.',
        expert: 'Top-line income representing total business volume. Analyse YoY and CAGR alongside margin trends to distinguish volume growth from pricing power.',
      },
      {
        name: 'Net Profit / Net Income',
        beginner: 'What is left after the company pays all its bills — salaries, taxes, loans. If revenue is what you earn, net profit is what you actually keep.',
        intermediate: 'Revenue minus all expenses including COGS, operating costs, interest, and taxes. Net margin = Net Income / Revenue.',
        expert: 'Bottom-line profitability after all deductions. Analyse alongside operating income to isolate non-recurring items. Compare net margin trends to industry peers.',
      },
      {
        name: 'Gross Margin',
        beginner: 'What percentage of each sale remains after the basic cost of making the product. Higher is better — it means the product itself is profitable.',
        intermediate: '(Revenue - Cost of Goods Sold) / Revenue. Reflects pricing power and production efficiency. SaaS companies typically have 70%+, manufacturers 20-40%.',
        expert: 'Proxy for pricing power and operational leverage. Compare against competitors and track trend — a compressing gross margin often precedes earnings deterioration.',
      },
      {
        name: 'Operating Margin',
        beginner: 'Profit percentage after paying for employees, rent, and day-to-day operations — but before paying tax and loan interest.',
        intermediate: 'Operating Income / Revenue. Shows core business efficiency. Above 15% is generally healthy. Track trend across quarters.',
        expert: 'EBIT margin reflecting core operational performance, excluding financial structure and tax. Key for peer comparison since it strips out capital structure differences.',
      },
      {
        name: 'EBITDA',
        beginner: 'A way to measure how much cash a company generates from its core business, before accountants do their adjustments for depreciation and taxes.',
        intermediate: 'Earnings before Interest, Tax, Depreciation & Amortisation. Useful for comparing companies with different debt levels or accounting policies.',
        expert: 'EV/EBITDA is the primary valuation multiple in M&A. EBITDA strips D&A which are non-cash charges, providing a closer proxy to operating cash flow.',
      },
    ],
  },
  {
    id: 'returns',
    title: 'Return Metrics',
    color: '#6366F1',
    metrics: [
      {
        name: 'ROE — Return on Equity',
        beginner: 'How much profit a company makes for every rupee/dollar that shareholders have invested. Higher means the company is using your money efficiently.',
        intermediate: 'Net Income / Shareholders Equity. Shows management efficiency. Above 15% is considered good. Compare ROE vs ROCE to check if returns are leverage-driven.',
        expert: 'Decompose via DuPont: ROE = Net Margin × Asset Turnover × Equity Multiplier. High ROE from high leverage is a red flag; high ROE from high margins or turnover is sustainable.',
      },
      {
        name: 'ROCE — Return on Capital Employed',
        beginner: 'Similar to ROE, but includes borrowed money too. If ROCE is higher than ROE, the company is using debt efficiently rather than just borrowing to inflate returns.',
        intermediate: 'EBIT / (Total Equity + Total Debt). When ROCE > Cost of Debt, the company creates value from borrowing. ROCE > ROE signals non-leveraged returns.',
        expert: 'Superior metric to ROE for capital-intensive businesses. If ROCE > WACC, the company earns above its cost of capital — a core value creation signal.',
      },
      {
        name: 'ROA — Return on Assets',
        beginner: 'How much profit the company generates from all the assets it owns — factories, machines, cash. Higher is better.',
        intermediate: 'Net Income / Total Assets. Asset-light businesses (software, services) have higher ROA than asset-heavy ones (steel, real estate).',
        expert: 'Useful for intra-sector comparison where capital intensity is similar. For capital-light businesses, compare with sector average rather than absolute benchmarks.',
      },
    ],
  },
  {
    id: 'debt',
    title: 'Debt & Liquidity',
    color: '#C8443A',
    metrics: [
      {
        name: 'Debt to Equity',
        beginner: 'How much borrowed money the company uses compared to shareholder money. Low is safer — it means the company does not depend too much on loans.',
        intermediate: 'Total Debt / Shareholders Equity. Below 0.5 is considered conservative. Some industries like banking have high D/E by nature.',
        expert: 'Must be contextualised by industry and asset type. Compare net debt (debt minus cash) to equity for a cleaner picture. Rising D/E with falling ROCE is a warning sign.',
      },
      {
        name: 'Current Ratio',
        beginner: 'Can the company pay its short-term bills? Above 1.5 means yes, the company has enough short-term assets to cover short-term debt.',
        intermediate: 'Current Assets / Current Liabilities. Below 1 means the company may struggle to pay short-term obligations. Above 3 may indicate idle assets.',
        expert: 'Quick ratio (excluding inventory) is often more informative. Track trend in addition to absolute level. Inventory-heavy businesses naturally have higher current ratios.',
      },
      {
        name: 'Interest Coverage',
        beginner: 'How many times can the company pay its loan interest from its profits? Above 3x means it can comfortably afford its debt.',
        intermediate: 'EBIT / Interest Expense. Below 1.5 is a danger zone — the company may struggle to service debt. Banks typically require above 2.5.',
        expert: 'A declining interest coverage trend with rising debt often precedes financial distress. Analyse in conjunction with free cash flow coverage for a complete picture.',
      },
    ],
  },
  {
    id: 'valuation',
    title: 'Valuation',
    color: '#B8862E',
    metrics: [
      {
        name: 'PE Ratio',
        beginner: 'How much you are paying for each rupee/dollar of profit. PE of 20 means investors pay 20 rupees for every 1 rupee of annual profit. Lower can mean cheaper.',
        intermediate: "Price / EPS. Compare to sector average PE. A PE well above peers suggests high growth expectations. Compare to the company's own historical PE range.",
        expert: 'Forward PE is more useful than trailing. Analyse PE/Growth (PEG), PE relative to free cash flow yield, and peer comparison. Mean-reversion in PE is common in cycles.',
      },
      {
        name: 'PB Ratio',
        beginner: 'Price compared to the book value (what the company owns minus what it owes). Below 1 could mean undervalued — you are buying assets for less than their worth.',
        intermediate: 'Price / Book Value per Share. Asset-heavy companies are valued on PB. PB < 1 for non-financial companies often signals financial stress or value.',
        expert: 'For financial companies (banks, NBFCs), PB is the primary valuation metric. Adjust book value for intangibles and goodwill. ROE and PB should correlate positively.',
      },
      {
        name: 'PEG Ratio',
        beginner: 'PE adjusted for growth. A PEG below 1 suggests you might be getting growth at a fair price — like finding something on sale.',
        intermediate: 'PE / Earnings Growth Rate. Below 1 = potentially undervalued for a growth company. Above 2 = expensive relative to expected growth.',
        expert: 'Normalise the growth rate you use (5-year CAGR vs. 1-year). PEG is sensitive to which growth estimate you use — be conservative. More useful for consistent growers.',
      },
    ],
  },
]

export default function LearnPage() {
  const [openSection, setOpenSection] = useState('profitability')
  const [openMetric, setOpenMetric] = useState(null)
  const [mode, setMode] = useState('beginner')

  function toggleMetric(id) {
    setOpenMetric(openMetric === id ? null : id)
  }

  return (
    <div style={{ background: '#FBFBF8', minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 0' }}>
        <div style={{ marginBottom: 36 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.72rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#0B6E46',
              background: '#E4F5EC',
              padding: '6px 14px',
              borderRadius: 99,
              marginBottom: 16,
            }}
          >
            Financial Literacy
          </div>
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
              fontWeight: 600,
              color: '#0F211A',
              margin: '0 0 10px',
            }}
          >
            Understand every metric
          </h1>
          <p style={{ color: '#5B6B63', fontSize: '1rem', lineHeight: 1.65, margin: 0 }}>
            Beginner investors get plain English. Experts get the full picture. Select your level.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 32,
            background: '#EFF1EC',
            borderRadius: 12,
            padding: 4,
            width: 'fit-content',
          }}
        >
          {['beginner', 'intermediate', 'expert'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: '8px 18px',
                borderRadius: 9,
                border: 'none',
                background: mode === m ? '#FFFFFF' : 'transparent',
                color: mode === m ? '#0F211A' : '#9AA69F',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                textTransform: 'capitalize',
                boxShadow: mode === m ? '0 1px 4px rgba(15,33,26,0.08)' : 'none',
              }}
            >
              {m}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {LEARN_SECTIONS.map((section) => {
            const isOpen = openSection === section.id
            return (
              <div
                key={section.id}
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${isOpen ? section.color + '40' : '#E5E8E2'}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                  boxShadow: '0 1px 2px rgba(15,33,26,0.04)',
                }}
              >
                <button
                  onClick={() => setOpenSection(isOpen ? null : section.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px 22px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: section.color,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: '#0F211A',
                      }}
                    >
                      {section.title}
                    </span>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '0.7rem',
                        color: '#9AA69F',
                        background: '#EFF1EC',
                        padding: '2px 8px',
                        borderRadius: 6,
                      }}
                    >
                      {section.metrics.length} metrics
                    </span>
                  </div>
                  {isOpen ? <ChevronDown size={16} color="#9AA69F" /> : <ChevronRight size={16} color="#9AA69F" />}
                </button>

                {isOpen && (
                  <div style={{ borderTop: '1px solid #EFF1EC', padding: '4px 0 12px' }}>
                    {section.metrics.map((metric, i) => {
                      const metricId = `${section.id}-${i}`
                      const isMetricOpen = openMetric === metricId
                      return (
                        <div key={i}>
                          <button
                            onClick={() => toggleMetric(metricId)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '14px 22px',
                              background: isMetricOpen ? '#F5F7F4' : 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0F211A' }}>
                              {metric.name}
                            </span>
                            {isMetricOpen ? (
                              <ChevronDown size={14} color="#9AA69F" />
                            ) : (
                              <ChevronRight size={14} color="#9AA69F" />
                            )}
                          </button>

                          {isMetricOpen && (
                            <div
                              style={{
                                padding: '0 22px 16px',
                                background: '#FAFAFA',
                                borderTop: '1px solid #EFF1EC',
                              }}
                            >
                              <div
                                style={{
                                  display: 'inline-flex',
                                  gap: 6,
                                  marginBottom: 12,
                                  marginTop: 14,
                                }}
                              >
                                {['beginner', 'intermediate', 'expert'].map((m) => (
                                  <button
                                    key={m}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setMode(m)
                                    }}
                                    style={{
                                      padding: '3px 10px',
                                      borderRadius: 99,
                                      border: `1px solid ${mode === m ? '#0E8F5B' : '#E5E8E2'}`,
                                      background: mode === m ? '#E4F5EC' : 'transparent',
                                      color: mode === m ? '#0B6E46' : '#9AA69F',
                                      fontSize: '0.7rem',
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
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: '0.875rem',
                                  color: '#0F211A',
                                  lineHeight: 1.7,
                                }}
                              >
                                {metric[mode]}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
