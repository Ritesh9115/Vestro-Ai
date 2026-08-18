import { createContext, useContext, useState } from 'react'

const ExperienceContext = createContext(null)

export function ExperienceProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('vestro-mode') || 'beginner')
  const [aiLang, setAiLang] = useState(() => localStorage.getItem('vestro-lang') || 'en')

  const updateMode = (val) => { setMode(val); localStorage.setItem('vestro-mode', val) }
  const updateLang = (val) => { setAiLang(val); localStorage.setItem('vestro-lang', val) }

  return (
    <ExperienceContext.Provider value={{ mode, setMode: updateMode, aiLang, setAiLang: updateLang }}>
      {children}
    </ExperienceContext.Provider>
  )
}

export function useExperience() {
  return useContext(ExperienceContext)
}
