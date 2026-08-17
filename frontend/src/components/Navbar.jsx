import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BookOpen, BarChart2, Eye, Zap, Clock, Star,
  BarChart, User, LogOut, ChevronDown, Search, Menu, X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useIsMobile } from '../hooks/useIsMobile'
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
  const isMobile = useIsMobile()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setDropdownOpen(false)
  }, [location.pathname])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  // Hide Navbar on auth pages — AFTER all hooks
  const isAuthPage = ['/login', '/signup', '/forgot-password'].some((p) => location.pathname.startsWith(p)) || location.pathname.startsWith('/reset-password')
  if (isAuthPage) return null

  async function handleLogout() {
    await logout()
    toast.success('Logged out')
    navigate('/')
    setDropdownOpen(false)
    setMobileMenuOpen(false)
  }

  const allLinks = user ? [...NAV_LINKS, ...AUTH_LINKS] : NAV_LINKS

  return (
    <>
      <nav
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E5E8E2',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '0 16px' : '0 32px',
          height: 60,
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <img
            src="/logo.png"
            alt="Vestro AI"
            style={{ height: 36, width: 'auto', objectFit: 'contain' }}
          />
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '1.1rem', color: '#0F211A', letterSpacing: '-0.01em' }}>Vestro AI</span>
        </Link>

        {/* Desktop Nav links */}
        {!isMobile && (
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
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Desktop: User dropdown or Sign In/Up */}
          {!isMobile && (
            <>
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
                        { to: '/me',      label: 'Dashboard',    icon: <User size={13} /> },
                        { to: '/history', label: 'History',       icon: <Clock size={13} /> },
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
            </>
          )}

          {/* Mobile: avatar (if logged in) + hamburger */}
          {isMobile && user && (
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#0E8F5B,#0B6E46)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0F211A', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}
        </div>
      </nav>

      {/* ── Mobile full-screen drawer ── */}
      {isMobile && mobileMenuOpen && (
        <div style={{
          position: 'fixed', top: 60, left: 0, right: 0, bottom: 0,
          background: '#fff', zIndex: 49, overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
          borderTop: '1px solid #E5E8E2',
        }}>
          {/* Nav links */}
          <div style={{ padding: '16px 16px 0' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9AA69F', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Navigation</p>
            {allLinks.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path
              return (
                <Link key={path} to={path}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 12px', borderRadius: 12, textDecoration: 'none',
                    fontSize: '1rem', fontWeight: 600,
                    color: isActive ? '#0E8F5B' : '#0F211A',
                    background: isActive ? '#E4F5EC' : 'transparent',
                    marginBottom: 4,
                  }}>
                  <Icon size={18} color={isActive ? '#0E8F5B' : '#5B6B63'} />
                  {label}
                </Link>
              )
            })}
          </div>

          {/* User section */}
          {user ? (
            <div style={{ padding: '16px', borderTop: '1px solid #F0F2F0', marginTop: 8 }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9AA69F', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Account</p>
              <div style={{ background: '#F5F7F4', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F211A', margin: 0 }}>{user.name}</p>
                <p style={{ color: '#9AA69F', fontSize: '0.78rem', margin: '3px 0 0' }}>{user.email}</p>
              </div>
              {[
                { to: '/me',      label: 'Dashboard',    icon: <User size={16} /> },
                { to: '/history', label: 'History',       icon: <Clock size={16} /> },
                { to: '/reports', label: 'Saved Reports', icon: <Star size={16} /> },
              ].map((item) => (
                <Link key={item.to} to={item.to}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 12px', borderRadius: 10, textDecoration: 'none', color: '#0F211A', fontSize: '0.95rem', fontWeight: 500, marginBottom: 4 }}>
                  <span style={{ color: '#5B6B63' }}>{item.icon}</span>{item.label}
                </Link>
              ))}
              <button onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 12px', borderRadius: 10, background: '#FBEAE8', border: 'none', cursor: 'pointer', color: '#C8443A', fontSize: '0.95rem', fontWeight: 600, width: '100%', marginTop: 8 }}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          ) : (
            <div style={{ padding: '16px', borderTop: '1px solid #F0F2F0', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/login"
                style={{ display: 'block', padding: '13px', borderRadius: 12, textDecoration: 'none', fontSize: '1rem', fontWeight: 600, color: '#0F211A', border: '1px solid #E5E8E2', textAlign: 'center', background: '#fff' }}>
                Sign In
              </Link>
              <Link to="/signup"
                style={{ display: 'block', padding: '13px', borderRadius: 12, textDecoration: 'none', fontSize: '1rem', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#0E8F5B,#0B6E46)', textAlign: 'center' }}>
                Get Started — Free
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  )
}
