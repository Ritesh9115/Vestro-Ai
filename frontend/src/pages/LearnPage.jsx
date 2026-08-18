import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, Search } from 'lucide-react'
import { useIsMobile } from '../hooks/useIsMobile'
import { useExperience } from '../context/ExperienceContext'
import AILangSelector from '../components/common/AILangSelector'

const LEARN_SECTIONS = [
  {
    id: 'profitability',
    title: 'Profitability Metrics',
    titleHindi: 'लाभप्रदता मेट्रिक्स',
    color: '#0E8F5B',
    metrics: [
      {
        name: 'Revenue',
        beginner: 'The total money a company earns from selling its products or services. Think of it as the top-line number — the total sales before any costs.',
        intermediate: 'Total sales income before deducting any expenses. Revenue growth indicates whether a company is expanding its market presence.',
        expert: 'Top-line income representing total business volume. Analyse YoY and CAGR alongside margin trends to distinguish volume growth from pricing power.',
        hindi: {
          beginner: 'Revenue यानी कंपनी को अपने products या services बेचने से जो कुल पैसे मिलते हैं। इसे "बिक्री" समझें — खर्च काटने से पहले का नंबर।',
          intermediate: 'Revenue वो कुल income है जो कंपनी को अपने कारोबार से मिलती है, किसी भी खर्च से पहले। Revenue की growth बताती है कि कंपनी बाज़ार में आगे बढ़ रही है या नहीं।',
          expert: 'Top-line income जो total business volume दर्शाती है। YoY growth और CAGR को gross margin trend के साथ analyze करें — volume growth और pricing power में फ़र्क पहचानें।',
        },
      },
      {
        name: 'Net Profit / Net Income',
        beginner: 'What is left after the company pays all its bills — salaries, taxes, loans. If revenue is what you earn, net profit is what you actually keep.',
        intermediate: 'Revenue minus all expenses including COGS, operating costs, interest, and taxes. Net margin = Net Income / Revenue.',
        expert: 'Bottom-line profitability after all deductions. Analyse alongside operating income to isolate non-recurring items. Compare net margin trends to industry peers.',
        hindi: {
          beginner: 'Net Profit वो है जो सब खर्च — तनख़्वाह, टैक्स, कर्ज़ — चुकाने के बाद बचता है। Revenue वो है जो कमाते हो, Net Profit वो है जो रखते हो।',
          intermediate: 'Revenue में से सभी खर्च (COGS, operations, interest, tax) घटाने के बाद जो बचे वो Net Income। Net Margin = Net Income ÷ Revenue।',
          expert: 'सभी deductions के बाद की bottom-line profitability। Operating income के साथ compare करें ताकि one-time items अलग हों। Industry peers से net margin trend की तुलना करें।',
        },
      },
      {
        name: 'Gross Margin',
        beginner: 'What percentage of each sale remains after the basic cost of making the product. Higher is better — it means the product itself is profitable.',
        intermediate: '(Revenue - Cost of Goods Sold) / Revenue. Reflects pricing power and production efficiency. SaaS companies typically have 70%+, manufacturers 20-40%.',
        expert: 'Proxy for pricing power and operational leverage. Compare against competitors and track trend — a compressing gross margin often precedes earnings deterioration.',
        hindi: {
          beginner: 'Gross Margin बताता है कि product बनाने की basic cost निकालने के बाद हर बिक्री में कितना % बचता है। जितना ज़्यादा, उतना बेहतर।',
          intermediate: '(Revenue - COGS) ÷ Revenue। यह pricing power और production efficiency दर्शाता है। SaaS कंपनियाँ 70%+ रखती हैं, manufacturers 20–40%।',
          expert: 'Pricing power और operational leverage का proxy। Competitors से compare करें और trend track करें — घटता Gross Margin अक्सर earnings problem का पहला संकेत होता है।',
        },
      },
      {
        name: 'Operating Margin',
        beginner: 'Profit percentage after paying for employees, rent, and day-to-day operations — but before paying tax and loan interest.',
        intermediate: 'Operating Income / Revenue. Shows core business efficiency. Above 15% is generally healthy. Track trend across quarters.',
        expert: 'EBIT margin reflecting core operational performance, excluding financial structure and tax. Key for peer comparison since it strips out capital structure differences.',
        hindi: {
          beginner: 'Operating Margin वो % profit है जो employees, किराया और रोज़मर्रा के खर्च चुकाने के बाद बचता है — पर tax और loan interest से पहले।',
          intermediate: 'Operating Income ÷ Revenue। यह core business efficiency दिखाता है। 15% से ऊपर generally healthy माना जाता है।',
          expert: 'EBIT margin जो financial structure और tax को छोड़कर core performance दिखाता है। Peer comparison के लिए ideal क्योंकि capital structure के फ़र्क को हटाता है।',
        },
      },
      {
        name: 'EBITDA',
        beginner: 'A way to measure how much cash a company generates from its core business, before accountants do their adjustments for depreciation and taxes.',
        intermediate: 'Earnings before Interest, Tax, Depreciation & Amortisation. Useful for comparing companies with different debt levels or accounting policies.',
        expert: 'EV/EBITDA is the primary valuation multiple in M&A. EBITDA strips D&A which are non-cash charges, providing a closer proxy to operating cash flow.',
        hindi: {
          beginner: 'EBITDA बताता है कि कंपनी अपने main काम से कितनी cash generate करती है — depreciation और tax के adjustment से पहले।',
          intermediate: 'Interest, Tax, Depreciation और Amortisation से पहले की Earnings। अलग-अलग debt level या accounting policy वाली कंपनियों की तुलना के लिए useful।',
          expert: 'EV/EBITDA M&A में primary valuation multiple है। EBITDA non-cash charges (D&A) हटाता है, जिससे यह operating cash flow का बेहतर proxy बनता है।',
        },
      },
    ],
  },
  {
    id: 'returns',
    title: 'Return Metrics',
    titleHindi: 'रिटर्न मेट्रिक्स',
    color: '#6366F1',
    metrics: [
      {
        name: 'ROE — Return on Equity',
        beginner: 'How much profit a company makes for every rupee/dollar that shareholders have invested. Higher means the company is using your money efficiently.',
        intermediate: 'Net Income / Shareholders Equity. Shows management efficiency. Above 15% is considered good. Compare ROE vs ROCE to check if returns are leverage-driven.',
        expert: 'Decompose via DuPont: ROE = Net Margin × Asset Turnover × Equity Multiplier. High ROE from high leverage is a red flag; high ROE from high margins or turnover is sustainable.',
        hindi: {
          beginner: 'ROE बताता है कि shareholders के हर एक रुपये पर कंपनी कितना मुनाफा कमाती है। जितना ज़्यादा, उतना अच्छा — मतलब आपका पैसा efficiently use हो रहा है।',
          intermediate: 'Net Income ÷ Shareholders Equity। यह management efficiency दर्शाता है। 15% से ऊपर ROE अच्छा माना जाता है। ROE vs ROCE compare करें — देखें कि returns debt से आ रहे हैं या नहीं।',
          expert: 'DuPont analysis से decompose करें: ROE = Net Margin × Asset Turnover × Equity Multiplier। High leverage से आया high ROE red flag है; high margin या turnover से आया ROE sustainable है।',
        },
      },
      {
        name: 'ROCE — Return on Capital Employed',
        beginner: 'Similar to ROE, but includes borrowed money too. If ROCE is higher than ROE, the company is using debt efficiently rather than just borrowing to inflate returns.',
        intermediate: 'EBIT / (Total Equity + Total Debt). When ROCE > Cost of Debt, the company creates value from borrowing. ROCE > ROE signals non-leveraged returns.',
        expert: 'Superior metric to ROE for capital-intensive businesses. If ROCE > WACC, the company earns above its cost of capital — a core value creation signal.',
        hindi: {
          beginner: 'ROCE, ROE जैसा है पर इसमें उधार का पैसा भी शामिल है। अगर ROCE > ROE है, तो कंपनी debt को efficiently use कर रही है।',
          intermediate: 'EBIT ÷ (Total Equity + Total Debt)। जब ROCE > Cost of Debt हो, तब कंपनी borrowing से value create कर रही है।',
          expert: 'Capital-intensive businesses के लिए ROE से बेहतर metric। अगर ROCE > WACC है, तो कंपनी अपनी capital cost से ज़्यादा earn कर रही है — यह value creation का core signal है।',
        },
      },
      {
        name: 'ROA — Return on Assets',
        beginner: 'How much profit the company generates from all the assets it owns — factories, machines, cash. Higher is better.',
        intermediate: 'Net Income / Total Assets. Asset-light businesses (software, services) have higher ROA than asset-heavy ones (steel, real estate).',
        expert: 'Useful for intra-sector comparison where capital intensity is similar. For capital-light businesses, compare with sector average rather than absolute benchmarks.',
        hindi: {
          beginner: 'ROA बताता है कि कंपनी अपनी सभी assets — factories, machines, cash — से कितना profit generate करती है। जितना ज़्यादा, उतना बेहतर।',
          intermediate: 'Net Income ÷ Total Assets। Software/services जैसे asset-light businesses का ROA ज़्यादा होता है, steel/real estate जैसे asset-heavy का कम।',
          expert: 'Intra-sector comparison के लिए useful जहाँ capital intensity similar हो। Asset-light businesses के लिए absolute benchmark की बजाय sector average से compare करें।',
        },
      },
    ],
  },
  {
    id: 'debt',
    title: 'Debt & Liquidity',
    titleHindi: 'कर्ज़ और नकदी',
    color: '#C8443A',
    metrics: [
      {
        name: 'Debt to Equity',
        beginner: 'How much borrowed money the company uses compared to shareholder money. Low is safer — it means the company does not depend too much on loans.',
        intermediate: 'Total Debt / Shareholders Equity. Below 0.5 is considered conservative. Some industries like banking have high D/E by nature.',
        expert: 'Must be contextualised by industry and asset type. Compare net debt (debt minus cash) to equity for a cleaner picture. Rising D/E with falling ROCE is a warning sign.',
        hindi: {
          beginner: 'Debt to Equity बताता है कि shareholders के पैसे की तुलना में कंपनी कितना उधार use करती है। कम हो तो सुरक्षित — मतलब loans पर ज़्यादा निर्भरता नहीं।',
          intermediate: 'Total Debt ÷ Shareholders Equity। 0.5 से कम conservative माना जाता है। Banking जैसे industries में naturally high D/E होता है।',
          expert: 'Industry और asset type के context में देखें। Net Debt (Debt - Cash) को Equity से compare करें। D/E बढ़ रहा हो और ROCE गिर रहा हो — यह warning sign है।',
        },
      },
      {
        name: 'Current Ratio',
        beginner: 'Can the company pay its short-term bills? Above 1.5 means yes, the company has enough short-term assets to cover short-term debt.',
        intermediate: 'Current Assets / Current Liabilities. Below 1 means the company may struggle to pay short-term obligations. Above 3 may indicate idle assets.',
        expert: 'Quick ratio (excluding inventory) is often more informative. Track trend in addition to absolute level. Inventory-heavy businesses naturally have higher current ratios.',
        hindi: {
          beginner: 'Current Ratio बताता है कि क्या कंपनी अपने short-term बिल चुका सकती है। 1.5 से ऊपर मतलब हाँ — कंपनी के पास enough short-term assets हैं।',
          intermediate: 'Current Assets ÷ Current Liabilities। 1 से नीचे हो तो कंपनी short-term obligations चुकाने में struggle कर सकती है। 3 से ऊपर हो तो assets idle हो सकते हैं।',
          expert: 'Quick Ratio (inventory को छोड़कर) अक्सर ज़्यादा informative होता है। Absolute level के साथ trend भी track करें। Inventory-heavy businesses का Current Ratio naturally ज़्यादा होता है।',
        },
      },
      {
        name: 'Interest Coverage',
        beginner: 'How many times can the company pay its loan interest from its profits? Above 3x means it can comfortably afford its debt.',
        intermediate: 'EBIT / Interest Expense. Below 1.5 is a danger zone — the company may struggle to service debt. Banks typically require above 2.5.',
        expert: 'A declining interest coverage trend with rising debt often precedes financial distress. Analyse in conjunction with free cash flow coverage for a complete picture.',
        hindi: {
          beginner: 'Interest Coverage बताता है कि कंपनी अपने loan का interest profit से कितनी बार चुका सकती है। 3x से ऊपर मतलब कंपनी आराम से debt afford कर सकती है।',
          intermediate: 'EBIT ÷ Interest Expense। 1.5 से नीचे danger zone है। Banks आमतौर पर 2.5 से ऊपर चाहते हैं।',
          expert: 'बढ़ते debt के साथ गिरता Interest Coverage अक्सर financial distress का पूर्व संकेत है। Free Cash Flow coverage के साथ मिलाकर analyze करें।',
        },
      },
    ],
  },
  {
    id: 'valuation',
    title: 'Valuation',
    titleHindi: 'मूल्यांकन',
    color: '#B8862E',
    metrics: [
      {
        name: 'PE Ratio',
        beginner: 'How much you are paying for each rupee/dollar of profit. PE of 20 means investors pay 20 rupees for every 1 rupee of annual profit. Lower can mean cheaper.',
        intermediate: "Price / EPS. Compare to sector average PE. A PE well above peers suggests high growth expectations. Compare to the company's own historical PE range.",
        expert: 'Forward PE is more useful than trailing. Analyse PE/Growth (PEG), PE relative to free cash flow yield, and peer comparison. Mean-reversion in PE is common in cycles.',
        hindi: {
          beginner: 'PE Ratio बताता है कि आप हर एक रुपये के profit के लिए कितना pay कर रहे हो। PE 20 मतलब 1 रुपये के मुनाफे के लिए 20 रुपये। कम PE = सस्ता हो सकता है।',
          intermediate: 'Price ÷ EPS। Sector average PE से compare करें। Peers से बहुत ऊपर PE मतलब high growth expectations। Company का खुद का historical PE range भी देखें।',
          expert: 'Trailing PE से ज़्यादा useful Forward PE होता है। PEG (PE/Growth), Free Cash Flow yield से relative PE, और peer comparison analyze करें।',
        },
      },
      {
        name: 'PB Ratio',
        beginner: 'Price compared to the book value (what the company owns minus what it owes). Below 1 could mean undervalued — you are buying assets for less than their worth.',
        intermediate: 'Price / Book Value per Share. Asset-heavy companies are valued on PB. PB < 1 for non-financial companies often signals financial stress or value.',
        expert: 'For financial companies (banks, NBFCs), PB is the primary valuation metric. Adjust book value for intangibles and goodwill. ROE and PB should correlate positively.',
        hindi: {
          beginner: 'PB Ratio price को book value (assets - liabilities) से compare करता है। 1 से नीचे मतलब undervalued हो सकता है — आप assets उनकी कीमत से सस्ते खरीद रहे हैं।',
          intermediate: 'Price ÷ Book Value per Share। Asset-heavy कंपनियों की valuation PB पर होती है। Non-financial कंपनी का PB < 1 अक्सर financial stress या deep value signal करता है।',
          expert: 'Banks और NBFCs जैसी financial companies के लिए PB primary valuation metric है। Intangibles और goodwill को adjust करें। ROE और PB positively correlate करने चाहिए।',
        },
      },
      {
        name: 'PEG Ratio',
        beginner: 'PE adjusted for growth. A PEG below 1 suggests you might be getting growth at a fair price — like finding something on sale.',
        intermediate: 'PE / Earnings Growth Rate. Below 1 = potentially undervalued for a growth company. Above 2 = expensive relative to expected growth.',
        expert: 'Normalise the growth rate you use (5-year CAGR vs. 1-year). PEG is sensitive to which growth estimate you use — be conservative. More useful for consistent growers.',
        hindi: {
          beginner: 'PEG, PE को growth के हिसाब से adjust करता है। 1 से नीचे PEG मतलब आपको growth सस्ते में मिल रही है — जैसे sale पर मिला हो।',
          intermediate: 'PE ÷ Earnings Growth Rate। 1 से कम = growth company के लिए potentially undervalued। 2 से ऊपर = expected growth के हिसाब से expensive।',
          expert: 'Growth rate को normalize करें (5-year CAGR vs 1-year)। PEG growth estimate पर sensitive है — conservative रहें। Consistent growers के लिए ज़्यादा useful है।',
        },
      },
    ],
  },
]

