import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

// Key financial hubs with lat/lng
const CITIES = [
  { lat: 40.71, lng: -74.01, name: 'New York',    tag: 'NYSE' },
  { lat: 37.77, lng: -122.4, name: 'San Francisco', tag: 'NASDAQ' },
  { lat: 51.51, lng: -0.13,  name: 'London',       tag: 'LSE'   },
  { lat: 48.86, lng: 2.35,   name: 'Paris',        tag: 'Euronext' },
  { lat: 19.08, lng: 72.88,  name: 'Mumbai',       tag: 'NSE/BSE' },
  { lat: 35.69, lng: 139.69, name: 'Tokyo',        tag: 'TSE'  },
  { lat: 31.23, lng: 121.47, name: 'Shanghai',     tag: 'SSE'  },
  { lat: -33.87, lng: 151.21, name: 'Sydney',      tag: 'ASX'  },
  { lat: 25.2,  lng: 55.27,  name: 'Dubai',        tag: 'DFM'  },
  { lat: 1.35,  lng: 103.82, name: 'Singapore',    tag: 'SGX'  },
]

// Connection pairs (index pairs)
const CONNECTIONS = [[0,1],[0,2],[2,3],[3,4],[4,5],[5,6],[5,9],[6,7],[7,9]]

function projectPoint(lat, lng, rotation, cx, cy, r) {
  const latR = lat * Math.PI / 180
  const lngR = (lng + rotation) * Math.PI / 180
  const x = Math.cos(latR) * Math.cos(lngR)
  const y = Math.sin(latR)
  const z = Math.cos(latR) * Math.sin(lngR)
  return { x: cx + x * r, y: cy - y * r, visible: z > -0.1, depth: z }
}

function drawGlobe(ctx, rotation, w, h, showConnections) {
  ctx.clearRect(0, 0, w, h)
  const cx = w / 2, cy = h / 2
  const r = Math.min(w, h) * 0.38

  // Sphere background glow
  const grd = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r * 1.1)
  grd.addColorStop(0, 'rgba(228,245,236,0.12)')
  grd.addColorStop(1, 'rgba(228,245,236,0)')
  ctx.fillStyle = grd
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  // Sphere outline
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(14,143,91,0.15)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Latitude lines
  for (let lat = -75; lat <= 75; lat += 30) {
    ctx.beginPath()
    let started = false
    for (let lng = -180; lng <= 180; lng += 3) {
      const p = projectPoint(lat, lng, rotation, cx, cy, r)
      if (!p.visible) { started = false; continue }
      if (!started) { ctx.moveTo(p.x, p.y); started = true }
      else ctx.lineTo(p.x, p.y)
    }
    ctx.strokeStyle = 'rgba(14,143,91,0.08)'
    ctx.lineWidth = 0.5
    ctx.stroke()
  }

  // Longitude lines
  for (let lng = 0; lng < 360; lng += 30) {
    ctx.beginPath()
    let started = false
    for (let lat = -90; lat <= 90; lat += 3) {
      const p = projectPoint(lat, lng, rotation, cx, cy, r)
      if (!p.visible) { started = false; continue }
      if (!started) { ctx.moveTo(p.x, p.y); started = true }
      else ctx.lineTo(p.x, p.y)
    }
    ctx.strokeStyle = 'rgba(14,143,91,0.06)'
    ctx.lineWidth = 0.5
    ctx.stroke()
  }

  // Project all cities
  const projected = CITIES.map(c => ({
    ...c,
    ...projectPoint(c.lat, c.lng, rotation, cx, cy, r),
  }))

  // Connection arcs
  if (showConnections) {
    CONNECTIONS.forEach(([a, b]) => {
      const pa = projected[a], pb = projected[b]
      if (!pa.visible || !pb.visible) return
      const alpha = Math.min(pa.depth, pb.depth) * 0.5
      ctx.beginPath()
      const mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2 - 30
      ctx.moveTo(pa.x, pa.y)
      ctx.quadraticCurveTo(mx, my, pb.x, pb.y)
      ctx.strokeStyle = `rgba(14,143,91,${alpha * 0.4})`
      ctx.lineWidth = 0.8
      ctx.setLineDash([3, 5])
      ctx.stroke()
      ctx.setLineDash([])
    })
  }

  // City dots
  projected.forEach(({ x, y, visible, depth }) => {
    if (!visible) return
    const alpha = 0.3 + depth * 0.7

    // Outer glow
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 10)
    glow.addColorStop(0, `rgba(14,143,91,${alpha * 0.4})`)
    glow.addColorStop(1, 'rgba(14,143,91,0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(x, y, 10, 0, Math.PI * 2)
    ctx.fill()

    // Core dot
    ctx.beginPath()
    ctx.arc(x, y, 3.5, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(14,143,91,${alpha})`
    ctx.fill()

    ctx.beginPath()
    ctx.arc(x, y, 1.5, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`
    ctx.fill()
  })
}

export default function GlobeSection() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const rotRef = useRef(0)
  const frameRef = useRef(null)
  const isInView = useInView(containerRef, { amount: 0.3, once: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    function resize() {
      const size = Math.min(500, window.innerWidth - 80)
      canvas.style.width = size + 'px'
      canvas.style.height = size + 'px'
      canvas.width = size * dpr
      canvas.height = size * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    function animate() {
      rotRef.current += 0.15
      const size = parseInt(canvas.style.width)
      drawGlobe(ctx, rotRef.current, size, size, isInView)
      frameRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [isInView])

  return (
    <section
      ref={containerRef}
      style={{
        background: 'linear-gradient(to bottom, #FBFBF8 0%, #0F211A 20%, #0F211A 80%, #0F211A 100%)',
        padding: '120px 24px 0',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Section lead text — bridges from the Problem section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 80px' }}
      >
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16,
        }}>
          Global coverage
        </p>
        <h2 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
          fontWeight: 600, lineHeight: 1.1,
          letterSpacing: '-0.025em', color: '#fff',
          margin: '0 0 20px',
        }}>
          Every market.<br />
          One research engine.
        </h2>
        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 440, margin: '0 auto' }}>
          From NASDAQ to NSE, NYSE to TSE — Vestro covers companies across
          US, India, Europe, Japan, China and Australia.
        </p>
      </motion.div>

      {/* Globe */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
      >
        <canvas
          ref={canvasRef}
          style={{ display: 'block', borderRadius: '50%', cursor: 'default' }}
        />

        {/* City labels — orbit the globe */}
        <div style={{ marginTop: 48, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 560, padding: '0 24px 0' }}>
          {CITIES.map((city, i) => (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 99, padding: '6px 14px',
              }}
            >
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#0E8F5B' }} />
              <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.7)', fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                {city.name}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontFamily: "'IBM Plex Mono', monospace" }}>
                {city.tag}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Fade into the Journey section below */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
          background: 'linear-gradient(to bottom, transparent, #0F211A)',
          pointerEvents: 'none',
        }} />
      </motion.div>
    </section>
  )
}
