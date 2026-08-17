import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, Home, BarChart2, Eye, Zap, Clock, Star, BarChart, User, LogOut, ChevronDown, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { path: '/research', label: 'Research', icon: Search },
  { path: '/learn', label: 'Learn', icon: BookOpen },
  { path: '/analytics', label: 'Analytics', icon: BarChart },
]

const AUTH_LINKS = [
  { path: '/portfolio', label: 'Portfolio', icon: BarChart2 },
  { path: '/watchlist', label: 'Watchlist', icon: Eye },
  { path: '/simulator', label: 'Simulator', icon: Zap },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // ALL hooks must be called before any conditional return
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Hide Navbar on auth pages — AFTER all hooks
  const isAuthPage = ['/login', '/signup', '/forgot-password'].some((p) => location.pathname.startsWith(p)) || location.pathname.startsWith('/reset-password')
  if (isAuthPage) return null

  async function handleLogout() {
    await logout()
    toast.success('Logged out')
    navigate('/')
    setDropdownOpen(false)
  }

  const allLinks = user ? [...NAV_LINKS, ...AUTH_LINKS] : NAV_LINKS

  return (
    <nav
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E5E8E2',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 64,
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
        <img
          src="/logo.png"
          alt="Vestro AI"
          style={{ height: 40, width: 'auto', objectFit: 'contain' }}
        />
        <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '1.15rem', color: '#0F211A', letterSpacing: '-0.01em' }}>Vestro AI</span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {allLinks.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path
          return (
            <Link key={path} to={path}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, color: isActive ? '#0F211A' : '#5B6B63', background: isActive ? '#EFF1EC' : 'transparent', transition: 'all 0.15s' }}>
              <Icon size={14} />
              {label}
            </Link>
          )
        })}
      </div>

      {/* Right: auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user ? (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px 6px 8px', background: '#F5F7F4', border: '1px solid #E5E8E2', borderRadius: 100, cursor: 'pointer' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#0E8F5B,#0B6E46)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 800 }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F211A', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name?.split(' ')[0]}</span>
              <ChevronDown size={12} color="#9AA69F" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {dropdownOpen && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: '#fff', border: '1px solid #E5E8E2', borderRadius: 12, padding: 6, minWidth: 200, boxShadow: '0 12px 40px rgba(15,33,26,0.12)', zIndex: 200 }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #F5F7F4', marginBottom: 4 }}>
                  <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F211A', margin: 0 }}>{user.name}</p>
                  <p style={{ color: '#9AA69F', fontSize: '0.72rem', margin: '2px 0 0' }}>{user.email}</p>
                </div>
                {[
                  { to: '/me', label: 'Dashboard', icon: <User size={13} /> },
                  { to: '/history', label: 'History', icon: <Clock size={13} /> },
                  { to: '/reports', label: 'Saved Reports', icon: <Star size={13} /> },
                ].map((item) => (
                  <Link key={item.to} to={item.to} onClick={() => setDropdownOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, textDecoration: 'none', color: '#0F211A', fontSize: '0.85rem', fontWeight: 500 }}>
                    <span style={{ color: '#9AA69F' }}>{item.icon}</span>{item.label}
                  </Link>
                ))}
                <div style={{ borderTop: '1px solid #F5F7F4', marginTop: 4, paddingTop: 4 }}>
                  <button onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#C8443A', fontSize: '0.85rem', fontWeight: 500, width: '100%', textAlign: 'left' }}>
                    <LogOut size={13} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login"
              style={{ padding: '7px 14px', borderRadius: 8, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, color: '#5B6B63', border: '1px solid #E5E8E2', background: '#fff' }}>
              Sign In
            </Link>
            <Link to="/signup"
              style={{ padding: '7px 14px', borderRadius: 8, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg,#0E8F5B,#0B6E46)' }}>
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

