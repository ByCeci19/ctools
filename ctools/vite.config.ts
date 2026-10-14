import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// NOTE (T002): añadir `base: './'` y el worker de PDF.js como asset relativo.
export default defineConfig({
  plugins: [react()],
})
