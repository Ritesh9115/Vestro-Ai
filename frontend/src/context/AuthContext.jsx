import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

// Auth routes that should NEVER trigger the 401 → refresh flow
const AUTH_ROUTES = ['/api/auth/login', '/api/auth/signup', '/api/auth/logout', '/api/auth/refresh']

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const isLoggingOut = useRef(false)

  // Attach token to all outgoing requests
  useEffect(() => {
    const interceptor = api.interceptors.request.use((config) => {
      const token = localStorage.getItem('vestro_access_token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })
    return () => api.interceptors.request.eject(interceptor)
  }, [])

  // Auto-refresh on 401 — but NOT for auth endpoints (prevents infinite loop)
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (res) => res,
      async (err) => {
        const originalRequest = err.config

        // Skip interceptor for auth routes and already-retried requests
        const isAuthRoute = AUTH_ROUTES.some((r) => originalRequest?.url?.includes(r))
        if (isAuthRoute || originalRequest?._retry || err.response?.status !== 401) {
          return Promise.reject(err)
        }

        originalRequest._retry = true
        try {
          const refreshToken = localStorage.getItem('vestro_refresh_token')
          if (!refreshToken) throw new Error('No refresh token')
          const res = await api.post('/api/auth/refresh', { refreshToken })
          const { accessToken, refreshToken: newRefreshToken } = res.data
          localStorage.setItem('vestro_access_token', accessToken)
          localStorage.setItem('vestro_refresh_token', newRefreshToken)
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        } catch {
          // Refresh failed — clear session without making another API call
          localStorage.removeItem('vestro_access_token')
          localStorage.removeItem('vestro_refresh_token')
          setUser(null)
        }
        return Promise.reject(err)
      }
    )
    return () => api.interceptors.response.eject(interceptor)
  }, [])

  // Restore session on mount
  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem('vestro_access_token')
      if (!token) { setLoading(false); return }
      try {
        const res = await api.get('/api/auth/me')
        setUser(res.data.user)
      } catch {
        localStorage.removeItem('vestro_access_token')
        localStorage.removeItem('vestro_refresh_token')
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
  }, [])

  const login = useCallback((userData, accessToken, refreshToken) => {
    localStorage.setItem('vestro_access_token', accessToken)
    localStorage.setItem('vestro_refresh_token', refreshToken)
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    // Guard against re-entrant calls (caused by the 401 interceptor loop)
    if (isLoggingOut.current) return
    isLoggingOut.current = true

    const refreshToken = localStorage.getItem('vestro_refresh_token')
    // Only call logout API if we actually have a session to invalidate
    if (refreshToken) {
      try {
        await api.post('/api/auth/logout', { refreshToken })
      } catch { /* ignore — server-side session cleanup is best-effort */ }
    }

    localStorage.removeItem('vestro_access_token')
    localStorage.removeItem('vestro_refresh_token')
    setUser(null)
    isLoggingOut.current = false
  }, [])

  const updateUser = useCallback((updates) => {
    setUser((prev) => prev ? { ...prev, ...updates } : prev)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

