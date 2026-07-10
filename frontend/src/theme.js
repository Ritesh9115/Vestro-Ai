import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0E8F5B',
      dark: '#0B6E46',
      light: '#E4F5EC',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0F211A',
      light: '#5B6B63',
    },
    background: {
      default: '#FBFBF8',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F211A',
      secondary: '#5B6B63',
    },
    divider: '#E5E8E2',
    error: { main: '#C8443A' },
    warning: { main: '#B8862E' },
    success: { main: '#0E8F5B' },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: { fontFamily: "'Fraunces', serif", fontWeight: 600 },
    h2: { fontFamily: "'Fraunces', serif", fontWeight: 600 },
    h3: { fontFamily: "'Fraunces', serif", fontWeight: 600 },
    h4: { fontFamily: "'Inter', sans-serif", fontWeight: 600 },
    h5: { fontFamily: "'Inter', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Inter', sans-serif", fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 2px rgba(15,33,26,0.04), 0 4px 12px rgba(15,33,26,0.05)',
    '0 1px 4px rgba(15,33,26,0.06), 0 8px 24px rgba(15,33,26,0.08)',
    ...Array(22).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: '0.875rem',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0E8F5B 0%, #0B6E46 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #0B6E46 0%, #095939 100%)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: '1px solid #E5E8E2',
          boxShadow: '0 1px 2px rgba(15,33,26,0.04), 0 8px 24px rgba(15,33,26,0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 99, fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem' },
      },
    },
  },
})

export default theme
