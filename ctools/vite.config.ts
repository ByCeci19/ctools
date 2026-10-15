import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Base relativa: assets y workers cargan igual en `usuario.github.io/ctools/`
// o cualquier subruta de GitHub Pages (constitución II).
// El worker de PDF.js se referencia en `src/lib/pdf-render.ts` con
// `import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'`;
// `worker.format: 'es'` lo empaqueta como módulo con ruta relativa.
export default defineConfig({
  base: './',
  plugins: [react()],
  worker: {
    format: 'es',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
})
