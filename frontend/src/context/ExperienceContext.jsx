import { createContext, useContext, useState } from 'react'

const ExperienceContext = createContext(null)

export function ExperienceProvider({ children }) {
  const [mode, setMode] = useState('beginner')

  return (
    <ExperienceContext.Provider value={{ mode, setMode }}>
      {children}
    </ExperienceContext.Provider>
  )
}

export function useExperience() {
  return useContext(ExperienceContext)
}
