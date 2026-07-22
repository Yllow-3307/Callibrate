import { useEffect, useState, useCallback } from 'react'

type Theme = 'dark' | 'light'
const STORAGE_KEY = 'callibrate-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
  if (stored === 'dark' || stored === 'light') return stored
  // Default is dark per spec
  return 'dark'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Apply initial theme immediately to prevent FOUC
    const initial = getInitialTheme()
    document.documentElement.setAttribute('data-theme', initial)
    // Also support .dark/.light class for Tailwind
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(initial)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
    localStorage.setItem(STORAGE_KEY, theme)

    // Optional meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#1B2727' : '#F5F3F0')
    } else {
      const m = document.createElement('meta')
      m.name = 'theme-color'
      m.content = theme === 'dark' ? '#1B2727' : '#F5F3F0'
      document.head.appendChild(m)
    }
  }, [theme, mounted])

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const setLight = useCallback(() => setTheme('light'), [])
  const setDark = useCallback(() => setTheme('dark'), [])

  return {
    theme,
    mounted,
    toggle,
    setLight,
    setDark,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  }
}

// Simple provider-less hook for system sync if user doesn't have preference yet
export function useSystemThemeSync(enabled = false) {
  useEffect(() => {
    if (!enabled) return
    if (localStorage.getItem(STORAGE_KEY)) return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const handler = (e: MediaQueryListEvent) => {
      const next: Theme = e.matches ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', next)
      document.documentElement.classList.remove('dark', 'light')
      document.documentElement.classList.add(next)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [enabled])
}
