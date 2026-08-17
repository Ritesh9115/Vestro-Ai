import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/common/ProtectedRoute'

// Existing pages
import LandingPage from './pages/LandingPage'
import ResearchLandingPage from './pages/ResearchLandingPage'
import DashboardPage from './pages/DashboardPage'
import LearnPage from './pages/LearnPage'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// New feature pages
import UserDashboardPage from './pages/UserDashboardPage'
import PortfolioPage from './pages/PortfolioPage'
import WatchlistPage from './pages/WatchlistPage'
import HistoryPage from './pages/HistoryPage'
import SavedReportsPage from './pages/SavedReportsPage'
import SimulatorPage from './pages/SimulatorPage'
import AnalyticsPage from './pages/AnalyticsPage'

// Page transition variants
const pageVariants = {
  initial:  { opacity: 0, y: 14 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
  exit:     { opacity: 0, y: -8,  transition: { duration: 0.18, ease: 'easeIn' } },
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: '100vh' }}
      >
        <Routes location={location}>
          {/* Existing routes — untouched */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/research" element={<ResearchLandingPage />} />
          <Route path="/research/:symbol" element={<DashboardPage />} />
          <Route path="/learn" element={<LearnPage />} />

          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected routes */}
          <Route path="/me"        element={<ProtectedRoute><UserDashboardPage /></ProtectedRoute>} />
          <Route path="/portfolio" element={<ProtectedRoute><PortfolioPage /></ProtectedRoute>} />
          <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
          <Route path="/history"   element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/reports"   element={<ProtectedRoute><SavedReportsPage /></ProtectedRoute>} />
          <Route path="/simulator" element={<ProtectedRoute><SimulatorPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontFamily: 'Inter,sans-serif', fontSize: '0.875rem', borderRadius: 10, boxShadow: '0 8px 32px rgba(15,33,26,0.12)' },
          success: { iconTheme: { primary: '#0E8F5B', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#C8443A', secondary: '#fff' } },
        }}
      />
      <div style={{ background: '#FBFBF8' }}>
        <Navbar />
        <AnimatedRoutes />
      </div>
    </AuthProvider>
  )
}

