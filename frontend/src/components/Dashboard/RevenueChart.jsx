
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { SectionLabel } from '../MetricCard/MetricCard'

function formatBillions(value) {
  if (!value) return '0'
  const num = parseFloat(value)
  if (Math.abs(num) >= 1e12) return `₹${(num / 1e12).toFixed(1)}T`
  if (Math.abs(num) >= 1e9) return `₹${(num / 1e9).toFixed(1)}B`
  if (Math.abs(num) >= 1e7) return `₹${(num / 1e7).toFixed(1)}Cr`
  if (Math.abs(num) >= 1e5) return `₹${(num / 1e5).toFixed(1)}L`
  return `₹${num}`
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E8E2',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: '0 4px 16px rgba(15,33,26,0.12)',
      }}
    >
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem', color: '#5B6B63', marginBottom: 6 }}>
        FY {label}
      </div>
      {payload.map((entry) => (
        <div key={entry.name} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: entry.fill }} />
          <span style={{ fontSize: '0.8rem', color: '#0F211A', fontWeight: 600 }}>
            {entry.name}: {formatBillions(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function RevenueChart({ historicalData }) {
  if (!historicalData || historicalData.length === 0) return null

  const chartData = historicalData.map((d) => ({
    year: d.year,
    Revenue: d.revenue,
    'Net Income': d.netIncome,
    'Gross Profit': d.grossProfit,
  }))

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E8E2',
        borderRadius: 14,
        padding: 20,
        marginBottom: 20,
        boxShadow: '0 1px 2px rgba(15,33,26,0.04)',
      }}
    >
      <SectionLabel>Revenue & Profit — 5-Year Trend</SectionLabel>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EFF1EC" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fill: '#9AA69F' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatBillions}
            tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fill: '#9AA69F' }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="square"
            iconSize={8}
            wrapperStyle={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem' }}
          />
          <Bar dataKey="Revenue" fill="#0E8F5B" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="Gross Profit" fill="#6BD79E" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="Net Income" fill="#B8E4CA" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
