import { defineConfig } from 'vitest/config'

// Tests unitaires du moteur de règles : TypeScript pur, pas besoin de DOM.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
