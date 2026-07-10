import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Home } from 'lucide-react'

const NAV_LINKS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/learn', label: 'Learn', icon: BookOpen },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E5E8E2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        height: 64,
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #0E8F5B 0%, #0B6E46 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          V
        </div>
        <span
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
            fontSize: 20,
            color: '#0F211A',
            letterSpacing: '-0.01em',
          }}
        >
          Vestro
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {NAV_LINKS.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: isActive ? '#0F211A' : '#5B6B63',
                background: isActive ? '#EFF1EC' : 'transparent',
              }}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </div>


    </nav>
  )
}
