import { motion } from 'framer-motion'

type ProgressProps = {
  current: number
  total: number
  label?: string
  showPercent?: boolean
  className?: string
  size?: 'sm' | 'md'
}

export function Progress({ current, total, label, showPercent = true, className, size = 'md' }: ProgressProps) {
  const percent = Math.min(100, Math.max(0, Math.round((current / total) * 100)))
  const height = size === 'sm' ? 6 : 8

  return (
    <div className={className} style={{ display: 'grid', gap: 10 }}>
      <div className="progress-header">
        <span className="progress-label">
          {label || `Étape ${current} sur ${total}`}
        </span>
        {showPercent && <span className="progress-percent">{percent}%</span>}
      </div>
      <div className="progress-track" style={{ height }}>
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => {
        const index = i + 1
        const isActive = index === current
        const isPast = index < current
        return (
          <motion.div
            key={index}
            layout
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{
              scale: isActive ? 1.15 : 1,
              opacity: isPast || isActive ? 1 : 0.35,
              backgroundColor: isPast || isActive ? 'rgb(var(--color-accent-rgb))' : 'rgba(var(--color-surface-alt-rgb), 0.65)',
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{
              width: isActive ? 28 : 10,
              height: 10,
              borderRadius: 999,
              border: '1px solid var(--color-border)',
              boxShadow: isActive ? '0 0 14px rgba(var(--color-accent-rgb),0.45)' : undefined,
            }}
          />
        )
      })}
    </div>
  )
}
