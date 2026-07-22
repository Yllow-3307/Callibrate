/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-background-rgb) / <alpha-value>)',
        surface: 'rgb(var(--color-surface-rgb) / <alpha-value>)',
        'surface-alt': 'rgb(var(--color-surface-alt-rgb) / <alpha-value>)',
        accent: 'rgb(var(--color-accent-rgb) / <alpha-value>)',
        'accent-warm': 'rgb(var(--color-accent-warm-rgb) / <alpha-value>)',
        text: 'rgb(var(--color-text-rgb) / <alpha-value>)',
        'text-muted': 'var(--color-text-muted)',
        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
      },
      fontFamily: {
        sans: ['Bricolage Grotesque', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Bricolage Grotesque', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        '4xl': '32px',
      },
      boxShadow: {
        glass: 'var(--shadow-glass)',
        'neo-accent': 'var(--shadow-neo-accent)',
        'neo-warm': 'var(--shadow-neo-warm)',
        'neo-accent-hover': 'var(--shadow-neo-accent-hover)',
      },
      backdropBlur: {
        glass: '18px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
      },
    },
  },
  plugins: [],
}
