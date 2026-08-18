import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App'
import theme from './theme'
import { ExperienceProvider } from './context/ExperienceContext'
import { IS_ANDROID } from './hooks/useIsAndroid'
import './index.css'

// ─── Lenis smooth scroll (Desktop + iOS only) ────────────────────────────────
// Android Chrome conflicts with Lenis: Lenis intercepts native scroll and
// re-dispatches it via rAF, which fights the GPU compositor thread on Android,
// causing jank. iOS WebKit handles this fine due to its rendering architecture.
// On Android we use native scroll (hardware-accelerated by the compositor).
if (!IS_ANDROID) {
  import('lenis').then(({ default: Lenis }) => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.8,
    })
    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  })
}
// ─────────────────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ExperienceProvider>
          <App />
        </ExperienceProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)

