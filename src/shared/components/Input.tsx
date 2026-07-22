import * as React from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
}

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  hint?: string
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  hint?: string
  options?: string[]
  placeholder?: string
}

function FieldWrapper({ label, hint, required, children, id }: { label?: string; hint?: string; required?: boolean; children: React.ReactNode; id?: string }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {label && (
        <label htmlFor={id} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.90rem', fontWeight: 600, letterSpacing: '-0.01em', color: 'rgb(var(--color-text-rgb))' }}>
          {label}
          {required && <span style={{ color: 'rgb(var(--color-accent-warm-rgb))', fontWeight: 700 }}>*</span>}
        </label>
      )}
      {children}
      {hint && <small className="caption" style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.82rem', fontWeight: 450 }}>{hint}</small>}
    </div>
  )
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input({ label, hint, id, required, className, ...props }, ref) {
  const generatedId = React.useId()
  const inputId = id || generatedId
  return (
    <FieldWrapper label={label} hint={hint} required={required} id={inputId}>
      <input ref={ref} id={inputId} required={required} className={['input-base', className].filter(Boolean).join(' ')} {...props} />
    </FieldWrapper>
  )
})

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea({ label, hint, id, required, className, ...props }, ref) {
  const generatedId = React.useId()
  const inputId = id || generatedId
  return (
    <FieldWrapper label={label} hint={hint} required={required} id={inputId}>
      <textarea ref={ref} id={inputId} required={required} className={['input-base', className].filter(Boolean).join(' ')} {...props} />
    </FieldWrapper>
  )
})

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, hint, id, required, className, options, placeholder = 'Choisir…', children, ...props }, ref) {
  const generatedId = React.useId()
  const inputId = id || generatedId
  return (
    <FieldWrapper label={label} hint={hint} required={required} id={inputId}>
      <select ref={ref} id={inputId} required={required} className={['input-base', className].filter(Boolean).join(' ')} {...props}>
        <option value="">{placeholder}</option>
        {options?.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
        {children}
      </select>
    </FieldWrapper>
  )
})

export function FormRow({ children, cols = 2, className, ...props }: { children: React.ReactNode; cols?: 2 | 3; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} style={{ display: 'grid', gap: 16, gridTemplateColumns: cols === 3 ? 'repeat(3,1fr)' : 'repeat(2,1fr)', ...props.style } as any} {...props}>
      <style>{`@media (max-width: 640px) { .form-row-responsive { grid-template-columns: 1fr !important; } }`}</style>
      <div className="form-row-responsive" style={{ display: 'contents' }}>{children}</div>
    </div>
  )
}

// Choice card for radio/checkbox style
export function ChoiceCard({
  checked,
  children,
  onClick,
  type = 'checkbox',
}: {
  checked: boolean
  children: React.ReactNode
  onClick: () => void
  type?: 'checkbox' | 'radio'
}) {
  return (
    <div
      role={type}
      aria-checked={checked}
      data-checked={checked}
      className="choice-card"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      tabIndex={0}
    >
      <input type={type} checked={checked} readOnly tabIndex={-1} style={{ pointerEvents: 'none' }} />
      <span style={{ flex: 1 }}>{children}</span>
      {checked && (
        <span style={{ color: 'rgb(var(--color-accent-rgb))', display: 'grid' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
      )}
    </div>
  )
}
