import React from 'react'
import { Languages } from 'lucide-react'
import { useExperience } from '../../context/ExperienceContext'

export default function AILangSelector() {
  const { aiLang, setAiLang } = useExperience()

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: '#F5F7F4',
        border: '1px solid #E5E8E2',
        borderRadius: 8,
        padding: '4px',
        gap: '4px',
      }}
    >
      <Languages size={14} color="#9AA69F" style={{ marginLeft: 4 }} />
      <button
        onClick={() => setAiLang('en')}
        style={{
          background: aiLang === 'en' ? '#fff' : 'transparent',
          border: 'none',
          borderRadius: 6,
          padding: '4px 10px',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: aiLang === 'en' ? '#0F211A' : '#5B6B63',
          cursor: 'pointer',
          boxShadow: aiLang === 'en' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
          transition: 'all 0.2s',
        }}
      >
        EN
      </button>
      <button
        onClick={() => setAiLang('hi')}
        style={{
          background: aiLang === 'hi' ? '#fff' : 'transparent',
          border: 'none',
          borderRadius: 6,
          padding: '4px 10px',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: aiLang === 'hi' ? '#0F211A' : '#5B6B63',
          cursor: 'pointer',
          boxShadow: aiLang === 'hi' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
          transition: 'all 0.2s',
        }}
      >
        HI
      </button>
    </div>
  )
}
