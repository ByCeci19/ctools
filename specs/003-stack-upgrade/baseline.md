# Baseline pre-upgrade (T001)

**Fecha**: 2026-10-15 | **Rama**: `003-stack-upgrade` | **Referencia de comparación** para SC-002/SC-003 y T028.

## Entorno

- Node v22.23.2 · npm 10.9.8
- `react@18.3.1`, `react-router-dom@6.28.0`, `vite@6.0.0`, `tailwindcss@3.4.14` + `autoprefixer@10.4.20` + `postcss@8.4.47`, `typescript@~5.6.2`, `vitest@3.2.7`, `@vitejs/plugin-react@4.3.4`, `@testing-library/react@16.0.1`, `jsdom@25.0.1`
- `pdfjs-dist@4.2.67`, `jspdf@2.5.1`, `pdf-lib@1.17.1`, `docx@9.0.0`, `docx-preview@0.3.0`, `html2canvas@1.4.1`, `@dnd-kit/*@6.1/8.0/2.0`, `lucide-react@0.454.0`, `react-dropzone@14.2.3`

## Resultados (los 3 en verde, salida cero)

- `npm ci`: OK (solo aviso `npm audit`, sin errores).
- `npm test`: 6 ficheros, 39 tests, todos en verde (1.76 s).
- `npm run build`: `tsc --noEmit` + `vite build` OK en 6.60 s; `dist/` 3.7M (`index.html`, `favicon-c.svg`, `assets/`: worker PDF 1.38 MB, CSS 16.6 kB, JS principal 2.26 MB + 2 chunks).

## Avisos preexistentes (puntos de comparación post-upgrade)

- Tests: `Warning: Please use the 'legacy' build in Node.js environments` (pdfjs).
- Tests: `React Router Future Flag Warning` (`v7_startTransition`, `v7_relativeSplatPath`) — deben DESAPARECER con el router v8.
- Build: aviso de chunks > 500 kB (principal 2.26 MB) — informativo, sin acción (fuera de alcance FR-010).
