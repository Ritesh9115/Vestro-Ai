/**
 * LandingPage.jsx — Vestro AI v4
 * Dark theme kept intact.
 * Fixed: Hero (white + product image) · Globe (real land dots) · Dotted Map (real boundaries)
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, ArrowDown, Check, X, Minus, Layers,
  AlertTriangle, Target, Globe, BarChart2, Brain,
  ShieldCheck, TrendingUp, Eye, MessageSquare, Zap, Clock,
} from 'lucide-react'

// ─── SEEDED RNG ───────────────────────────────────────────────────────────────
function lcg(seed) {
  let s = seed >>> 0
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296 }
}

// ─── LAND REGIONS for globe land-dots (lat/lng) ───────────────────────────────
const LAND_REGIONS = [
  { latMin: 25,  latMax: 70,  lngMin: -168, lngMax: -55,  n: 60 },  // North America
  { latMin: 55,  latMax: 72,  lngMin: -170, lngMax: -130, n: 12 },  // Alaska
  { latMin: 60,  latMax: 84,  lngMin: -58,  lngMax: -16,  n: 14 },  // Greenland
  { latMin: -55, latMax: 12,  lngMin: -82,  lngMax: -34,  n: 50 },  // South America
  { latMin: 36,  latMax: 72,  lngMin: -10,  lngMax: 32,   n: 55 },  // Europe
  { latMin: 56,  latMax: 71,  lngMin: 4,    lngMax: 32,   n: 18 },  // Scandinavia
  { latMin: 5,   latMax: 37,  lngMin: -18,  lngMax: 42,   n: 38 },  // N Africa
  { latMin: -35, latMax: 5,   lngMin: 10,   lngMax: 52,   n: 38 },  // S Africa
  { latMin: 14,  latMax: 42,  lngMin: 32,   lngMax: 62,   n: 28 },  // Middle East
  { latMin: 36,  latMax: 57,  lngMin: 52,   lngMax: 90,   n: 28 },  // Central Asia
  { latMin: 6,   latMax: 36,  lngMin: 65,   lngMax: 98,   n: 45 },  // South Asia / India
  { latMin: 18,  latMax: 54,  lngMin: 98,   lngMax: 148,  n: 60 },  // China / East Asia
  { latMin: 30,  latMax: 46,  lngMin: 128,  lngMax: 148,  n: 22 },  // Japan
  { latMin: -8,  latMax: 22,  lngMin: 95,   lngMax: 140,  n: 30 },  // SE Asia
  { latMin: 50,  latMax: 76,  lngMin: 30,   lngMax: 180,  n: 55 },  // Russia
  { latMin: -44, latMax: -12, lngMin: 113,  lngMax: 154,  n: 38 },  // Australia
  { latMin: -47, latMax: -34, lngMin: 165,  lngMax: 178,  n: 8  },  // New Zealand
]
const _gr = lcg(12345)
const GLOBE_LAND_DOTS = LAND_REGIONS.flatMap(({ latMin, latMax, lngMin, lngMax, n }) =>
  Array.from({ length: n }, () => ({
    lat: latMin + _gr() * (latMax - latMin),
    lng: lngMin + _gr() * (lngMax - lngMin),
  }))
)

// ─── GLOBE CITIES ─────────────────────────────────────────────────────────────
const GLOBE_CITIES = [
  { lat: 40.7,  lng: -74.0,  label: 'New York',  ex: 'NYSE' },
  { lat: 51.5,  lng: -0.1,   label: 'London',    ex: 'LSE'  },
  { lat: 19.1,  lng: 72.9,   label: 'Mumbai',    ex: 'NSE'  },
  { lat: 35.7,  lng: 139.7,  label: 'Tokyo',     ex: 'TSE'  },
  { lat: -33.9, lng: 151.2,  label: 'Sydney',    ex: 'ASX'  },
  { lat: 31.2,  lng: 121.5,  label: 'Shanghai',  ex: 'SSE'  },
  { lat: 25.2,  lng: 55.3,   label: 'Dubai',     ex: 'DFM'  },
  { lat: 1.3,   lng: 103.8,  label: 'Singapore', ex: 'SGX'  },
]

// ─── MAP LAND DOTS (equirectangular, 960×480) ─────────────────────────────────
const _mr = lcg(99999)
const MAP_LAND_DOTS = LAND_REGIONS.flatMap(({ latMin, latMax, lngMin, lngMax, n }) => {
  const cnt = Math.round(n * 2.2)
  return Array.from({ length: cnt }, () => ({
    x: (lngMin + _mr() * (lngMax - lngMin) + 180) / 360 * 960,
    y: (90 - (latMin + _mr() * (latMax - latMin))) / 180 * 480,
  }))
})

const MAP_CITIES = [
  { lat: 40.7,  lng: -74.0,  label: 'New York'   },
  { lat: -23.5, lng: -46.6,  label: 'São Paulo'  },
  { lat: 51.5,  lng: -0.1,   label: 'London'     },
  { lat: -26.2, lng: 28.0,   label: 'Jo\'burg'   },
  { lat: 19.1,  lng: 72.9,   label: 'Mumbai'     },
  { lat: 25.2,  lng: 55.3,   label: 'Dubai'      },
  { lat: 1.3,   lng: 103.8,  label: 'Singapore'  },
  { lat: 31.2,  lng: 121.5,  label: 'Shanghai'   },
  { lat: 35.7,  lng: 139.7,  label: 'Tokyo'      },
  { lat: -33.9, lng: 151.2,  label: 'Sydney'     },
].map(c => ({
  ...c,
  x: (c.lng + 180) / 360 * 960,
  y: (90 - c.lat) / 180 * 480,
}))

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MORPH_WORDS = ['smarter.', 'confidently.', 'without guessing.', 'before the market.']

const PROBLEMS = [
  {
    Icon: Layers,
    title: 'Tab-switching nightmare',
    desc: 'You juggle Yahoo Finance, Moneycontrol, Screener, Reddit, and ChatGPT — 7+ sources — to research one stock. Each gives a different picture.',
    fix: 'One search on Vestro. Complete picture.',
    accent: '#C8443A', bg: '#FBEAE8', border: '#F3D4D0',
  },
  {
    Icon: AlertTriangle,
    title: 'AI hallucinates numbers',
    desc: 'ChatGPT confidently quotes a P/E of 14 for a company that has none. It has no access to real-time financial data and no way to verify.',
    fix: 'Vestro uses real APIs. AI only reasons, never invents.',
    accent: '#B8862E', bg: '#FFF8EC', border: '#F0D9A0',
  },
  {
    Icon: Target,
    title: 'No clear investment verdict',
    desc: 'After hours of research you still don\'t know: should I invest, hold, or avoid? No single tool synthesises everything into one decision.',
    fix: 'INVEST · WATCH · SKIP. With a 0–100 Health Score.',
    accent: '#6B5CE7', bg: '#F5F4FD', border: '#D5D0F5',
  },
  {
    Icon: Globe,
    title: 'Indian stocks are left out',
    desc: 'Most AI tools are US-centric. Reliance, TCS, HDFC, Infosys — millions of Indian investors are ignored by tools built for Wall Street.',
    fix: 'Vestro covers NSE, BSE and 10+ global exchanges.',
    accent: '#0E8F5B', bg: '#E4F5EC', border: '#B8E2CC',
  },
]

const FEATURES = [
  {
    num: '01', tag: 'Research Engine',
    title: 'Deep AI research in seconds.',
    body: 'Search any company across 50+ global exchanges. Vestro fetches real financials, computes 40+ metrics, runs 12 deterministic health checks, and generates an AI-powered bull and bear thesis.',
    stat: '9-step', statLabel: 'AI pipeline',
    img: '/hero_product.png', imgAlt: 'Research Dashboard',
  },
  {
    num: '02', tag: 'Portfolio Intelligence',
    title: 'Your portfolio. Fully understood.',
    body: 'Track every holding with AI-assigned health scores. See sector diversification, risk concentration, and get alerts when fundamentals change materially.',
    stat: '360°', statLabel: 'Portfolio view',
    img: '/portfolio_view.png', imgAlt: 'Portfolio View',
  },
]

const COMPARISON_ROWS = [
  { feature: 'Real financial data',     yahoo: true,  tickertape: true,  chatgpt: false, vestro: true },
  { feature: 'AI analysis + reasoning', yahoo: false, tickertape: false, chatgpt: null,  vestro: true },
  { feature: 'Explainable verdicts',    yahoo: false, tickertape: false, chatgpt: false, vestro: true },
  { feature: 'Health score (0–100)',    yahoo: false, tickertape: true,  chatgpt: false, vestro: true },
  { feature: 'Portfolio tracking',      yahoo: true,  tickertape: true,  chatgpt: false, vestro: true },
  { feature: 'Indian stock support',    yahoo: null,  tickertape: true,  chatgpt: false, vestro: true },
  { feature: 'Scenario modeling',       yahoo: false, tickertape: false, chatgpt: false, vestro: true },
  { feature: 'No hallucinations',       yahoo: true,  tickertape: true,  chatgpt: false, vestro: true },
]

const ORBIT_ITEMS_1 = ['Yahoo Finance', 'Moneycontrol', 'Screener', 'Reddit']
const ORBIT_ITEMS_2 = ['NSE · BSE', 'NYSE · NASDAQ', 'LSE · TSE', 'ASX · SSE']

const CLOUD_TAGS = [
  'INVEST', 'WATCH', 'SKIP', 'Health Score', 'Bull Thesis', 'Bear Thesis',
  'AI Chat', 'Portfolio', 'Watchlist', 'Simulator', 'P/E Ratio', 'ROE',
  'FCF', 'EPS', 'AAPL', 'TCS.NS', 'RELIANCE.NS', 'TSLA', 'NSE', 'BSE',
]

// ─── MORPHING TEXT ────────────────────────────────────────────────────────────
function MorphingText() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % MORPH_WORDS.length), 2400)
    return () => clearInterval(t)
  }, [])
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={idx}
        initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -28, filter: 'blur(10px)' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: 'inline-block', color: '#0E8F5B', fontStyle: 'italic' }}
      >{MORPH_WORDS[idx]}</motion.span>
    </AnimatePresence>
  )
}

// ─── CANVAS GLOBE — with real land dots ──────────────────────────────────────
function CanvasGlobe({ size = 380 }) {
  const canvasRef = useRef(null)
  const frameRef  = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width  = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const cx = size / 2, cy = size / 2, R = size * 0.43
    let rot = 0

    function toScreen(lat, lng) {
      const latR = lat  * Math.PI / 180
      const lngR = (lng + rot) * Math.PI / 180
      const x3 = Math.cos(latR) * Math.cos(lngR)
      const y3 = Math.sin(latR)
      const z3 = Math.cos(latR) * Math.sin(lngR)
      return { sx: cx + x3 * R, sy: cy - y3 * R, z: z3 }
    }

    function draw() {
      ctx.clearRect(0, 0, size, size)

      // Sphere — dark ocean
      const grd = ctx.createRadialGradient(cx - R * 0.28, cy - R * 0.28, 0, cx, cy, R * 1.05)
      grd.addColorStop(0, '#112B20')
      grd.addColorStop(0.7, '#0A1F16')
      grd.addColorStop(1, '#071410')
      ctx.fillStyle = grd
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill()

      // Sphere outline
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(14,143,91,0.3)'; ctx.lineWidth = 1.5; ctx.stroke()

      // Lat/lng grid — subtle
      ctx.lineWidth = 0.4
      ;[-60, -30, 0, 30, 60].forEach(lat => {
        const lr = lat * Math.PI / 180
        const yy = cy - Math.sin(lr) * R
        const rr = Math.cos(lr) * R
        ctx.beginPath(); ctx.ellipse(cx, yy, rr, rr * 0.11, 0, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(14,143,91,0.1)'; ctx.stroke()
      })
      for (let lng = 0; lng < 180; lng += 30) {
        const lr = (lng + rot) * Math.PI / 180
        const a  = Math.abs(Math.cos(lr))
        ctx.beginPath(); ctx.ellipse(cx, cy, a * R, R, 0, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(14,143,91,${0.04 + a * 0.07})`; ctx.stroke()
      }

      // ── LAND DOTS (country fill) ──────────────────────────────────────────
      for (let i = 0; i < GLOBE_LAND_DOTS.length; i++) {
        const { lat, lng } = GLOBE_LAND_DOTS[i]
        const { sx, sy, z } = toScreen(lat, lng)
        if (z < 0) continue
        const alpha = 0.4 + z * 0.55
        const radius = 1.1 + z * 0.8
        ctx.beginPath(); ctx.arc(sx, sy, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(14,143,91,${alpha})`; ctx.fill()
      }

      // ── CITY MARKERS ──────────────────────────────────────────────────────
      GLOBE_CITIES.forEach(({ lat, lng, ex }) => {
        const { sx, sy, z } = toScreen(lat, lng)
        if (z < -0.05) return
        const alpha = Math.max(0, 0.4 + z * 0.6)

        // Glow halo
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 13)
        g.addColorStop(0, `rgba(14,143,91,${alpha * 0.55})`)
        g.addColorStop(1, 'rgba(14,143,91,0)')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 13, 0, Math.PI * 2); ctx.fill()

        // Outer ring
        ctx.beginPath(); ctx.arc(sx, sy, 6, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(14,143,91,${alpha * 0.6})`; ctx.lineWidth = 1.2; ctx.stroke()

        // Core dot
        ctx.beginPath(); ctx.arc(sx, sy, 3.5, 0, Math.PI * 2)
        ctx.fillStyle = '#0E8F5B'; ctx.fill()
        ctx.beginPath(); ctx.arc(sx, sy, 1.6, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'; ctx.fill()

        // Exchange label when front-facing
        if (z > 0.28) {
          ctx.font = `bold 8px 'IBM Plex Mono', monospace`
          ctx.fillStyle = `rgba(14,143,91,${alpha * 0.95})`
          ctx.fillText(ex, sx + 9, sy + 3)
        }
      })

      rot += 0.15
      frameRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frameRef.current)
  }, [size])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block', width: size, height: size,
        borderRadius: '50%',
        boxShadow: '0 0 0 1px rgba(14,143,91,0.2), 0 24px 64px rgba(0,0,0,0.5)',
      }}
    />
  )
}

// ─── SVG WORLD MAP with real country outlines ─────────────────────────────────
function WorldMap() {
  return (
    <div style={{ width: '100%', maxWidth: 960, margin: '0 auto', position: 'relative' }}>
      <svg viewBox="0 0 960 480" style={{ width: '100%', height: 'auto', display: 'block' }}>

        {/* Country/continent boundary lines */}
        <g fill="none" stroke="rgba(14,143,91,0.3)" strokeWidth="0.7" strokeLinejoin="round">
          {/* North America */}
          <path d="M88,58 L120,40 L155,32 L192,30 L225,35 L252,45 L270,58 L278,72 L274,88 L265,102 L255,114 L248,128 L242,142 L238,157 L233,171 L226,183 L216,193 L204,200 L190,204 L175,205 L160,202 L147,196 L137,187 L130,176 L126,164 L124,152 L123,140 L122,128 L118,116 L110,105 L101,96 L93,86 L88,75 Z" />
          <path d="M123,140 L115,152 L110,168 L107,184 L106,198 L109,208 L112,215" />
          <path d="M200,145 L208,158 L212,172 L210,183 L205,190" />
          {/* Cuba */}
          <path d="M195,160 L208,156 L220,156 L228,160 L228,167 L220,172 L206,173 L196,168 Z" />
          {/* Alaska */}
          <path d="M32,52 L48,44 L66,40 L84,40 L96,46 L101,56 L98,67 L88,74 L74,78 L58,77 L44,71 L35,62 Z" />
          {/* Greenland */}
          <path d="M280,18 L298,8 L318,2 L338,1 L354,5 L362,14 L360,26 L348,36 L330,42 L310,44 L292,41 L279,33 Z" />

          {/* South America */}
          <path d="M195,210 L212,205 L228,205 L244,208 L258,215 L268,225 L274,237 L275,250 L272,263 L264,275 L252,285 L237,292 L220,296 L202,296 L185,292 L170,284 L158,273 L149,260 L144,246 L142,232 L144,218 L150,207 L160,200 L172,196 L185,196 Z" />

          {/* Iceland */}
          <path d="M418,32 L428,24 L440,20 L450,22 L452,30 L446,38 L433,42 L421,39 Z" />

          {/* UK + Ireland */}
          <path d="M440,58 L438,48 L440,40 L445,35 L451,33 L456,36 L456,44 L452,51 Z" />
          <path d="M454,58 L448,48 L445,36 L447,25 L453,17 L461,14 L469,16 L474,24 L474,35 L470,45 L462,52 Z" />

          {/* Scandinavia */}
          <path d="M476,44 L480,30 L486,17 L494,8 L504,5 L514,7 L522,14 L526,24 L524,35 L518,44" />
          <path d="M500,44 L508,32 L516,22 L526,15 L536,12 L545,14 L552,22 L554,33 L550,44" />

          {/* Europe main */}
          <path d="M440,55 L458,48 L478,44 L500,43 L520,46 L538,52 L550,61 L556,72 L554,83 L547,92 L535,99 L518,104 L498,106 L478,105 L460,101 L446,93 L436,83 L433,72 Z" />
          {/* Iberian Peninsula */}
          <path d="M440,90 L432,102 L428,115 L428,128 L432,138 L440,145 L452,148 L463,146 L471,138 L474,126 L472,113 L466,103 L456,96 Z" />
          {/* Italy */}
          <path d="M498,92 L504,105 L508,118 L508,132 L505,146 L499,158 L490,167 L479,172" />
          {/* Balkans */}
          <path d="M520,95 L530,108 L536,122 L536,136 L530,148 L520,157" />

          {/* Russia */}
          <path d="M524,44 L556,38 L594,34 L634,31 L672,30 L710,30 L748,32 L784,35 L816,40 L840,46 L856,54 L862,63 L858,72 L845,78 L824,82 L798,84 L772,82 L746,77 L720,70 L694,65 L668,62 L642,62 L618,65 L596,70 L576,77 L558,84 L544,92 L535,100 L528,92 L524,80 L523,68 Z" />
          <path d="M880,62 L890,52 L898,46 L904,46 L907,54 L904,64 L896,72 L886,74 L879,68 Z" />

          {/* North Africa */}
          <path d="M455,130 L472,123 L492,120 L512,120 L530,123 L545,130 L556,140 L562,152 L562,165 L556,178 L545,190 L530,200 L512,207 L492,210 L473,210 L456,205 L442,196 L433,184 L428,171 L428,158 L433,146 L441,137 Z" />
          {/* Horn of Africa */}
          <path d="M562,165 L572,158 L580,155 L585,160 L582,172 L572,182 L562,185" />
          {/* Southern Africa */}
          <path d="M473,210 L468,225 L466,240 L467,255 L472,268 L481,278 L493,283 L506,282 L516,275 L522,262 L523,248 L518,234 L508,223 L495,215 L481,211 Z" />
          {/* Madagascar */}
          <path d="M562,215 L568,205 L575,200 L582,200 L587,207 L587,217 L582,226 L572,230 L563,226 Z" />

          {/* Middle East */}
          <path d="M556,120 L574,112 L594,108 L614,108 L632,112 L646,120 L654,130 L655,142 L649,153 L637,161 L620,166 L601,168 L583,165 L567,158 L557,148 Z" />
          {/* Arabian Peninsula */}
          <path d="M575,155 L582,168 L585,183 L582,197 L574,208 L562,215 L548,217 L536,213 L527,205 L522,195 L522,183 L527,172 L536,163 L548,157 L561,155 Z" />

          {/* Central Asia */}
          <path d="M616,80 L638,72 L662,68 L686,67 L708,70 L726,77 L737,87 L740,98 L736,109 L724,118 L706,124 L685,127 L664,126 L644,122 L628,114 L617,103 L612,91 Z" />

          {/* South Asia / India */}
          <path d="M642,120 L660,113 L680,109 L700,108 L720,110 L736,116 L747,124 L751,135 L749,147 L740,157 L726,164 L708,168 L688,168 L670,164 L655,157 L644,147 L639,136 Z" />
          {/* India tip */}
          <path d="M688,168 L692,180 L692,193 L686,204 L675,210 L663,210 L652,203 L646,192 L646,180 L651,169" />
          {/* Sri Lanka */}
          <path d="M697,208 L700,215 L698,221 L693,224 L688,221 L686,214 L689,208 Z" />

          {/* China / East Asia */}
          <path d="M726,77 L748,68 L772,62 L798,60 L822,61 L844,65 L860,73 L870,83 L872,95 L866,107 L852,117 L832,123 L808,126 L784,125 L762,120 L743,113 L729,103 L722,92 Z" />
          {/* Korean Peninsula */}
          <path d="M840,92 L848,102 L850,115 L845,125 L836,130 L825,128 L818,120 L817,108 L822,98 L831,93 Z" />

          {/* Japan */}
          <path d="M860,88 L870,80 L880,76 L890,76 L896,82 L893,91 L883,98 L872,100 L862,96 Z" />
          <path d="M875,105 L884,98 L894,97 L900,103 L897,112 L888,117 L878,115 L872,109 Z" />
          <path d="M885,120 L894,115 L902,116 L906,122 L903,130 L894,133 L885,130 L881,124 Z" />

          {/* SE Asia / Indochina */}
          <path d="M748,150 L762,143 L778,140 L794,140 L808,144 L818,151 L822,161 L818,171 L807,178 L792,181 L776,180 L762,175 L752,167 Z" />
          <path d="M762,155 L768,168 L770,182 L766,195 L755,204 L742,207 L730,202 L722,192 L720,180 L723,168 L730,159 L741,154 Z" />
          <path d="M784,195 L798,190 L814,188 L828,190 L838,196 L840,205 L833,213 L818,217 L802,216 L790,209 Z" />
          <path d="M832,200 L848,195 L862,194 L874,198 L880,207 L876,216 L862,220 L847,218 L836,210 Z" />

          {/* Australia */}
          <path d="M760,300 L780,288 L805,282 L832,280 L858,282 L880,288 L898,298 L910,310 L914,324 L910,338 L898,350 L880,358 L858,362 L834,362 L812,358 L793,350 L778,338 L768,324 L763,310 Z" />
          {/* New Zealand */}
          <path d="M912,350 L920,342 L926,338 L932,338 L936,344 L934,352 L928,358 L920,358 L914,353 Z" />
          <path d="M920,364 L926,356 L932,352 L937,352 L940,358 L937,367 L930,373 L922,372 L917,366 Z" />
        </g>

        {/* Land fill dots */}
        {MAP_LAND_DOTS.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="1.8" fill="rgba(14,143,91,0.45)" />
        ))}

        {/* City markers */}
        {MAP_CITIES.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r="5" fill="none" stroke="#0E8F5B" strokeWidth="1.2" opacity="0.4">
              <animate attributeName="r"       values="5;14;5"    dur={`${2.1 + i * 0.22}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur={`${2.1 + i * 0.22}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={c.x} cy={c.y} r="4" fill="#0E8F5B" />
            <circle cx={c.x} cy={c.y} r="2" fill="white" />
            <text x={c.x + 8} y={c.y - 4}
              fontSize="8.5" fontFamily="'IBM Plex Mono',monospace"
              fill="rgba(14,143,91,0.9)" fontWeight="700">{c.label}</text>
          </g>
        ))}

        {/* Curved connection lines */}
        {[
          [MAP_CITIES[0], MAP_CITIES[2]],
          [MAP_CITIES[2], MAP_CITIES[4]],
          [MAP_CITIES[4], MAP_CITIES[7]],
          [MAP_CITIES[7], MAP_CITIES[8]],
          [MAP_CITIES[8], MAP_CITIES[9]],
          [MAP_CITIES[2], MAP_CITIES[3]],
        ].map(([a, b], i) => {
          const mx = (a.x + b.x) / 2
          const my = Math.min(a.y, b.y) - 35
          return (
            <path key={i} d={`M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`}
              fill="none" stroke="rgba(14,143,91,0.25)" strokeWidth="0.8" strokeDasharray="4 3" />
          )
        })}
      </svg>
    </div>
  )
}

