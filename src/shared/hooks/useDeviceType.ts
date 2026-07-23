import { useState, useEffect } from 'react'

export function useDeviceType() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => {
      const width = window.innerWidth
      const ua = navigator.userAgent || ''
      const isMobileAgent = /Mobile|Android|iPhone|iPad|iPod/i.test(ua)
      // Seuil raisonnable : moins de 768px = mobile, ou user agent mobile explicite
      setIsMobile(width < 768 || (isMobileAgent && width < 1024))
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return { isMobile }
}
