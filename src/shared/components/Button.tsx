import * as React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

type Variant = 'primary' | 'secondary' | 'warm' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  variant?: Variant
  size?: Size
  isLoading?: boolean
  children: React.ReactNode
}

const variantClass: Record<Variant, string> = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  warm: 'btn btn-warm',
  ghost: 'btn btn-ghost',
}

const sizeStyle: Record<Size, React.CSSProperties> = {
  sm: { minHeight: 38, padding: '0 16px', fontSize: '0.86rem' },
  md: {},
  lg: { minHeight: 52, padding: '0 28px', fontSize: '1.02rem' },
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const combinedStyle = { ...sizeStyle[size], ...style }

  return (
    <motion.button
      className={variantClass[variant]}
      style={combinedStyle}
      disabled={disabled || isLoading}
      whileTap={{ scale: variant === 'ghost' ? 0.97 : 0.97 }}
      whileHover={disabled || isLoading ? undefined : { y: variant !== 'ghost' ? -1 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.4 }}
      {...props}
    >
      {isLoading ? (
        <>
          <span
            style={{
              width: 16,
              height: 16,
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.7s linear infinite',
            }}
          />
          {children}
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}

export function ButtonGroup({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        flexWrap: 'wrap',
        ...(props.style as any),
      }}
      {...props}
    >
      {children}
    </div>
  )
}