// ─── ORBITING CIRCLES ─────────────────────────────────────────────────────────
function OrbitRing({ items, radius, duration, dir = 1, color = '#0E8F5B' }) {
  return (
    <>
      <style>{`
        @keyframes orb-${radius} {
          from { transform: translate(-50%,-50%) rotate(0deg) translateX(${radius}px) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(${dir*360}deg) translateX(${radius}px) rotate(${-dir*360}deg); }
        }
      `}</style>
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: radius*2, height: radius*2, marginLeft: -radius, marginTop: -radius, borderRadius: '50%', border: `1px dashed ${color}25`, pointerEvents: 'none' }} />
      {items.map((item, i) => (
        <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', animationName: `orb-${radius}`, animationDuration: `${duration}s`, animationTimingFunction: 'linear', animationIterationCount: 'infinite', animationDelay: `${-(i/items.length)*duration}s` }}>
          <div style={{ padding: '7px 14px', background: '#fff', border: `1.5px solid ${color}30`, borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, color: '#0F211A', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(15,33,26,0.08)', fontFamily: "'Inter',sans-serif" }}>{item}</div>
        </div>
      ))}
    </>
  )
}

// ─── ICON CLOUD (3D CSS Sphere) ───────────────────────────────────────────────
function IconCloud3D() {
  const phi = Math.PI * (Math.sqrt(5) - 1)
  const n = CLOUD_TAGS.length, R = 110
  return (
    <div style={{ width: 280, height: 280, perspective: 580, position: 'relative', margin: '0 auto' }}>
      <motion.div animate={{ rotateY: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', position: 'relative' }}>
        {CLOUD_TAGS.map((tag, i) => {
          const y2 = 1 - (i / (n - 1)) * 2
          const rr = Math.sqrt(Math.max(0, 1 - y2 * y2))
          const theta = phi * i
          const x2 = Math.cos(theta) * rr, z2 = Math.sin(theta) * rr
          const isVerdict = ['INVEST','WATCH','SKIP'].includes(tag)
          const col = tag==='INVEST'?'#0E8F5B':tag==='WATCH'?'#B8862E':tag==='SKIP'?'#C8443A':'#0F211A'
          return (
            <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate3d(${x2*R}px,${-y2*R}px,${z2*R}px) translate(-50%,-50%)` }}>
              <span style={{ display: 'inline-block', padding: '3px 9px', background: isVerdict?`${col}18`:'rgba(15,33,26,0.06)', border: `1px solid ${isVerdict?col:'rgba(15,33,26,0.12)'}50`, borderRadius: 99, fontSize: '0.63rem', fontWeight: 700, color: col, whiteSpace: 'nowrap', fontFamily: "'IBM Plex Mono',monospace" }}>{tag}</span>
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}

function CmpCell({ v, highlight }) {
  if (v === true) return <div style={{ display:'flex',justifyContent:'center' }}><div style={{ width:24,height:24,borderRadius:'50%',background:highlight?'linear-gradient(135deg,#0E8F5B,#0B6E46)':'#E4F5EC',display:'flex',alignItems:'center',justifyContent:'center' }}><Check size={13} color={highlight?'#fff':'#0E8F5B'} strokeWidth={2.5}/></div></div>
  if (v === false) return <div style={{ display:'flex',justifyContent:'center' }}><div style={{ width:24,height:24,borderRadius:'50%',background:'#F5F7F4',display:'flex',alignItems:'center',justifyContent:'center' }}><X size={12} color="#C8443A" strokeWidth={2.5}/></div></div>
  return <div style={{ display:'flex',justifyContent:'center' }}><Minus size={16} color="#C5CBC3"/></div>
}

const MARQUEE_WORDS = ['AI Research','Real Data','Health Score','Explainable AI','Bull Thesis','Bear Thesis','Global Coverage','No Hallucinations','INVEST · WATCH · SKIP','9-Step Pipeline','Portfolio Intelligence']
function Marquee() {
  const rep = [...MARQUEE_WORDS,...MARQUEE_WORDS,...MARQUEE_WORDS]
  return (
    <div style={{ overflow:'hidden',borderTop:'1px solid #E5E8E2',borderBottom:'1px solid #E5E8E2',padding:'14px 0',background:'#fff' }}>
      <motion.div animate={{ x:[0,-MARQUEE_WORDS.length*210] }} transition={{ repeat:Infinity,duration:MARQUEE_WORDS.length*3,ease:'linear' }} style={{ display:'flex',gap:0,width:'max-content' }}>
        {rep.map((w,i)=>(
          <div key={i} style={{ display:'flex',alignItems:'center',padding:'0 36px',flexShrink:0 }}>
            <span style={{ fontFamily:"'Fraunces',serif",fontSize:'0.95rem',fontWeight:600,color:'#5B6B63',fontStyle:'italic' }}>{w}</span>
            <span style={{ marginLeft:36,color:'#C5CBC3',fontSize:'0.75rem' }}>✦</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTIONS
// ══════════════════════════════════════════════════════════════════════════════

// ─── HERO: White bg + product image ──────────────────────────────────────────
function HeroSection() {
  const navigate = useNavigate()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const rotateY = useTransform(scrollYProgress, [0, 0.7], ['0deg', '180deg'])

  return (
    <section ref={ref} style={{ background: '#ffffff', minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '80px 48px 60px', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle green ambient */}
      <div aria-hidden style={{ position:'absolute',inset:0,pointerEvents:'none' }}>
        <div style={{ position:'absolute',top:'-20%',right:'-10%',width:700,height:700,borderRadius:'50%',background:'radial-gradient(ellipse,rgba(14,143,91,0.07) 0%,transparent 65%)' }} />
        <div style={{ position:'absolute',bottom:'-15%',left:'-5%',width:500,height:500,borderRadius:'50%',background:'radial-gradient(ellipse,rgba(14,143,91,0.04) 0%,transparent 70%)' }} />
        <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%',opacity:0.025 }}>
          <defs><pattern id="hg" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0L0 0 0 60" fill="none" stroke="#0E8F5B" strokeWidth="1"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#hg)"/>
        </svg>
      </div>

      <div style={{ maxWidth:1120,margin:'0 auto',width:'100%',display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'center',position:'relative',zIndex:1 }}>
        {/* LEFT: Text */}
        <div>
          <motion.div
            initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1,duration:0.6 }}
            style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'6px 14px',background:'#E4F5EC',border:'1px solid rgba(14,143,91,0.3)',borderRadius:99,marginBottom:28 }}>
            <div style={{ width:6,height:6,borderRadius:'50%',background:'#0E8F5B',boxShadow:'0 0 8px #0E8F5B90' }} />
            <span style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:'0.68rem',color:'#0B6E46',letterSpacing:'0.1em',textTransform:'uppercase',fontWeight:700 }}>AI Investment Research Platform</span>
          </motion.div>

          <h1 style={{ fontFamily:"'Fraunces',serif",fontSize:'clamp(3rem,5.5vw,5rem)',fontWeight:700,lineHeight:1.02,letterSpacing:'-0.04em',color:'#0F211A',margin:'0 0 20px' }}>
            {'Invest'.split('').map((ch,i)=>(
              <motion.span key={i} initial={{ opacity:0,y:50,filter:'blur(10px)' }} animate={{ opacity:1,y:0,filter:'blur(0)' }} transition={{ delay:0.2+i*0.04,duration:0.7,ease:[0.22,1,0.36,1] }} style={{ display:'inline-block' }}>{ch}</motion.span>
            ))}
            <br />
            <motion.span initial={{ opacity:0,y:40 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.6,duration:0.7,ease:[0.22,1,0.36,1] }} style={{ display:'inline-block' }}>
              <MorphingText />
            </motion.span>
          </h1>

          <motion.p initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.9,duration:0.6 }}
            style={{ fontSize:'1.05rem',color:'#5B6B63',lineHeight:1.7,maxWidth:420,margin:'0 0 32px' }}>
            Real financial data. 9-step AI analysis. One transparent verdict —{' '}
            <strong style={{ color:'#0E8F5B' }}>INVEST</strong>,{' '}
            <strong style={{ color:'#B8862E' }}>WATCH</strong>, or{' '}
            <strong style={{ color:'#C8443A' }}>SKIP</strong>.
          </motion.p>

          {/* Stats */}
          <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:1.0,duration:0.6 }}
            style={{ display:'flex',gap:28,marginBottom:36 }}>
            {[['50K+','Companies'],['10+','Exchanges'],['9','AI steps']].map(([val,lab])=>(
              <div key={lab}>
                <div style={{ fontFamily:"'Fraunces',serif",fontSize:'2rem',fontWeight:700,color:'#0F211A',lineHeight:1 }}>{val}</div>
                <div style={{ fontSize:'0.72rem',color:'#9AA69F',marginTop:4,fontWeight:500 }}>{lab}</div>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div initial={{ opacity:0,scale:0.95 }} animate={{ opacity:1,scale:1 }} transition={{ delay:1.1,duration:0.6 }}
            style={{ display:'flex',gap:12,flexWrap:'wrap' }}>
            <motion.button onClick={()=>navigate('/research')}
              whileHover={{ scale:1.04,boxShadow:'0 8px 32px rgba(14,143,91,0.3)' }} whileTap={{ scale:0.97 }}
              style={{ display:'flex',alignItems:'center',gap:10,padding:'14px 32px',background:'linear-gradient(135deg,#0E8F5B,#0B6E46)',border:'none',borderRadius:12,color:'#fff',fontWeight:700,fontSize:'1rem',cursor:'pointer',fontFamily:"'Inter',sans-serif",boxShadow:'0 4px 16px rgba(14,143,91,0.25)' }}>
              Start Research <ArrowRight size={17}/>
            </motion.button>
            <motion.button onClick={()=>navigate('/learn')}
              whileHover={{ scale:1.03 }}
              style={{ padding:'14px 24px',background:'#fff',border:'2px solid #E5E8E2',borderRadius:12,color:'#5B6B63',fontWeight:600,fontSize:'1rem',cursor:'pointer',fontFamily:"'Inter',sans-serif",transition:'all 0.2s' }}>
              See how it works
            </motion.button>
          </motion.div>

          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.5 }}
            style={{ marginTop:18,fontSize:'0.78rem',color:'#9AA69F' }}>
            Try: AAPL · TCS.NS · RELIANCE.NS · TSLA · MSFT
          </motion.p>
        </div>

        {/* RIGHT: Product image */}
        <motion.div initial={{ opacity:0,x:60,scale:0.92 }} animate={{ opacity:1,x:0,scale:1 }}
          transition={{ delay:0.4,duration:1,ease:[0.22,1,0.36,1] }} style={{ position:'relative', perspective: 1500 }}>
          <motion.div style={{ position: 'relative', width: '100%', transformStyle: 'preserve-3d', rotateY }}>
            {/* FRONT side */}
            <div style={{ backfaceVisibility: 'hidden', position: 'relative' }}>
              {/* Floating score badge */}
              <motion.div animate={{ y:[-8,0,-8] }} transition={{ duration:3,repeat:Infinity,ease:'easeInOut' }}
                style={{ position:'absolute',top:-20,right:-16,background:'#E4F5EC',borderRadius:12,padding:'8px 14px',zIndex:10,boxShadow:'0 8px 24px rgba(14,143,91,0.15)' }}>
                <div style={{ fontSize:'0.62rem',color:'#0B6E46',fontWeight:700,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:'0.06em' }}>HEALTH SCORE</div>
                <div style={{ fontSize:'1.4rem',fontWeight:800,color:'#0E8F5B',fontFamily:"'Fraunces',serif",lineHeight:1 }}>82 — INVEST</div>
              </motion.div>
              {/* WATCH badge */}
              <motion.div animate={{ y:[0,-8,0] }} transition={{ duration:3.5,repeat:Infinity,ease:'easeInOut',delay:1 }}
                style={{ position:'absolute',bottom:40,left:-24,background:'#FFF8EC',borderRadius:10,padding:'7px 12px',zIndex:10,boxShadow:'0 6px 20px rgba(184,134,46,0.15)' }}>
                <div style={{ fontSize:'0.6rem',color:'#8B6914',fontWeight:700,fontFamily:"'IBM Plex Mono',monospace" }}>TSLA · WATCH</div>
                <div style={{ fontSize:'0.9rem',fontWeight:800,color:'#B8862E',lineHeight:1 }}>Score: 54</div>
              </motion.div>
              <img src="/hero_product.png" alt="Vestro AI Research Dashboard"
                style={{ width:'100%',height:'auto',display:'block', clipPath: 'inset(8% 7% 8% 7% round 14px)', transform: 'scale(1.15)' }}/>
            </div>
            {/* BACK side */}
            <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(135deg, #0A1710, #0B3D28)', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logo.png" alt="Vestro Logo" style={{ width: 140, opacity: 0.95, objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(14,143,91,0.4))' }} />
              <div style={{ marginTop: 20, color: '#0E8F5B', fontFamily: "'Fraunces', serif", fontSize: '1.4rem', fontWeight: 700 }}>Vestro AI</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:2 }}
        style={{ position:'absolute',bottom:28,left:'50%',transform:'translateX(-50%)' }}>
        <motion.div animate={{ y:[0,8,0] }} transition={{ repeat:Infinity,duration:1.8,ease:'easeInOut' }}>
          <ArrowDown size={18} color="#9AA69F"/>
        </motion.div>
      </motion.div>
    </section>
  )
}

// ─── PROBLEMS ─────────────────────────────────────────────────────────────────
function ProblemsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })
  return (
    <section ref={ref} style={{ background: '#fff', padding: '100px 24px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <motion.div initial={{ opacity:0,y:32 }} animate={inView?{ opacity:1,y:0 }:{}} transition={{ duration:0.8 }}
          style={{ textAlign:'center',maxWidth:560,margin:'0 auto 64px' }}>
          <p style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:'0.72rem',color:'#C8443A',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:14,fontWeight:700 }}>The problem</p>
          <h2 style={{ fontFamily:"'Fraunces',serif",fontSize:'clamp(2rem,5vw,3.2rem)',fontWeight:600,color:'#0F211A',letterSpacing:'-0.03em',margin:'0 0 16px',lineHeight:1.08 }}>
            Investment research<br/>is completely broken.
          </h2>
          <p style={{ fontSize:'1rem',color:'#5B6B63',lineHeight:1.7,margin:0 }}>Here's what every serious investor faces before making any decision.</p>
        </motion.div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:20 }}>
          {PROBLEMS.map((p,i)=>(
            <motion.div key={p.title}
              initial={{ opacity:0,y:40 }} animate={inView?{ opacity:1,y:0 }:{}}
              transition={{ delay:i*0.12,duration:0.7,ease:[0.22,1,0.36,1] }}
              whileHover={{ y:-6 }}
              style={{ background:p.bg,border:`1.5px solid ${p.border}`,borderRadius:22,padding:32,position:'relative',overflow:'hidden' }}>
              <div style={{ position:'absolute',top:20,right:24,fontFamily:"'IBM Plex Mono',monospace",fontSize:'0.65rem',color:`${p.accent}60`,fontWeight:700 }}>0{i+1}</div>
              <div style={{ width:50,height:50,borderRadius:14,background:`${p.accent}18`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20 }}>
                <p.Icon size={24} color={p.accent} strokeWidth={1.8}/>
              </div>
              <h3 style={{ fontFamily:"'Inter',sans-serif",fontSize:'1.1rem',fontWeight:700,color:'#0F211A',margin:'0 0 12px',letterSpacing:'-0.01em' }}>{p.title}</h3>
              <p style={{ fontSize:'0.9rem',color:'#5B6B63',lineHeight:1.7,margin:'0 0 20px' }}>{p.desc}</p>
              <div style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'8px 14px',background:'rgba(255,255,255,0.7)',border:`1px solid ${p.border}`,borderRadius:10 }}>
                <div style={{ width:6,height:6,borderRadius:'50%',background:'#0E8F5B',flexShrink:0 }}/>
                <span style={{ fontSize:'0.78rem',fontWeight:600,color:'#0B6E46',lineHeight:1.4 }}>{p.fix}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── GLOBE (dark bg, real world map) ─────────────────────────────────────────
function GlobeSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once:true,amount:0.2 })
  return (
    <section ref={ref} style={{ background:'#0F211A',padding:'100px 24px',position:'relative',overflow:'hidden' }}>
      <div aria-hidden style={{ position:'absolute',inset:0,pointerEvents:'none' }}>
        <div style={{ position:'absolute',top:'50%',left:'30%',width:600,height:600,borderRadius:'50%',background:'radial-gradient(ellipse,rgba(14,143,91,0.08) 0%,transparent 70%)',transform:'translate(-50%,-50%)' }}/>
        <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%',opacity:0.04 }}>
          <defs><pattern id="dg" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0L0 0 0 60" fill="none" stroke="#0E8F5B" strokeWidth="1"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#dg)"/>
        </svg>
      </div>
      <div style={{ maxWidth:1080,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center',position:'relative',zIndex:1 }}>
        <motion.div initial={{ opacity:0,scale:0.85 }} animate={inView?{ opacity:1,scale:1 }:{}} transition={{ duration:1,ease:[0.22,1,0.36,1] }}
          style={{ display:'flex',justifyContent:'center',position:'relative' }}>
          <div style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:420,height:420,borderRadius:'50%',background:'radial-gradient(ellipse,rgba(14,143,91,0.1) 0%,transparent 70%)',pointerEvents:'none' }}/>
          <CanvasGlobe size={350}/>
        </motion.div>
        <motion.div initial={{ opacity:0,x:40 }} animate={inView?{ opacity:1,x:0 }:{}} transition={{ delay:0.2,duration:0.8,ease:[0.22,1,0.36,1] }}>
          <p style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:'0.72rem',color:'rgba(14,143,91,0.8)',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:16,fontWeight:700 }}>Global coverage</p>
          <h2 style={{ fontFamily:"'Fraunces',serif",fontSize:'clamp(2rem,4vw,3rem)',fontWeight:600,color:'#fff',letterSpacing:'-0.03em',lineHeight:1.1,margin:'0 0 20px' }}>
            Every market.<br/>One platform.
          </h2>
          <p style={{ fontSize:'0.95rem',color:'rgba(255,255,255,0.5)',lineHeight:1.7,margin:'0 0 36px',maxWidth:360 }}>
            Research stocks from major exchanges worldwide. Vestro covers US, Indian, European, Japanese, Chinese, and Australian markets.
          </p>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginBottom:32 }}>
            {GLOBE_CITIES.map(c=>(
              <div key={c.label} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10 }}>
                <div style={{ width:8,height:8,borderRadius:'50%',background:'#0E8F5B',flexShrink:0,boxShadow:'0 0 6px #0E8F5B' }}/>
                <div>
                  <div style={{ fontSize:'0.8rem',fontWeight:600,color:'#fff' }}>{c.label}</div>
                  <div style={{ fontSize:'0.65rem',color:'rgba(255,255,255,0.35)',fontFamily:"'IBM Plex Mono',monospace" }}>{c.ex}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex',gap:28 }}>
            {[['50K+','Companies'],['10+','Exchanges'],['6','Continents']].map(([val,lab])=>(
              <div key={lab}>
                <div style={{ fontFamily:"'Fraunces',serif",fontSize:'2rem',fontWeight:700,color:'#0E8F5B',lineHeight:1 }}>{val}</div>
                <div style={{ fontSize:'0.72rem',color:'rgba(255,255,255,0.4)',marginTop:4,textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:600 }}>{lab}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── ORBITING ─────────────────────────────────────────────────────────────────
function OrbitingSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once:true,amount:0.15 })
  return (
    <section ref={ref} style={{ background:'#FBFBF8',padding:'100px 24px' }}>
      <div style={{ maxWidth:1080,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center' }}>
        <motion.div initial={{ opacity:0,x:-40 }} animate={inView?{ opacity:1,x:0 }:{}} transition={{ duration:0.8,ease:[0.22,1,0.36,1] }}>
          <p style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:'0.72rem',color:'#0E8F5B',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:14,fontWeight:700 }}>One platform</p>
          <h2 style={{ fontFamily:"'Fraunces',serif",fontSize:'clamp(2rem,4vw,3rem)',fontWeight:600,color:'#0F211A',letterSpacing:'-0.03em',lineHeight:1.1,margin:'0 0 20px' }}>
            Stop switching.<br/>Start deciding.
          </h2>
          <p style={{ fontSize:'0.95rem',color:'#5B6B63',lineHeight:1.75,margin:'0 0 32px',maxWidth:380 }}>
            All the data sources you toggle between converge into a single, unified intelligence layer inside Vestro.
          </p>
          {[
            { Icon:Brain,       text:'9-step AI pipeline on real financial data' },
            { Icon:ShieldCheck, text:'Every verdict is explainable and verifiable' },
            { Icon:TrendingUp,  text:'50,000+ companies across all major markets' },
          ].map(({ Icon,text })=>(
            <div key={text} style={{ display:'flex',alignItems:'center',gap:12,marginBottom:14 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:'#E4F5EC',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><Icon size={18} color="#0E8F5B" strokeWidth={1.8}/></div>
              <span style={{ fontSize:'0.9rem',color:'#0F211A',fontWeight:500 }}>{text}</span>
            </div>
          ))}
        </motion.div>
        <motion.div initial={{ opacity:0,scale:0.8 }} animate={inView?{ opacity:1,scale:1 }:{}} transition={{ delay:0.3,duration:0.9,ease:[0.22,1,0.36,1] }}
          style={{ position:'relative',width:380,height:380,margin:'0 auto' }}>
          <div style={{ position:'absolute',top:'50%',left:'50%',width:340,height:340,marginLeft:-170,marginTop:-170,borderRadius:'50%',border:'1px dashed rgba(14,143,91,0.12)' }}/>
          <div style={{ position:'absolute',top:'50%',left:'50%',width:240,height:240,marginLeft:-120,marginTop:-120,borderRadius:'50%',border:'1px dashed rgba(14,143,91,0.18)' }}/>
          <OrbitRing items={ORBIT_ITEMS_2} radius={162} duration={16} dir={1}/>
          <OrbitRing items={ORBIT_ITEMS_1} radius={108} duration={12} dir={-1}/>
          <div style={{ position:'absolute',top:'50%',left:'50%',width:72,height:72,marginLeft:-36,marginTop:-36,borderRadius:20,background:'linear-gradient(135deg,#0E8F5B,#0B6E46)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 32px rgba(14,143,91,0.4)',zIndex:10 }}>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:'1.2rem',fontWeight:800,color:'#fff' }}>V</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── ICON CLOUD + FEATURE LIST ────────────────────────────────────────────────
function IconCloudSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once:true,amount:0.15 })
  return (
    <section ref={ref} style={{ background:'#F5F7F4',padding:'100px 24px' }}>
      <div style={{ maxWidth:1080,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center' }}>
        <motion.div initial={{ opacity:0,scale:0.8 }} animate={inView?{ opacity:1,scale:1 }:{}} transition={{ duration:1,ease:[0.22,1,0.36,1] }}
          style={{ display:'flex',justifyContent:'center' }}>
          <IconCloud3D/>
        </motion.div>
        <motion.div initial={{ opacity:0,x:40 }} animate={inView?{ opacity:1,x:0 }:{}} transition={{ delay:0.2,duration:0.8 }}>
          <p style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:'0.72rem',color:'#0E8F5B',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:14,fontWeight:700 }}>Everything included</p>
          <h2 style={{ fontFamily:"'Fraunces',serif",fontSize:'clamp(2rem,4vw,3rem)',fontWeight:600,color:'#0F211A',letterSpacing:'-0.025em',margin:'0 0 28px' }}>
            Every tool an investor actually needs.
          </h2>
          {[
            { Icon:BarChart2,    label:'AI Research Engine',     desc:"Deep company analysis in seconds" },
            { Icon:Eye,          label:'Smart Watchlist',        desc:"Monitor companies you're considering" },
            { Icon:TrendingUp,   label:'Portfolio Intelligence', desc:"Health scores for every holding" },
            { Icon:Zap,          label:'Scenario Lab',           desc:'Model "what-if" financial scenarios' },
            { Icon:MessageSquare,label:'AI Chat',                desc:"Ask anything, get data-grounded answers" },
            { Icon:Clock,        label:'Research History',       desc:"Revisit every analysis you've run" },
          ].map(({ Icon,label,desc },i)=>(
            <motion.div key={label} initial={{ opacity:0,x:20 }} animate={inView?{ opacity:1,x:0 }:{}} transition={{ delay:0.3+i*0.07,duration:0.5 }}
              style={{ display:'flex',alignItems:'center',gap:14,padding:'16px 0',borderBottom:'1px solid #E5E8E2' }}>
              <div style={{ width:38,height:38,borderRadius:10,background:'#E4F5EC',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><Icon size={18} color="#0E8F5B" strokeWidth={1.8}/></div>
              <div>
                <div style={{ fontSize:'0.9rem',fontWeight:700,color:'#0F211A' }}>{label}</div>
                <div style={{ fontSize:'0.78rem',color:'#9AA69F' }}>{desc}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── DOTTED MAP (dark bg, real world map) ─────────────────────────────────────
function DottedMapSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once:true,amount:0.1 })
  return (
    <section ref={ref} style={{ background:'#0F211A',padding:'80px 24px 100px',position:'relative',overflow:'hidden' }}>
      <div aria-hidden style={{ position:'absolute',inset:0,pointerEvents:'none' }}>
        <div style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:'100%',height:'100%',background:'radial-gradient(ellipse at center,rgba(14,143,91,0.05) 0%,transparent 70%)' }}/>
      </div>
      <motion.div initial={{ opacity:0,y:32 }} animate={inView?{ opacity:1,y:0 }:{}} transition={{ duration:0.8 }}
        style={{ textAlign:'center',marginBottom:52,position:'relative',zIndex:1 }}>
        <p style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:'0.72rem',color:'rgba(14,143,91,0.8)',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:14,fontWeight:700 }}>Research without borders</p>
        <h2 style={{ fontFamily:"'Fraunces',serif",fontSize:'clamp(2rem,4vw,3rem)',fontWeight:600,color:'#fff',letterSpacing:'-0.03em',margin:0 }}>
          Your market is wherever you are.
        </h2>
      </motion.div>
      <motion.div initial={{ opacity:0,scale:0.96 }} animate={inView?{ opacity:1,scale:1 }:{}} transition={{ delay:0.2,duration:1 }}
        style={{ position:'relative',zIndex:1 }}>
        <WorldMap/>
      </motion.div>
      <div style={{ display:'flex',justifyContent:'center',gap:40,marginTop:40,flexWrap:'wrap',position:'relative',zIndex:1 }}>
        {[['NYSE · NASDAQ','United States'],['NSE · BSE','India'],['LSE','United Kingdom'],['TSE · SSE','Asia'],['ASX','Australia']].map(([ex,country])=>(
          <div key={ex} style={{ textAlign:'center' }}>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:'0.78rem',fontWeight:700,color:'#0E8F5B' }}>{ex}</div>
            <div style={{ fontSize:'0.7rem',color:'rgba(255,255,255,0.35)',marginTop:2 }}>{country}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── FEATURES ─────────────────────────────────────────────────────────────────
function FeatureRow({ feat, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once:true,amount:0.25 })
  const isEven = index % 2 === 0
  return (
    <div ref={ref} style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center',padding:'70px 0' }}>
      <motion.div initial={{ opacity:0,x:isEven?-50:50 }} animate={inView?{ opacity:1,x:0 }:{}} transition={{ duration:0.85,ease:[0.22,1,0.36,1] }} style={{ order:isEven?0:1 }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:18 }}>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:'0.62rem',color:'#0E8F5B',fontWeight:700,letterSpacing:'0.1em' }}>{feat.num}</span>
          <div style={{ width:1,height:14,background:'#E5E8E2' }}/>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:'0.62rem',color:'#9AA69F',letterSpacing:'0.1em',textTransform:'uppercase' }}>{feat.tag}</span>
        </div>
        <h3 style={{ fontFamily:"'Fraunces',serif",fontSize:'clamp(1.8rem,3.5vw,2.6rem)',fontWeight:600,color:'#0F211A',letterSpacing:'-0.025em',lineHeight:1.1,margin:'0 0 18px' }}>{feat.title}</h3>
        <p style={{ fontSize:'0.95rem',color:'#5B6B63',lineHeight:1.75,margin:'0 0 28px' }}>{feat.body}</p>
        <div style={{ padding:'14px 20px',background:'#E4F5EC',borderRadius:12,display:'inline-block' }}>
          <div style={{ fontFamily:"'Fraunces',serif",fontSize:'2rem',fontWeight:700,color:'#0E8F5B',lineHeight:1 }}>{feat.stat}</div>
          <div style={{ fontSize:'0.7rem',color:'#0B6E46',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',marginTop:4 }}>{feat.statLabel}</div>
        </div>
      </motion.div>
      <motion.div initial={{ opacity:0,x:isEven?60:-60,scale:0.9 }} animate={inView?{ opacity:1,x:0,scale:1 }:{}} transition={{ delay:0.15,duration:0.9,ease:[0.22,1,0.36,1] }} style={{ order:isEven?1:0 }}>
        <div style={{ borderRadius:22,overflow:'hidden',boxShadow:'0 32px 80px rgba(15,33,26,0.18)',border:'1px solid rgba(229,232,226,0.5)' }}>
          <img src={feat.img} alt={feat.imgAlt} style={{ width:'100%',height:'auto',display:'block' }}/>
        </div>
      </motion.div>
    </div>
  )
}

function FeaturesSection() {
  return (
    <section style={{ background:'#FBFBF8',padding:'40px 0 80px' }}>
      <div style={{ maxWidth:1080,margin:'0 auto',padding:'0 48px' }}>
        <motion.div initial={{ opacity:0,y:32 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true,amount:0.3 }} transition={{ duration:0.8 }}
          style={{ textAlign:'center',maxWidth:520,margin:'0 auto 20px' }}>
          <p style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:'0.72rem',color:'#0E8F5B',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:14,fontWeight:700 }}>The product</p>
          <h2 style={{ fontFamily:"'Fraunces',serif",fontSize:'clamp(2rem,4vw,3rem)',fontWeight:600,color:'#0F211A',letterSpacing:'-0.025em',margin:0 }}>
            Everything you need.<br/>Nothing you don't.
          </h2>
        </motion.div>
        {FEATURES.map((feat,i)=><FeatureRow key={feat.num} feat={feat} index={i}/>)}
      </div>
    </section>
  )
}

// ─── COMPARISON ───────────────────────────────────────────────────────────────
function Comparison() {
  const cols = [
    { key:'yahoo',label:'Yahoo Finance' },{ key:'tickertape',label:'Tickertape' },
    { key:'chatgpt',label:'ChatGPT' },{ key:'vestro',label:'Vestro AI',highlight:true },
  ]
  return (
    <section style={{ background:'#F5F7F4',padding:'100px 24px' }}>
      <div style={{ maxWidth:860,margin:'0 auto' }}>
        <motion.div initial={{ opacity:0,y:28 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ duration:0.8 }}
          style={{ textAlign:'center',maxWidth:440,margin:'0 auto 52px' }}>
          <p style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:'0.72rem',color:'#0E8F5B',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:14,fontWeight:700 }}>One honest comparison</p>
          <h2 style={{ fontFamily:"'Fraunces',serif",fontSize:'clamp(2rem,4vw,3rem)',fontWeight:600,color:'#0F211A',letterSpacing:'-0.025em',margin:0 }}>Why Vestro?</h2>
        </motion.div>
        <motion.div initial={{ opacity:0,y:28 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ duration:0.9 }}
          style={{ background:'#fff',border:'1px solid #E5E8E2',borderRadius:20,overflow:'hidden',boxShadow:'0 8px 40px rgba(15,33,26,0.06)' }}>
          <div style={{ display:'grid',gridTemplateColumns:`2fr ${cols.map(()=>'1fr').join(' ')}`,background:'#FAFAF8',borderBottom:'1px solid #E5E8E2' }}>
            <div style={{ padding:'14px 22px',fontSize:'0.7rem',color:'#9AA69F',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em' }}>Feature</div>
            {cols.map(c=>(
              <div key={c.key} style={{ padding:'14px 0',textAlign:'center',borderLeft:`1px solid ${c.highlight?'rgba(14,143,91,0.2)':'#E5E8E2'}`,background:c.highlight?'rgba(14,143,91,0.04)':'transparent' }}>
                <span style={{ fontSize:c.highlight?'0.78rem':'0.73rem',fontWeight:c.highlight?800:600,color:c.highlight?'#0E8F5B':'#5B6B63',fontFamily:c.highlight?"'IBM Plex Mono',monospace":'inherit' }}>{c.label}</span>
              </div>
            ))}
          </div>
          {COMPARISON_ROWS.map((row,i)=>(
            <motion.div key={row.feature} initial={{ opacity:0,x:-10 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }} transition={{ delay:i*0.04 }}
              style={{ display:'grid',gridTemplateColumns:`2fr ${cols.map(()=>'1fr').join(' ')}`,borderBottom:i<COMPARISON_ROWS.length-1?'1px solid #F5F7F4':'none' }}>
              <div style={{ padding:'13px 22px',fontSize:'0.875rem',color:'#0F211A',fontWeight:500,display:'flex',alignItems:'center' }}>{row.feature}</div>
              {cols.map(c=>(
                <div key={c.key} style={{ padding:'13px 0',display:'flex',alignItems:'center',justifyContent:'center',borderLeft:`1px solid ${c.highlight?'rgba(14,143,91,0.1)':'#F5F7F4'}`,background:c.highlight?'rgba(14,143,91,0.03)':'transparent' }}>
                  <CmpCell v={row[c.key]} highlight={c.highlight}/>
                </div>
              ))}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTASection() {
  const navigate = useNavigate()
  return (
    <section style={{ background:'linear-gradient(135deg,#0A1710 0%,#0B3D28 50%,#0A1710 100%)',padding:'120px 24px 80px',textAlign:'center',position:'relative',overflow:'hidden' }}>
      <div aria-hidden style={{ position:'absolute',inset:0,pointerEvents:'none' }}>
        <div style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:800,height:600,borderRadius:'50%',background:'radial-gradient(ellipse,rgba(14,143,91,0.12) 0%,transparent 70%)' }}/>
        <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%',opacity:0.03 }}>
          <defs><pattern id="ctap" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0L0 0 0 60" fill="none" stroke="#0E8F5B" strokeWidth="1"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#ctap)"/>
        </svg>
      </div>
      <motion.div initial={{ opacity:0,y:40 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true,amount:0.3 }} transition={{ duration:0.9,ease:[0.22,1,0.36,1] }}
        style={{ position:'relative',zIndex:10,maxWidth:700,margin:'0 auto' }}>
        <div style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'6px 16px',background:'rgba(14,143,91,0.15)',border:'1px solid rgba(14,143,91,0.3)',borderRadius:99,marginBottom:32 }}>
          <div style={{ width:6,height:6,borderRadius:'50%',background:'#0E8F5B',boxShadow:'0 0 8px #0E8F5B' }}/>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:'0.7rem',color:'#0E8F5B',letterSpacing:'0.1em' }}>FREE TO START · NO CREDIT CARD</span>
        </div>
        <h2 style={{ fontFamily:"'Fraunces',serif",fontSize:'clamp(2.8rem,7vw,5.5rem)',fontWeight:600,lineHeight:1.02,letterSpacing:'-0.04em',color:'#fff',margin:'0 0 24px' }}>
          Research smarter.<br/><em style={{ color:'#0E8F5B',fontStyle:'italic' }}>Not harder.</em>
        </h2>
        <p style={{ fontSize:'1.05rem',color:'rgba(255,255,255,0.5)',lineHeight:1.7,maxWidth:440,margin:'0 auto 48px' }}>
          Stop switching between 7 different tools. One search. One verdict. Real data.
        </p>
        <div style={{ display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap' }}>
          <motion.button onClick={()=>navigate('/research')}
            whileHover={{ scale:1.04,boxShadow:'0 0 50px rgba(14,143,91,0.45)' }} whileTap={{ scale:0.97 }}
            style={{ display:'flex',alignItems:'center',gap:10,padding:'16px 40px',background:'linear-gradient(135deg,#0E8F5B,#0B6E46)',border:'none',borderRadius:14,color:'#fff',fontWeight:700,fontSize:'1.05rem',cursor:'pointer',boxShadow:'0 4px 24px rgba(14,143,91,0.35)',fontFamily:"'Inter',sans-serif" }}>
            Start Researching <ArrowRight size={18}/>
          </motion.button>
          <motion.button onClick={()=>navigate('/learn')} whileHover={{ scale:1.03 }}
            style={{ padding:'16px 28px',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:14,color:'rgba(255,255,255,0.8)',fontWeight:600,fontSize:'1rem',cursor:'pointer',fontFamily:"'Inter',sans-serif" }}>
            Learn More →
          </motion.button>
        </div>
        <p style={{ marginTop:28,fontSize:'0.8rem',color:'rgba(255,255,255,0.3)' }}>Real data · Honest AI · No black box</p>
      </motion.div>
    </section>
  )
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  const navigate = useNavigate()
  return (
    <footer style={{ background:'#060E09',padding:'60px 48px 36px',borderTop:'1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth:1080,margin:'0 auto' }}>
        <div style={{ display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:40,marginBottom:48 }}>
          <div style={{ maxWidth:280 }}>
            <div style={{ display:'flex',alignItems:'center',gap:9,marginBottom:14 }}>
              <img src="/logo.png" alt="Vestro AI" style={{ height:36,objectFit:'contain' }}/>
              <span style={{ fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:18,color:'#fff' }}>Vestro AI</span>
            </div>
            <p style={{ fontSize:'0.85rem',color:'rgba(255,255,255,0.3)',lineHeight:1.7,margin:0 }}>AI investment research on real data. For fundamentals-first investors.</p>
          </div>
          <div style={{ display:'flex',gap:60,flexWrap:'wrap' }}>
            {[
              { title:'Product',links:['Research','Portfolio','Watchlist','Simulator','Analytics'] },
              { title:'Resources',links:['Learn','History','Reports','AI Chat'] },
            ].map(col=>(
              <div key={col.title}>
                <div style={{ fontSize:'0.72rem',fontWeight:700,color:'rgba(255,255,255,0.25)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:14 }}>{col.title}</div>
                <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                  {col.links.map(l=>(
                    <span key={l} style={{ fontSize:'0.875rem',color:'rgba(255,255,255,0.4)',cursor:'pointer',transition:'color 0.2s' }}
                      onMouseEnter={e=>e.target.style.color='#fff'}
                      onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.4)'}
                      onClick={()=>navigate(`/${l.toLowerCase().replace(' ','-')}`)}>
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:24,display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:12 }}>
          <p style={{ fontSize:'0.78rem',color:'rgba(255,255,255,0.2)',margin:0 }}>© 2026 Vestro AI. Not financial advice.</p>
          <p style={{ fontSize:'0.72rem',color:'rgba(255,255,255,0.15)',margin:0,fontFamily:"'IBM Plex Mono',monospace" }}>v2.0 · Real data · Honest AI</p>
        </div>
      </div>
    </footer>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ overflowX: 'hidden' }}>
      <HeroSection />
      <Marquee />
      <ProblemsSection />
      <GlobeSection />
      <OrbitingSection />
      <IconCloudSection />
      <DottedMapSection />
      <FeaturesSection />
      <Comparison />
      <CTASection />
      <Footer />
    </div>
  )
}
