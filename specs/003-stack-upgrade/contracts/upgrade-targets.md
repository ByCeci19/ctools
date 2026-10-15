# Contrato: objetivos del upgrade

**Fecha**: 2026-10-15 | **Spec**: [spec.md](spec.md) | **Base verificada**: `ctools/package.json`, `ctools/vite.config.ts`, `ctools/src/routes.tsx`, `ctools/src/App.tsx`, `ctools/src/lib/pdf-render.ts`, `ctools/tailwind.config.js`, `ctools/postcss.config.js`, `.github/workflows/deploy.yml`.

Este contrato es la referencia de aceptación entre plan e implementación: la subida termina cuando cada fila está en su línea objetivo con las puertas G1–G3 en verde y sin tocar nada fuera del inventario.

## 1. Líneas objetivo de dependencias

| Paquete | Actual | Objetivo | Notas |
|---------|--------|----------|-------|
| `react` / `react-dom` | 18.3.1 | 19.3.x | Requisito del router v8 |
| `@types/react` / `@types/react-dom` | 18.3.x | línea 19 | — |
| `react-router-dom` | 6.28.0 | **eliminar** | Sustituido por `react-router` v8 (R1) |
| `react-router` | — | v8 | Imports desde `"react-router"` |
| `vite` | 6.0.0 | 8.3.x | Conserva `base './'`, `worker.format 'es'` |
| `@vitejs/plugin-react` | 4.3.4 | 5.x compatible | — |
| `tailwindcss` | 3.4.14 | 4.3.x | Vía `@tailwindcss/vite` (R4) |
| `@tailwindcss/vite` | — | 4.3.x | Nuevo |
| `autoprefixer` | 10.4.20 | **eliminar** | v4 lo gestiona solo |
| `postcss` | 8.4.47 | **eliminar** (salvo que otra dep. lo exija) | Sin pipeline PostCSS propio |
| `typescript` | ~5.6.2 | última estable 6.0.x/7.0.x | Estricto intacto (R6) |
| `vitest` | 3.2.7 | 5.0.x | Misma config `test` (R7) |
| `@testing-library/react` | 16.0.1 | línea 16 compatible React 19 | Soporte v19 confirmado (R7) |
| `jsdom` | 25.0.1 | compatible React 19 / Vitest 5 | — |
| `pdfjs-dist` | 4.2.67 | **6.x exigido** | Worker `?url` + `GlobalWorkerOptions` (R5) |
| `jspdf` | 2.5.1 | 3.x | API `jsPDF` usada en `src/lib/docx-to-pdf.ts` |
| `pdf-lib` | 1.17.1 | última compatible | API `PDFDocument` en `src/lib/pdf-engine.ts` |
| `docx` | 9.0.0 | última compatible | APIs `Document/Packer/...` en `src/lib/pdf-to-docx.ts` |
| `docx-preview` | 0.3.0 | última compatible | `renderAsync` en `src/lib/docx-to-pdf.ts` |
| `html2canvas` | 1.4.1 | última compatible | Default import en `src/lib/docx-to-pdf.ts` |
| `@dnd-kit/core` / `sortable` / `utilities` | 6.1 / 8.0 / 2.0 | últimas compatibles | Uso en `MergePage` + `FileCard` |
| `lucide-react` | 0.454.0 | última compatible | Iconos (`Menu/X/FileText/...`) |
| `react-dropzone` | 14.2.3 | última compatible | `Dropzone` + tests |

## 2. Inventario de ficheros (cerrado)

Cambian **solo**: `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.app.json`, `tsconfig.node.json`, `src/styles/tailwind.css`, `deploy.yml`, `src/App.tsx`, `src/routes.tsx`, `src/tools/dashboard/Dashboard.tsx`, `src/lib/pdf-render.ts` (condicional R5) y `ctools/tests/*` (adaptación). Se eliminan **solo**: `tailwind.config.js`, `postcss.config.js` (+ `autoprefixer`/`postcss` si quedan huérfanos). Todo lo demás es invariante (ver `data-model.md` §4).

## 3. Criterio de aceptación

G1 (`npm run build`), G2 (`npm test`), G3 (`npm ci`) en verde + G4–G7 verificadas. Cualquier diff visual/funcional en las 5 vistas, en móvil < 768 px o en avisos/comportamientos invariantes = regresión = contrato incumplido.
