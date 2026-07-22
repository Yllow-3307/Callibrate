import { motion } from 'framer-motion'
import { useTheme } from '../hooks/useTheme'

export function ThemeToggle({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const { theme, toggle, mounted, isDark } = useTheme()

  if (!mounted) {
    return (
      <div className={className} style={style}>
        <div className="theme-toggle-btn" aria-hidden style={{ opacity: 0.6 }}>
          <div className="theme-toggle-thumb" />
        </div>
      </div>
    )
  }

  return (
    <div className={['theme-toggle-wrap', className].filter(Boolean).join(' ')} style={style}>
      <motion.button
        className="theme-toggle-btn"
        onClick={toggle}
        aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
        title={isDark ? 'Mode clair' : 'Mode sombre'}
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <motion.div
          className="theme-toggle-thumb"
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {isDark ? (
            // Moon icon
            <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            // Sun icon
            <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          )}
        </motion.div>
      </motion.button>
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>
        Thème actuel : {theme}
      </span>
    </div>
  )
}
