import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import LearnPage from './pages/LearnPage'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#FBFBF8' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/research/:symbol" element={<DashboardPage />} />
        <Route path="/learn" element={<LearnPage />} />
      </Routes>
    </div>
  )
}
