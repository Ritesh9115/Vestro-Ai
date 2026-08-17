import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'

// ── Fibonacci sphere: uniformly distributed globe dots ────────────────────────
function fibonacciSphere(n) {
  const pts = []
  const phi = Math.PI * (Math.sqrt(5) - 1) // golden angle
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = phi * i
    pts.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r })
  }
  return pts
}

// ── Ease function ─────────────────────────────────────────────────────────────
function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const lerp = (a, b, t) => a + (b - a) * t

// ── Key city markers ─────────────────────────────────────────────────────────
const CITY_MARKERS = [
  { lat: 40.71, lng: -74.0, label: 'New York',     tag: 'NYSE/NASDAQ' },
  { lat: 19.08, lng: 72.88, label: 'Mumbai',       tag: 'NSE · BSE'   },
  { lat: 51.51, lng: -0.13, label: 'London',       tag: 'LSE'         },
  { lat: 35.69, lng: 139.7, label: 'Tokyo',        tag: 'TSE'         },
  { lat: 31.23, lng: 121.5, label: 'Shanghai',     tag: 'SSE'         },
  { lat: -33.9, lng: 151.2, label: 'Sydney',       tag: 'ASX'         },
]

function latLngTo3D(lat, lng) {
  const phi = (90 - lat) * Math.PI / 180
  const theta = (lng + 180) * Math.PI / 180
  return {
    x: -Math.sin(phi) * Math.cos(theta),
    y: Math.cos(phi),
    z: Math.sin(phi) * Math.sin(theta),
  }
}

function project3D(pt, rotY, cx, cy, radius) {
  // Rotate around Y axis
  const cosR = Math.cos(rotY), sinR = Math.sin(rotY)
  const rx = pt.x * cosR + pt.z * sinR
  const ry = pt.y
  const rz = -pt.x * sinR + pt.z * cosR
  return {
    sx: cx + rx * radius,
    sy: cy - ry * radius,
    depth: rz,
  }
}

const N_DOTS = 1400

export default function GlobeConverge({ scrollProgress }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    randomPos: [],       // {x,y} — scattered start positions
    globePos: [],        // {x,y,z} — unit sphere positions
    rotation: 0,
    progress: 0,
    animFrame: null,
  })
  const containerRef = useRef(null)
  const [phase, setPhase] = useState('scatter') // 'scatter' | 'converge' | 'globe'

  useMotionValueEvent(scrollProgress, 'change', (val) => {
    stateRef.current.progress = val
    if (val < 0.1) setPhase('scatter')
    else if (val < 0.75) setPhase('converge')
    else setPhase('globe')
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function setup() {
      const W = canvas.parentElement.clientWidth
      const H = canvas.parentElement.clientHeight
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.scale(dpr, dpr)

      const cx = W / 2, cy = H / 2
      const R = Math.min(W, H) * 0.36

      // Random scattered positions (full screen, slightly biased inward)
      stateRef.current.randomPos = Array.from({ length: N_DOTS }, () => ({
        x: W * 0.1 + Math.random() * W * 0.8,
        y: H * 0.1 + Math.random() * H * 0.8,
      }))

      // Target globe positions
      const spherePts = fibonacciSphere(N_DOTS)
      stateRef.current.globePos = spherePts.map(p => ({ x: p.x, y: p.y, z: p.z, cx, cy, R }))

      stateRef.current.cx = cx
      stateRef.current.cy = cy
      stateRef.current.R = R
      stateRef.current.W = W
      stateRef.current.H = H
    }

    setup()
    window.addEventListener('resize', setup)

    function draw() {
      const { randomPos, globePos, progress, rotation, cx, cy, R, W, H } = stateRef.current
      if (!W || !H || !globePos.length) {
        stateRef.current.animFrame = requestAnimationFrame(draw)
        return
      }

      ctx.clearRect(0, 0, W, H)

      // Ease the convergence progress (0→1 maps to scatter→globe)
      const t = easeInOut(Math.max(0, Math.min(1, progress * 1.4)))
      const cosR = Math.cos(rotation), sinR = Math.sin(rotation)

      for (let i = 0; i < N_DOTS; i++) {
        const rand = randomPos[i]
        const g = globePos[i]

        // Project globe target to screen
        const rx = g.x * cosR + g.z * sinR
        const ry = g.y
        const rz = -g.x * sinR + g.z * cosR
        const tx = cx + rx * R
        const ty = cy - ry * R
        const depth = rz // -1 (back) to +1 (front)
        const isFront = depth > -0.2

        // Current position: interpolate random → globe
        const px = lerp(rand.x, tx, t)
        const py = lerp(rand.y, ty, t)

        // Opacity: scattered = faint, converged = depth-based
        const scatterAlpha = 0.35
        const globeAlpha = isFront ? 0.2 + depth * 0.7 : 0
        const alpha = lerp(scatterAlpha, globeAlpha, t)

        if (alpha < 0.01) continue

        // Dot size: scattered = smaller, globe front = slightly larger
        const dotR = lerp(0.9, isFront ? 1.4 + depth * 0.6 : 0.3, t)

        // Color: scatter = muted, globe = brand green
        const scatterColor = `rgba(91,107,99,${alpha})`
        const globeColor = `rgba(14,143,91,${alpha})`
        ctx.fillStyle = t < 0.5 ? scatterColor : globeColor

        ctx.beginPath()
        ctx.arc(px, py, Math.max(0.1, dotR), 0, Math.PI * 2)
        ctx.fill()
      }

      // Globe outline (appears when converged)
      if (t > 0.5) {
        const outlineAlpha = (t - 0.5) * 2
        ctx.beginPath()
        ctx.arc(cx, cy, R, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(14,143,91,${outlineAlpha * 0.15})`
        ctx.lineWidth = 1
        ctx.stroke()

        // Latitude lines
        for (let lat = -60; lat <= 60; lat += 30) {
          const latR = lat * Math.PI / 180
          const r2 = Math.cos(latR) * R
          const yy = cy - Math.sin(latR) * R
          ctx.beginPath()
          ctx.ellipse(cx, yy, r2, r2 * 0.18, 0, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(14,143,91,${outlineAlpha * 0.08})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }

        // City markers
        CITY_MARKERS.forEach(city => {
          const p3 = latLngTo3D(city.lat, city.lng)
          const px = p3.x * cosR + p3.z * sinR
          const py2 = p3.y
          const pz = -p3.x * sinR + p3.z * cosR
          if (pz < 0) return
          const sx = cx + px * R
          const sy2 = cy - py2 * R
          const a = outlineAlpha * (0.5 + pz * 0.5)
          // Pulse ring
          ctx.beginPath()
          ctx.arc(sx, sy2, 6, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(14,143,91,${a * 0.2})`
          ctx.fill()
          // Core
          ctx.beginPath()
          ctx.arc(sx, sy2, 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(14,143,91,${a * 0.9})`
          ctx.fill()
          ctx.beginPath()
          ctx.arc(sx, sy2, 1.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${a * 0.8})`
          ctx.fill()
        })
      }

      // Slow rotation (only when mostly converged)
      if (t > 0.6) {
        stateRef.current.rotation += 0.002 * ((t - 0.6) / 0.4)
      }

      stateRef.current.animFrame = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(stateRef.current.animFrame)
      window.removeEventListener('resize', setup)
    }
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  )
}
