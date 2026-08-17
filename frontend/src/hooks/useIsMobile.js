import { useState, useEffect } from 'react'

/**
 * Returns true when viewport width is below the given breakpoint (default: 768px).
 * Recalculates on window resize.
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint)

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [breakpoint])

  return isMobile
}

export default useIsMobile
