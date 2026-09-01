import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

/*
  Configuración de las pruebas, aparte de `vite.config.ts`.

  El alias `@` se repite aquí a propósito: Vitest no lee los plugins de Vite
  que resuelven rutas, así que sin esto todos los `import '@/helpers'` fallan.
*/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    /* `jsdom` da un DOM de mentira para poder renderizar componentes. */
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/pruebas/preparar.ts'],
    include: ['src/**/*.prueba.{ts,tsx}'],
  },
})
