import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base relativa: assets y workers cargan igual en `usuario.github.io/ctools/`
// o cualquier subruta de GitHub Pages (constitución II).
// El worker de PDF.js se referencia en `src/lib/pdf-render.ts` (T018) con
// `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)`;
// `worker.format: 'es'` lo empaqueta como módulo con ruta relativa.
export default defineConfig({
  base: './',
  plugins: [react()],
  worker: {
    format: 'es',
  },
})
