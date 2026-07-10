
import { MetricCard, SectionLabel } from '../MetricCard/MetricCard'

function formatVal(value, type = 'number') {
  if (value === null || value === undefined || isNaN(value)) return 'N/A'
  const num = parseFloat(value)
  if (type === 'percent') return `${num.toFixed(2)}%`
  if (type === 'multiple') return `${num.toFixed(2)}x`
  if (type === 'currency') {
    if (Math.abs(num) >= 1e12) return `₹${(num / 1e12).toFixed(2)}T`
    if (Math.abs(num) >= 1e9) return `₹${(num / 1e9).toFixed(2)}B`
    if (Math.abs(num) >= 1e7) return `₹${(num / 1e7).toFixed(2)}Cr`
    if (Math.abs(num) >= 1e5) return `₹${(num / 1e5).toFixed(2)}L`
    return `₹${num.toFixed(2)}`
  }
  return num.toFixed(2)
}

export default function FinancialMetrics({ financials, aiAnalysis }) {
  if (!financials) return null

  const profitabilityMetrics = [
    {
      name: 'Revenue',
      value: formatVal(financials.revenue, 'currency'),
      benchmark: `FY ${financials.fiscalYear}`,
      signal: null,
    },
    {
      name: 'Net Income',
      value: formatVal(financials.netIncome, 'currency'),
      benchmark: `Net Margin ${formatVal(financials.netMargin, 'percent')}`,
      signal: financials.netMargin > 15 ? 'Strong' : financials.netMargin > 5 ? 'Moderate' : 'Weak',
    },
    {
      name: 'Gross Margin',
      value: formatVal(financials.grossMargin, 'percent'),
      benchmark: 'Higher is better',
      signal: financials.grossMargin > 40 ? 'Strong' : financials.grossMargin > 20 ? 'Moderate' : 'Weak',
    },
    {
      name: 'Operating Margin',
      value: formatVal(financials.operatingMargin, 'percent'),
      benchmark: 'Above 15% is healthy',
      signal: financials.operatingMargin > 20 ? 'Strong' : financials.operatingMargin > 10 ? 'Moderate' : 'Weak',
    },
    {
      name: 'EBITDA',
      value: formatVal(financials.ebitda, 'currency'),
      benchmark: 'Earnings before interest & tax',
      signal: null,
    },
    {
      name: 'EPS',
      value: formatVal(financials.eps, 'number'),
      benchmark: `EPS growth: ${formatVal(financials.epsGrowth, 'percent')}`,
      signal: financials.epsGrowth > 10 ? 'Strong' : financials.epsGrowth > 0 ? 'Stable' : 'Declining',
    },
  ]

  const returnMetrics = [
    {
      name: 'ROE',
      value: formatVal(financials.roe, 'percent'),
      benchmark: 'Benchmark: >15%',
      signal: financials.roe > 20 ? 'Strong' : financials.roe > 10 ? 'Moderate' : 'Weak',
    },
    {
      name: 'ROA',
      value: formatVal(financials.roa, 'percent'),
      benchmark: 'Benchmark: >5%',
      signal: financials.roa > 10 ? 'Strong' : financials.roa > 5 ? 'Moderate' : 'Weak',
    },
    {
      name: 'ROCE',
      value: formatVal(financials.roce, 'percent'),
      benchmark: 'ROCE > ROE = efficient',
      signal: financials.roce > financials.roe ? 'Strong' : 'Moderate',
    },
    {
      name: 'Revenue Growth',
      value: formatVal(financials.revenueGrowth, 'percent'),
      benchmark: 'Year-over-year',
      signal: financials.revenueGrowth > 10 ? 'Strong' : financials.revenueGrowth > 0 ? 'Stable' : 'Declining',
    },
    {
      name: 'Profit Growth',
      value: formatVal(financials.profitGrowth, 'percent'),
      benchmark: 'Year-over-year',
      signal: financials.profitGrowth > 10 ? 'Accelerating' : financials.profitGrowth > 0 ? 'Stable' : 'Declining',
    },
    {
      name: 'Free Cash Flow',
      value: formatVal(financials.freeCashFlow, 'currency'),
      benchmark: 'Positive = healthy',
      signal: financials.freeCashFlow > 0 ? 'Positive' : 'Negative',
    },
  ]

  const debtMetrics = [
    {
      name: 'Debt to Equity',
      value: formatVal(financials.debtToEquity, 'multiple'),
      benchmark: 'Below 0.5 = low risk',
      signal: financials.debtToEquity < 0.5 ? 'Low' : financials.debtToEquity < 1.5 ? 'Moderate' : 'High',
    },
    {
      name: 'Current Ratio',
      value: formatVal(financials.currentRatio, 'multiple'),
      benchmark: 'Above 1.5 is safe',
      signal: financials.currentRatio > 2 ? 'Strong' : financials.currentRatio > 1 ? 'Moderate' : 'Weak',
    },
    {
      name: 'Interest Coverage',
      value: formatVal(financials.interestCoverage, 'multiple'),
      benchmark: 'Above 3x is safe',
      signal: financials.interestCoverage > 5 ? 'Strong' : financials.interestCoverage > 2 ? 'Moderate' : 'Weak',
    },
    {
      name: 'PE Ratio',
      value: formatVal(financials.pe, 'multiple'),
      benchmark: aiAnalysis?.valuationSignal || 'Check vs sector',
      signal: null,
    },
    {
      name: 'PB Ratio',
      value: formatVal(financials.pb, 'multiple'),
      benchmark: 'Below 1 = possibly undervalued',
      signal: null,
    },
    {
      name: 'PEG Ratio',
      value: formatVal(financials.peg, 'multiple'),
      benchmark: 'Below 1 = growth at fair price',
      signal: financials.peg < 1 ? 'Undervalued' : financials.peg < 2 ? 'Fair' : 'Overvalued',
    },
  ]

  return (
    <div style={{ marginBottom: 20 }}>
      <Section label="Profitability" metrics={profitabilityMetrics} />
      <Section label="Returns & Growth" metrics={returnMetrics} />
      <Section label="Debt, Liquidity & Valuation" metrics={debtMetrics} />
    </div>
  )
}

function Section({ label, metrics }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E8E2',
        borderRadius: 14,
        padding: 20,
        marginBottom: 16,
        boxShadow: '0 1px 2px rgba(15,33,26,0.04)',
      }}
    >
      <SectionLabel>{label}</SectionLabel>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 12,
        }}
      >
        {metrics.map((m) => (
          <MetricCard key={m.name} {...m} />
        ))}
      </div>
    </div>
  )
}
