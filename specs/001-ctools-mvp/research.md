# Research: CTools MVP

**Feature**: `specs/001-ctools-mvp/spec.md` | **Date**: 2026-10-14

Todo el Technical Context venía resuelto por el input del plan + spec
clarificada; esta fase valida cada decisión y fija patrones de integración.

## R1. Base: Vite + React 18 + TypeScript

- **Decision**: SPA con Vite 5/6, React 18+ y TypeScript estricto.
- **Rationale**: Build 100% estática para GitHub Pages, HMR para iterar las
  4 herramientas, tipado exigido por la constitución V.
- **Alternatives considered**: Astro/Next (SSR innecesario, rompe
  estático puro), vanilla JS (no escala a suite modular).

## R2. Enrutamiento y base path para GitHub Pages

- **Decision**: `HashRouter` de `react-router-dom` + `base: './'` en
  `vite.config.ts`.
- **Rationale**: Con hash no hay 404 al refrescar en subrutas de Pages sin
  configuración de servidor (constitución II); base relativa hace que
  assets y workers carguen igual en `usuario.github.io/ctools/` o dominio
  propio.
- **Alternatives considered**: BrowserRouter + `404.html` hack (frágil,
  requiere duplicar `index.html`); rutas absolutas `/ctools/` (acoplan el
  nombre del repo).

## R3. Manipulación PDF: pdf-lib

- **Decision**: `pdf-lib` para unir (copiar páginas en orden) y eliminar
  páginas (copiar subconjunto).
- **Rationale**: Opera sobre bytes en memoria sin recomprimir contenido
  vectorial → "calidad original" (FR-013/FR-018); sin dependencias
  nativas, empaquetable por Vite.
- **Alternatives considered**: `pdf-merger-js` (wrapper que añade peso),
  manipulación vía impresión canvas (degrada vectores — rechazado).

## R4. Render y lectura PDF: pdfjs-dist + worker local

- **Decision**: `pdfjs-dist` para miniaturas en `<canvas>` y `getTextContent`
  para extracción; worker configurado con asset relativo:
  `new Worker(new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url))`
  o `?url` + `GlobalWorkerOptions.workerSrc`, verificado con `base: './'`.
- **Rationale**: Único motor maduro de render PDF en navegador; el worker
  evita congelar la UI con PDFs grandes (constitución IV, FR-023).
- **Alternatives considered**: Render en hilo principal (bloquea UI —
  rechazado), `pdfjs-dist/legacy` solo si el build moderno falla en
  Safari antiguo.

## R5. Drag & drop y carga

- **Decision**: `react-dropzone` para la zona de subida + `@dnd-kit/core` y
  `@dnd-kit/sortable` para reordenar tarjetas en Unir.
- **Rationale**: `react-dropzone` da validación por extensión y estados
  accesibles; dnd-kit es headless y funciona con teclado/táctil (mejor que
  HTML5 DnD nativo en móvil).
- **Alternatives considered**: DnD nativo HTML5 (sin soporte táctil ni
  accesibilidad — rechazado), `react-beautiful-dnd` (sin mantenimiento).

## R6. Conversión docx → pdf

- **Decision**: `docx-preview` renderiza el .docx a un contenedor A4 oculto
  con alta fidelidad; `html2canvas` captura por páginas A4 y `jspdf` las
  ensambla en el PDF descargable.
- **Rationale**: `docx-preview` conserva tablas, estilos, imágenes y
  márgenes mejor que reconstrucción manual; `jspdf`+`html2canvas` por
  separado (en vez del bundle `html2pdf.js`) dan control de paginado A4 y
  tree-shaking con Vite.
- **Alternatives considered**: `html2pdf.js` bundle (misma base, menos
  control de paginación), LibreOffice/WASM (pesado, ~100 MB, rompe la
  ligereza del MVP — rechazado), Mammoth (solo texto, pierde fidelidad).

## R7. Conversión pdf → docx

- **Decision**: `pdfjs-dist getTextContent` → agrupar items por coordenada Y
  (líneas), luego por X/saltos (párrafos); tamaño de fuente relativo para
  títulos; `saltos de página` por página PDF; librería `docx` (`Packer.toBlob`)
  para empaquetar; descarga con helper propio (Blob + anchor +
  `revokeObjectURL`), sin `file-saver`.
- **Rationale**: Agrupación por `transform` es el estándar de facto sin OCR;
  `docx` genera .docx válido en cliente; el helper propio centraliza la
  liberación de memoria (constitución IV) y evita una dependencia extra.
- **Alternatives considered**: `file-saver` (innecesario: 10 líneas con
  anchor cubren el caso), OCR/Tesseract (explícitamente fuera del MVP,
  FR-022).

## R8. Detección de PDF con contraseña y .doc legacy

- **Decision**: `pdf-lib`/`pdfjs-dist` lanzan error tipificado ante PDF
  cifrado → capturar y mostrar "error pidiendo PDF sin contraseña"
  (FR-008); `.doc` se rechaza por firma/extensión antes de parsear con
  aviso de guardar como .docx (FR-007).
- **Rationale**: Detección temprana sin bloquear la herramienta; el .doc
  binario antiguo no es parseable por `docx-preview`.
- **Alternatives considered**: Pedir contraseña al usuario (fuera del MVP
  por Assumptions), conversores .doc→.docx en cliente (no existen fiables).

## R9. Testing

- **Decision**: Vitest + React Testing Library para lógica pura
  (`range-parser`, `filenames`, agrupación de texto); la construcción
  `.docx` se valida por inspección de paquete en la e2e guiada (T043);
  flujos e2e cubiertos por guía manual `quickstart.md`.
- **Rationale**: Los motores puros son muy testeables; el render
  PDF/docx real y el empaquetado binario dependen de fixtures →
  validación guiada.
- **Alternatives considered**: Playwright e2e automatizado (diferido a
  post-MVP por coste de fixtures y CI).

## R10. Despliegue

- **Decision**: Workflow `.github/workflows/deploy.yml`: `npm ci` →
  `npm run build` → deploy de `dist` a Pages en push a `main`.
- **Rationale**: Patrón estándar con Actions oficiales; `dist` es autocontenido.
- **Alternatives considered**: `gh-pages` branch manual (más fricción),
  Netlify/Vercel (rompe requisito de Pages).