export default function LearnPage() {
  const isMobile = useIsMobile()
  const { aiLang, setAiLang, mode, setMode } = useExperience()
  const [openSection, setOpenSection] = useState('profitability')
  const [openMetric, setOpenMetric] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  function toggleMetric(id) {
    setOpenMetric(openMetric === id ? null : id)
  }

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return LEARN_SECTIONS

    const query = searchQuery.toLowerCase()
    return LEARN_SECTIONS.map(section => {
      const filteredMetrics = section.metrics.filter(metric => {
        const hindiContent = metric.hindi ? Object.values(metric.hindi).join(' ') : ''
        return (
          metric.name.toLowerCase().includes(query) ||
          metric.beginner.toLowerCase().includes(query) ||
          metric.intermediate.toLowerCase().includes(query) ||
          metric.expert.toLowerCase().includes(query) ||
          hindiContent.toLowerCase().includes(query)
        )
      })
      return { ...section, metrics: filteredMetrics }
    }).filter(section => section.metrics.length > 0)
  }, [searchQuery])

  // Get explanation text for current mode + language
  function getExplanation(metric) {
    if (aiLang === 'hi' && metric.hindi) {
      return metric.hindi[mode] || metric.hindi.beginner || metric[mode]
    }
    return metric[mode]
  }

  return (
    <div style={{ background: '#FBFBF8', minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: isMobile ? '28px 16px 0' : '48px 24px 0' }}>
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
            {aiLang === 'hi' ? 'हर मेट्रिक को समझें' : 'Understand every metric'}
          </h1>
          <p style={{ color: '#5B6B63', fontSize: '1rem', lineHeight: 1.65, margin: 0 }}>
            {aiLang === 'hi'
              ? 'Beginner को सरल हिंदी में। Expert को पूरी technical जानकारी। अपना level चुनें।'
              : 'Beginner investors get plain English. Experts get the full picture. Select your level.'}
          </p>
        </div>

        {/* Controls row: Mode selector + Language toggle */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16, marginBottom: 32, alignItems: isMobile ? 'stretch' : 'center' }}>
          {/* Mode selector */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              background: '#EFF1EC',
              borderRadius: 12,
              padding: 4,
              width: isMobile ? '100%' : 'fit-content',
            }}
          >
            {['beginner', 'intermediate', 'expert'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: isMobile ? 1 : 'none',
                  padding: '8px 18px',
                  borderRadius: 9,
                  border: 'none',
                  background: mode === m ? '#FFFFFF' : 'transparent',
                  color: mode === m ? '#0F211A' : '#9AA69F',
                  fontWeight: 600,
                  fontSize: isMobile ? '0.78rem' : '0.85rem',
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

          {/* Language toggle */}
          <AILangSelector />

          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: isMobile ? '100%' : 280, marginLeft: isMobile ? 0 : 'auto' }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9AA69F', display: 'flex', alignItems: 'center' }}>
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder={aiLang === 'hi' ? 'मेट्रिक खोजें...' : 'Search metrics...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 38px',
                borderRadius: 12,
                border: '1px solid #E5E8E2',
                background: '#FFFFFF',
                fontSize: '0.9rem',
                color: '#0F211A',
                outline: 'none',
                fontFamily: "'Inter', sans-serif",
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredSections.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#5B6B63', fontSize: '0.95rem' }}>
              {aiLang === 'hi' ? `"${searchQuery}" के लिए कोई मेट्रिक नहीं मिला` : `No metrics found matching "${searchQuery}"`}
            </div>
          )}
          {filteredSections.map((section) => {
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
                      {aiLang === 'hi' && section.titleHindi ? section.titleHindi : section.title}
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
                                padding: '0 22px 20px',
                                background: '#FAFAFA',
                                borderTop: '1px solid #EFF1EC',
                              }}
                            >
                              {/* Language + Mode badge row */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, marginBottom: 12, flexWrap: 'wrap' }}>
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                  padding: '3px 10px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 600,
                                  background: '#E4F5EC', color: '#0B6E46', border: '1px solid #C3E8D5',
                                }}>
                                  {aiLang === 'hi' ? '🇮🇳 हिंदी' : '🇬🇧 English'} · {mode}
                                </span>
                              </div>

                              <p
                                style={{
                                  margin: 0,
                                  fontSize: '0.9rem',
                                  color: '#0F211A',
                                  lineHeight: 1.75,
                                }}
                              >
                                {getExplanation(metric)}
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
