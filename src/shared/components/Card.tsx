import * as React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

type CardProps = Omit<HTMLMotionProps<'div'>, 'children'> & {
  children: React.ReactNode
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
  asGlass?: boolean
}

const paddingMap = {
  none: {},
  sm: { padding: 20 },
  md: { padding: 'clamp(24px, 4vw, 32px)' },
  lg: { padding: 'clamp(28px, 5vw, 44px)' },
}

export function Card({
  children,
  hover = true,
  padding = 'lg',
  asGlass = true,
  className,
  style,
  ...props
}: CardProps) {
  const baseClass = asGlass ? 'glass-card' : ''
  const combinedClass = [baseClass, className].filter(Boolean).join(' ')

  return (
    <motion.div
      className={combinedClass}
      style={{ ...(paddingMap[padding] as any), ...style }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={hover ? { y: -2 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function CardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} style={{ display: 'grid', gap: 8, marginBottom: 24, ...props.style }} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} style={{ display: 'grid', gap: 18, ...props.style }} {...props}>
      {children}
    </div>
  )
}
